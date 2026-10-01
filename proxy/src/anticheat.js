// Anti-cheat for Not So Weekly Shorts boards (PROXY.md, "Anti-cheat"). A run shows only if
// the game's own physics, replaying its inputs, crosses every checkpoint and the finish on
// the frame it claims, and only if it reached Kodub through this proxy. Runs already on a
// board the first time it is seen here ("legacy") stay up while they are checked once in
// the background. The owner's runs skip every check.
//
// Kacky event: a run that reached Kodub some other way ("outside", i.e. not driven on the
// site) is flagged rather than hidden. It is saved with its recording for the moderation
// page and replayed like any other run, and the Worker shows it only to the player who drove
// it (OFFSITE_RUNS = "shadow") or to everyone (OFFSITE_RUNS = "public").

import { DurableObject } from "cloudflare:workers";
import physicsModule from "./sim/physics.wasm";
import mathModule from "./sim/math.wasm";
import initData from "./sim/init.bin";
import { Simulator, readInit } from "./sim/run-check.js";

const CHECK_BATCH = 8;
const RETRY_MS = 60_000;
const LOG_LIMIT = 60;

export class RunChecker extends DurableObject {
    async check(track, recording, frames) {
        this.simulator ??= new Simulator(physicsModule, mathModule, readInit(initData));
        return this.simulator.check(track, recording, frames);
    }
}

export class AntiCheat extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.sql = ctx.storage.sql;
        // track id -> { cutoff, runs: Map(id -> { state, source }), passes: Map("user|frames" -> state) }
        this.boards = new Map();
        this.payloads = new Map();
        ctx.blockConcurrencyWhile(async () => this.migrate());
    }

    migrate() {
        this.sql.exec(`CREATE TABLE IF NOT EXISTS tracks (
            id TEXT PRIMARY KEY, week INTEGER, payload TEXT NOT NULL, updated INTEGER NOT NULL)`);
        this.sql.exec(`CREATE TABLE IF NOT EXISTS boards (
            track TEXT PRIMARY KEY, week INTEGER, cutoff INTEGER NOT NULL, seen INTEGER NOT NULL)`);
        // state: valid | invalid | pending. source: proxy | legacy | outside | approved.
        this.sql.exec(`CREATE TABLE IF NOT EXISTS runs (
            id INTEGER PRIMARY KEY, track TEXT NOT NULL, week INTEGER, user_id TEXT, nickname TEXT,
            frames INTEGER, state TEXT NOT NULL, source TEXT NOT NULL, reason TEXT, at INTEGER NOT NULL)`);
        this.sql.exec("CREATE INDEX IF NOT EXISTS runs_track ON runs(track)");
        // Runs this proxy let through, recorded before they are sent so a board read can't
        // mistake them for outside uploads.
        this.sql.exec(`CREATE TABLE IF NOT EXISTS passes (
            track TEXT NOT NULL, user_id TEXT NOT NULL, frames INTEGER NOT NULL, state TEXT NOT NULL, at INTEGER NOT NULL,
            PRIMARY KEY (track, user_id, frames)) WITHOUT ROWID`);
        this.sql.exec(`CREATE TABLE IF NOT EXISTS rejects (
            key TEXT PRIMARY KEY, track TEXT, week INTEGER, user_id TEXT, nickname TEXT, frames INTEGER,
            reason TEXT, first INTEGER NOT NULL, last INTEGER NOT NULL, attempts INTEGER NOT NULL)`);
        this.sql.exec(`CREATE TABLE IF NOT EXISTS queue (
            qid INTEGER PRIMARY KEY AUTOINCREMENT, run_id INTEGER, track TEXT NOT NULL, week INTEGER,
            user_id TEXT, nickname TEXT, frames INTEGER NOT NULL, recording TEXT, added INTEGER NOT NULL)`);
        // Moderation (the owner's moderation page): banned accounts and single removed runs.
        this.sql.exec(`CREATE TABLE IF NOT EXISTS bans (
            user_id TEXT PRIMARY KEY, nickname TEXT, reason TEXT, at INTEGER NOT NULL)`);
        this.sql.exec(`CREATE TABLE IF NOT EXISTS removed (
            id INTEGER PRIMARY KEY, track TEXT, user_id TEXT, nickname TEXT, frames INTEGER, reason TEXT, at INTEGER NOT NULL)`);
        // Every run seen that wasn't driven on the site, kept even after it leaves the board.
        // replay: pending | valid | invalid (the game's physics replaying its inputs).
        this.sql.exec(`CREATE TABLE IF NOT EXISTS flagged (
            id INTEGER PRIMARY KEY, track TEXT NOT NULL, week INTEGER, user_id TEXT, nickname TEXT,
            country TEXT, frames INTEGER NOT NULL, recording TEXT, replay TEXT NOT NULL, replay_reason TEXT,
            first_seen INTEGER NOT NULL, last_seen INTEGER NOT NULL)`);
        this.sql.exec("CREATE INDEX IF NOT EXISTS flagged_track ON flagged(track)");
        // Standings: one small summary per event map (see eventSummaries in worker.js).
        this.sql.exec("CREATE TABLE IF NOT EXISTS event_summaries (track TEXT PRIMARY KEY, at INTEGER NOT NULL, data TEXT NOT NULL)");
    }

    // Banned user ids and removed run ids, cached until the next moderation change.
    moderationSets() {
        if (!this.mod) {
            this.mod = {
                bans: new Set(this.sql.exec("SELECT user_id FROM bans").toArray().map((r) => r.user_id)),
                removed: new Set(this.sql.exec("SELECT id FROM removed").toArray().map((r) => r.id)),
            };
        }
        return this.mod;
    }

    async moderation() {
        return {
            bans: this.sql.exec("SELECT * FROM bans ORDER BY at DESC").toArray(),
            removed: this.sql.exec("SELECT * FROM removed ORDER BY at DESC").toArray(),
        };
    }

    async ban(r) {
        this.sql.exec(`INSERT OR REPLACE INTO bans (user_id, nickname, reason, at) VALUES (?, ?, ?, ?)`,
            r.userId, r.nickname ?? null, r.reason ?? null, Date.now());
        this.mod = null;
        return { ok: true };
    }

    async unban(userId) {
        this.sql.exec("DELETE FROM bans WHERE user_id = ?", userId);
        this.mod = null;
        return { ok: true };
    }

    async removeRun(r) {
        this.sql.exec(`INSERT OR REPLACE INTO removed (id, track, user_id, nickname, frames, reason, at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            r.id, r.track ?? null, r.userId ?? null, r.nickname ?? null, r.frames ?? null, r.reason ?? null, Date.now());
        this.mod = null;
        return { ok: true };
    }

    async restoreRun(id) {
        this.sql.exec("DELETE FROM removed WHERE id = ?", id);
        this.mod = null;
        return { ok: true };
    }

    // Which of these recording ids belong to event runs (recordings of those are never served).
    async eventRunIds(ids) {
        const found = [];
        for (const id of ids) {
            const row = this.sql.exec("SELECT user_id FROM runs WHERE id = ?", id).toArray()[0];
            if (row) found.push({ id, userId: row.user_id });
        }
        return found;
    }

    // The flagged (not driven on site) runs, newest first, without their recordings.
    async flaggedRuns() {
        return this.sql.exec(`SELECT f.id, f.track, f.user_id, f.nickname, f.country, f.frames, f.replay, f.replay_reason,
                f.first_seen, f.last_seen, (f.recording IS NOT NULL AND f.recording != '') AS saved, r.source
            FROM flagged f LEFT JOIN runs r ON r.id = f.id ORDER BY f.first_seen DESC`).toArray();
    }

    async flaggedRecording(id) {
        return this.sql.exec("SELECT id, track, nickname, frames, recording FROM flagged WHERE id = ?", id).toArray()[0] ?? null;
    }

    flag(track, week, e) {
        const now = Date.now();
        this.sql.exec(`INSERT INTO flagged (id, track, week, user_id, nickname, country, frames, replay, first_seen, last_seen)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)
            ON CONFLICT(id) DO UPDATE SET last_seen = excluded.last_seen, nickname = excluded.nickname`,
            e.id, track, week, e.userId ?? null, e.nickname ?? null, e.countryCode ?? null, e.frames, now, now);
    }

    // The stored standings summaries, by track id.
    async eventSummaries() {
        const out = {};
        for (const row of this.sql.exec("SELECT track, at, data FROM event_summaries")) {
            try {
                out[row.track] = { ...JSON.parse(row.data), at: row.at };
            } catch {
                /* unreadable row: it is simply refreshed */
            }
        }
        return out;
    }

    async saveEventSummaries(list) {
        for (const s of list) {
            this.sql.exec(`INSERT INTO event_summaries (track, at, data) VALUES (?, ?, ?)
                ON CONFLICT(track) DO UPDATE SET at = excluded.at, data = excluded.data`, s.trackId, s.at, JSON.stringify(s));
        }
    }

    // After moderation: every summary is refreshed before it is trusted again.
    async staleEventSummaries() {
        this.sql.exec("UPDATE event_summaries SET at = 0");
    }

    // Kacky event: validation runs. The runs already on a map's own Kodub board when the
    // site first reads it (ids up to `cutoff`) are the map makers' validation runs: the
    // Worker never shows them and takes the fastest as the map's author time. `keep` are
    // the runs at or below the cutoff that are ordinary runs after all (driven on the site,
    // or approved by the owner); `removed` are the ones the owner removed.
    async baseline(track, week, maxRealId) {
        this.sql.exec("INSERT OR IGNORE INTO boards (track, week, cutoff, seen) VALUES (?, ?, ?, ?)", track, week, maxRealId, Date.now());
        const cutoff = this.sql.exec("SELECT cutoff FROM boards WHERE track = ?", track).one().cutoff;
        const keep = this.sql.exec("SELECT id FROM runs WHERE track = ? AND id <= ? AND source IN ('proxy', 'approved')", track, cutoff).toArray().map((r) => r.id);
        const removed = this.sql.exec("SELECT id FROM removed WHERE track = ?", track).toArray().map((r) => r.id);
        return { cutoff, keep, removed };
    }

    // Takes every run now on the maps' own Kodub boards as the validation runs (the owner's
    // "re-read validation runs" button, for just before the event starts). All of them are
    // hidden from the site, including ones earlier let in as normal runs, and earlier
    // removals are forgotten, so the fastest run on each board is the author time.
    async rebaseline(list) {
        for (const b of list) {
            this.sql.exec(`INSERT INTO boards (track, week, cutoff, seen) VALUES (?, ?, ?, ?)
                ON CONFLICT(track) DO UPDATE SET cutoff = excluded.cutoff, seen = excluded.seen`, b.track, b.week, b.cutoff, Date.now());
            this.sql.exec("DELETE FROM runs WHERE track = ? AND id <= ?", b.track, b.cutoff);
            this.sql.exec("DELETE FROM queue WHERE track = ? AND run_id <= ?", b.track, b.cutoff);
            this.sql.exec("DELETE FROM removed WHERE track = ? AND id <= ?", b.track, b.cutoff);
            this.sql.exec("DELETE FROM flagged WHERE track = ? AND id <= ?", b.track, b.cutoff);
            this.boards.delete(b.track);
        }
        this.mod = null;
        return { ok: true, tracks: list.length };
    }

    // Every run the anti-cheat has seen on one board, with where it came from:
    // proxy = driven and uploaded on the site, outside = uploaded some other way (hidden),
    // legacy = already on the board before the proxy first saw it, approved = allowed by hand.
    async runs(track) {
        return this.sql.exec(`SELECT id, user_id, nickname, frames, state, source, reason, at FROM runs
            WHERE track = ? ORDER BY frames`, track).toArray();
    }

    board(track, week, entries) {
        let board = this.boards.get(track);
        if (board) return board;
        let row = this.sql.exec("SELECT cutoff FROM boards WHERE track = ?", track).toArray()[0];
        if (!row) {
            // Everything on the board the first time it is seen here counts as legacy.
            const cutoff = entries.reduce((max, e) => (Number.isSafeInteger(e.id) && e.id > max ? e.id : max), 0);
            this.sql.exec("INSERT OR IGNORE INTO boards (track, week, cutoff, seen) VALUES (?, ?, ?, ?)", track, week, cutoff, Date.now());
            row = this.sql.exec("SELECT cutoff FROM boards WHERE track = ?", track).one();
        }
        board = { cutoff: row.cutoff, runs: new Map(), passes: new Map() };
        for (const r of this.sql.exec("SELECT id, state, source FROM runs WHERE track = ?", track)) {
            board.runs.set(r.id, { state: r.state, source: r.source });
        }
        for (const p of this.sql.exec("SELECT user_id, frames, state FROM passes WHERE track = ?", track)) {
            board.passes.set(p.user_id + "|" + p.frames, p.state);
        }
        this.boards.set(track, board);
        return board;
    }

    saveRun(track, week, entry, state, source, reason) {
        this.sql.exec(`INSERT OR REPLACE INTO runs (id, track, week, user_id, nickname, frames, state, source, reason, at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            entry.id, track, week, entry.userId ?? null, entry.nickname ?? null, entry.frames, state, source, reason ?? null, Date.now());
        const run = { state, source };
        this.boards.get(track)?.runs.set(entry.id, run);
        return run;
    }

    enqueue(runId, track, week, entry, recording) {
        this.sql.exec(`INSERT INTO queue (run_id, track, week, user_id, nickname, frames, recording, added)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            runId, track, week, entry.userId ?? null, entry.nickname ?? null, entry.frames, recording ?? null, Date.now());
    }

    // blocked: ids of the entries on this board that must not be shown to anyone.
    // flagged: [id, userId] of the runs not driven on the site (see the top of this file).
    async classify(track, week, entries, ownerUserIds) {
        const owners = new Set(ownerUserIds);
        const board = this.board(track, week, entries);
        const blocked = [];
        const flagged = [];
        const mod = this.moderationSets();
        let queued = false;
        for (const e of entries) {
            // Moderation beats everything, the owner's own runs included.
            if (mod.bans.has(e.userId) || mod.removed.has(e.id)) {
                blocked.push(e.id);
                continue;
            }
            if (!Number.isSafeInteger(e.id) || e.id <= 0 || owners.has(e.userId)) continue;
            let run = board.runs.get(e.id);
            if (!run) {
                const pass = board.passes.get(e.userId + "|" + e.frames);
                if (pass) {
                    run = this.saveRun(track, week, e, pass, "proxy");
                } else if (e.id <= board.cutoff) {
                    run = this.saveRun(track, week, e, "pending", "legacy");
                    this.enqueue(e.id, track, week, e, null);
                    queued = true;
                } else {
                    // Not driven on the site: flag it, save it, and replay it for the record.
                    run = this.saveRun(track, week, e, "pending", "outside", "not-driven-on-site");
                    this.flag(track, week, e);
                    this.enqueue(e.id, track, week, e, null);
                    queued = true;
                }
            }
            if (run.source === "outside") flagged.push([e.id, e.userId ?? ""]);
            // Kacky event: runs already on a board before the site first saw it stay hidden
            // until the owner approves them on the moderation page.
            else if (run.source === "legacy") blocked.push(e.id);
            else if (run.state === "invalid" || run.state === "pending") blocked.push(e.id);
        }
        if (queued) await this.kick();
        return { blocked, flagged };
    }

    payload(track) {
        if (this.payloads.has(track)) return this.payloads.get(track);
        const row = this.sql.exec("SELECT payload FROM tracks WHERE id = ?", track).toArray()[0];
        const payload = row ? JSON.parse(row.payload) : null;
        if (payload) this.payloads.set(track, payload);
        return payload;
    }

    // Before a submission is checked: a run already rejected is refused without replaying it.
    async prepareSubmit(track, key) {
        const rejected = this.sql.exec("SELECT 1 FROM rejects WHERE key = ?", key).toArray().length > 0;
        if (rejected) {
            this.sql.exec("UPDATE rejects SET attempts = attempts + 1, last = ? WHERE key = ?", Date.now(), key);
            return { rejected: true, payload: null };
        }
        return { rejected: false, payload: this.payload(track) };
    }

    async reject(r) {
        const now = Date.now();
        this.sql.exec(`INSERT INTO rejects (key, track, week, user_id, nickname, frames, reason, first, last, attempts)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            ON CONFLICT(key) DO UPDATE SET attempts = attempts + 1, last = excluded.last`,
            r.key, r.track, r.week, r.userId, r.nickname, r.frames, r.reason, now, now);
    }

    // Called before the run is sent upstream. state is "valid", or "pending" when the track
    // hasn't been synced yet and the run will be checked once it is.
    async expect(r) {
        this.sql.exec(`INSERT INTO passes (track, user_id, frames, state, at) VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(track, user_id, frames) DO UPDATE SET state = excluded.state, at = excluded.at`,
            r.track, r.userId, r.frames, r.state, Date.now());
        this.boards.get(r.track)?.passes.set(r.userId + "|" + r.frames, r.state);
    }

    async confirm(r) {
        const entry = { id: r.uploadId, userId: r.userId, nickname: r.nickname, frames: r.frames };
        if (Number.isSafeInteger(r.uploadId) && r.uploadId > 0) this.saveRun(r.track, r.week, entry, r.state, "proxy");
        if (r.state === "pending") {
            this.enqueue(Number.isSafeInteger(r.uploadId) ? r.uploadId : null, r.track, r.week, entry, r.recording);
            await this.kick();
        }
    }

    async kick() {
        if ((await this.ctx.storage.getAlarm()) == null) await this.ctx.storage.setAlarm(Date.now() + 100);
    }

    async fetchRecordings(ids) {
        const found = new Map();
        if (!ids.length) return found;
        const upstream = this.env.UPSTREAM || "https://vps.kodub.com";
        const origin = this.env.UPSTREAM_ORIGIN || "https://www.kodub.com";
        const url = new URL("/v6/recordings", upstream);
        url.searchParams.set("version", "0.6.2");
        url.searchParams.set("ids", ids.join(","));
        const response = await fetch(url.toString(), { headers: { Origin: origin, Referer: origin + "/" } });
        if (!response.ok) throw new Error("recordings " + response.status);
        const list = await response.json();
        if (!Array.isArray(list)) throw new Error("recordings: not a list");
        ids.forEach((id, i) => found.set(id, typeof list[i]?.recording === "string" ? list[i].recording : null));
        return found;
    }

    finish(item, result) {
        const state = result.valid ? "valid" : "invalid";
        const source = item.run_id != null
            ? this.sql.exec("SELECT source FROM runs WHERE id = ?", item.run_id).toArray()[0]?.source
            : null;
        if (source === "outside") {
            // Stays flagged whatever the replay says; the verdict is only evidence.
            this.sql.exec("UPDATE runs SET state = ?, at = ? WHERE id = ?", state, Date.now(), item.run_id);
            this.sql.exec("UPDATE flagged SET replay = ?, replay_reason = ? WHERE id = ?", state, result.reason ?? null, item.run_id);
            const run = this.boards.get(item.track)?.runs.get(item.run_id);
            if (run) run.state = state;
            this.sql.exec("DELETE FROM queue WHERE qid = ?", item.qid);
            return;
        }
        if (item.run_id != null) {
            this.sql.exec("UPDATE runs SET state = ?, reason = ?, at = ? WHERE id = ?", state, result.reason ?? null, Date.now(), item.run_id);
            const run = this.boards.get(item.track)?.runs.get(item.run_id);
            if (run) run.state = state;
        }
        if (item.user_id) {
            if (result.valid) {
                this.sql.exec("UPDATE passes SET state = 'valid' WHERE track = ? AND user_id = ? AND frames = ?", item.track, item.user_id, item.frames);
            } else {
                this.sql.exec("DELETE FROM passes WHERE track = ? AND user_id = ? AND frames = ?", item.track, item.user_id, item.frames);
            }
            const passes = this.boards.get(item.track)?.passes;
            const key = item.user_id + "|" + item.frames;
            if (passes?.has(key)) result.valid ? passes.set(key, "valid") : passes.delete(key);
        }
        this.sql.exec("DELETE FROM queue WHERE qid = ?", item.qid);
    }

    // Saves the recording of every flagged run as soon as it is seen, whether or not its track
    // has been synced yet, so it is kept even if the player later replaces the run.
    async saveFlaggedRecordings() {
        const ids = this.sql.exec("SELECT id FROM flagged WHERE recording IS NULL ORDER BY id LIMIT ?", CHECK_BATCH)
            .toArray().map((r) => r.id);
        if (!ids.length) return false;
        const found = await this.fetchRecordings(ids);
        for (const id of ids) {
            const recording = found.get(id);
            if (recording != null) {
                this.sql.exec("UPDATE flagged SET recording = ? WHERE id = ?", recording, id);
            } else {
                // Already gone upstream: note it and stop asking.
                this.sql.exec(`UPDATE flagged SET recording = '', replay_reason = COALESCE(replay_reason, 'no-recording')
                    WHERE id = ?`, id);
            }
        }
        return true;
    }

    async alarm() {
        try {
            if (await this.saveFlaggedRecordings()) {
                await this.ctx.storage.setAlarm(Date.now() + 50);
                return;
            }
        } catch (err) {
            console.error("anti-cheat: saving flagged recordings failed:", err && err.message);
            await this.ctx.storage.setAlarm(Date.now() + RETRY_MS);
        }
        const items = this.sql.exec(`SELECT * FROM queue WHERE track IN (SELECT id FROM tracks)
            ORDER BY qid LIMIT ?`, CHECK_BATCH).toArray();
        if (!items.length) return;
        let recordings;
        try {
            recordings = await this.fetchRecordings(items.filter((i) => i.recording == null && i.run_id != null).map((i) => i.run_id));
        } catch (err) {
            console.error("anti-cheat: fetching recordings failed:", err && err.message);
            await this.ctx.storage.setAlarm(Date.now() + RETRY_MS);
            return;
        }
        const checker = this.env.RUN_CHECKER.get(this.env.RUN_CHECKER.idFromName("main"));
        for (const item of items) {
            const saved = item.run_id != null
                ? this.sql.exec("SELECT recording FROM flagged WHERE id = ?", item.run_id).toArray()[0]?.recording
                : null;
            const recording = item.recording ?? (saved || recordings.get(item.run_id)) ?? null;
            const result = recording == null
                ? { valid: false, reason: "no-recording" }
                : await checker.check(this.payload(item.track), recording, item.frames);
            this.finish(item, result);
        }
        await this.ctx.storage.setAlarm(Date.now() + 50);
    }

    async putTracks(tracks) {
        const now = Date.now();
        for (const t of tracks) {
            this.sql.exec(`INSERT INTO tracks (id, week, payload, updated) VALUES (?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET week = excluded.week, payload = excluded.payload, updated = excluded.updated`,
                t.id, t.week, JSON.stringify(t.payload), now);
            this.payloads.delete(t.id);
        }
        await this.kick();
        return { stored: tracks.length };
    }

    async approve(id, info) {
        let row = this.sql.exec("SELECT track FROM runs WHERE id = ?", id).toArray()[0];
        if (!row && info?.track) {
            // A validation run the owner lets in as an ordinary run: it has no row yet.
            this.board(info.track, info.week ?? null, []);
            this.saveRun(info.track, info.week ?? null, { id, userId: info.userId, nickname: info.nickname, frames: info.frames ?? 0 }, "valid", "approved");
            return { ok: true };
        }
        if (!row) return { ok: false };
        this.sql.exec("UPDATE runs SET state = 'valid', source = 'approved', reason = NULL, at = ? WHERE id = ?", Date.now(), id);
        this.sql.exec("DELETE FROM queue WHERE run_id = ?", id);
        const run = this.boards.get(row.track)?.runs.get(id);
        if (run) Object.assign(run, { state: "valid", source: "approved" });
        return { ok: true };
    }

    async summary() {
        const tracks = this.sql.exec("SELECT id, week, updated FROM tracks ORDER BY week, id").toArray();
        const counts = this.sql.exec("SELECT source, state, COUNT(*) AS n FROM runs GROUP BY source, state").toArray();
        const queue = this.sql.exec(`SELECT COUNT(*) AS n,
                COALESCE(SUM(CASE WHEN track IN (SELECT id FROM tracks) THEN 0 ELSE 1 END), 0) AS waiting
            FROM queue`).one();
        const rejects = this.sql.exec("SELECT * FROM rejects ORDER BY last DESC LIMIT ?", LOG_LIMIT).toArray();
        const rejectTotals = this.sql.exec("SELECT COUNT(*) AS runs, COALESCE(SUM(attempts), 0) AS attempts FROM rejects").one();
        const blocked = this.sql.exec(`SELECT id, track, week, user_id, nickname, frames, source, reason, at FROM runs
            WHERE state = 'invalid' ORDER BY at DESC LIMIT ?`, LOG_LIMIT).toArray();
        const boards = this.sql.exec("SELECT COUNT(*) AS n FROM boards").one().n;
        return { tracks, counts, queue, rejects, rejectTotals, blocked, boards };
    }
}
