// Site traffic for the owner dashboard. One Durable Object ("global") holds it all in
// SQLite. Visitors are random ids the page makes up; no token or IP is ever stored.

import { DurableObject } from "cloudflare:workers";

// Everything is summed into 10-minute buckets: `t` is epoch seconds / BUCKET_S.
const BUCKET_S = 600;
const DAY_MS = 86_400_000;
// No beat may claim more time than this, however long it has been since the last one.
const MAX_BEAT_S = 400;
// A session counts as online until its promised next beat is this late.
const LIVE_GRACE_MS = 45_000;
const MINUTE_RING = 180;
const STATS_TTL_MS = 30_000;
// New sessions allowed per IP address per hour. Schools share one address, so it is generous.
const OPENS_PER_IP_HOUR = 120;

const EVENT_NAMES = ["attempts", "finishes", "uploads", "replays", "clips", "editor", "garage", "standings"];
const STATES = new Set(["menu", "race", "editor", "watch", "garage"]);

const RANGES = {
    day: { ms: DAY_MS, step: 600 },
    "3d": { ms: 3 * DAY_MS, step: 1800 },
    week: { ms: 7 * DAY_MS, step: 3600 },
    month: { ms: 30 * DAY_MS, step: 6 * 3600 },
    all: { ms: null, step: 86_400 },
};

const SESSION_LENGTHS = [60, 300, 900, 1800, 3600, 7200];

function clampNumber(value, max) {
    const n = Number(value);
    return Number.isFinite(n) && n > 0 ? Math.min(n, max) : 0;
}

function tally(map, key, runtime) {
    const k = key || "?";
    const row = map.get(k) ?? { key: k, opens: 0, runtime: 0 };
    row.opens++;
    row.runtime += runtime;
    map.set(k, row);
}

function topRows(map, limit) {
    return [...map.values()].sort((a, b) => b.opens - a.opens || b.runtime - a.runtime).slice(0, limit);
}

export class TrafficStats extends DurableObject {
    constructor(ctx, env) {
        super(ctx, env);
        this.sql = ctx.storage.sql;
        this.online = new Map();
        // Most players online in each recent minute, oldest first: [minute, count].
        this.ring = [];
        this.statsCache = new Map();
        // IP -> { hour, opens }, only in memory; addresses are never written to storage.
        this.opensByIp = new Map();
        ctx.blockConcurrencyWhile(async () => {
            this.migrate();
            this.restoreLive();
        });
    }

    migrate() {
        this.sql.exec(`CREATE TABLE IF NOT EXISTS buckets (
            t INTEGER PRIMARY KEY,
            runtime REAL NOT NULL DEFAULT 0, focus REAL NOT NULL DEFAULT 0, driving REAL NOT NULL DEFAULT 0,
            opens INTEGER NOT NULL DEFAULT 0, new_visitors INTEGER NOT NULL DEFAULT 0, peak INTEGER NOT NULL DEFAULT 0,
            attempts INTEGER NOT NULL DEFAULT 0, finishes INTEGER NOT NULL DEFAULT 0, uploads INTEGER NOT NULL DEFAULT 0,
            replays INTEGER NOT NULL DEFAULT 0, clips INTEGER NOT NULL DEFAULT 0, editor INTEGER NOT NULL DEFAULT 0,
            garage INTEGER NOT NULL DEFAULT 0, standings INTEGER NOT NULL DEFAULT 0)`);
        this.sql.exec(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY, visitor TEXT NOT NULL, start INTEGER NOT NULL, last INTEGER NOT NULL,
            runtime REAL NOT NULL DEFAULT 0, focus REAL NOT NULL DEFAULT 0, driving REAL NOT NULL DEFAULT 0,
            attempts INTEGER NOT NULL DEFAULT 0, finishes INTEGER NOT NULL DEFAULT 0, ended INTEGER NOT NULL DEFAULT 0,
            repeat_visit INTEGER NOT NULL DEFAULT 0, nickname TEXT, country TEXT, device TEXT, os TEXT, browser TEXT,
            referrer TEXT, site TEXT)`);
        this.sql.exec("CREATE INDEX IF NOT EXISTS sessions_start ON sessions(start)");
        this.sql.exec(`CREATE TABLE IF NOT EXISTS visitors (
            id TEXT PRIMARY KEY, first INTEGER NOT NULL, last INTEGER NOT NULL, opens INTEGER NOT NULL DEFAULT 0)`);
        this.sql.exec("CREATE TABLE IF NOT EXISTS minutes (m INTEGER PRIMARY KEY, online INTEGER NOT NULL)");
        this.sql.exec(`CREATE TABLE IF NOT EXISTS track_days (
            day INTEGER NOT NULL, track TEXT NOT NULL, attempts INTEGER NOT NULL DEFAULT 0,
            finishes INTEGER NOT NULL DEFAULT 0, uploads INTEGER NOT NULL DEFAULT 0,
            PRIMARY KEY (day, track)) WITHOUT ROWID`);
    }

    // The in-memory list of who is online is lost when the object is evicted.
    restoreLive() {
        const now = Date.now();
        this.ring = this.sql.exec("SELECT m, online FROM minutes WHERE m > ? ORDER BY m",
            Math.floor(now / 60_000) - MINUTE_RING).toArray().map((r) => [r.m, r.online]);
        const rows = this.sql.exec(
            "SELECT * FROM sessions WHERE start > ? AND last > ? AND ended = 0",
            now - 2 * DAY_MS, now - MAX_BEAT_S * 1000).toArray();
        for (const row of rows) {
            this.online.set(row.id, {
                id: row.id, visitor: row.visitor, start: row.start, last: row.last,
                expires: row.last + MAX_BEAT_S * 1000, runtime: row.runtime, ended: false,
                nickname: row.nickname, country: row.country, device: row.device, os: row.os,
                browser: row.browser, site: row.site, state: "menu", track: null,
            });
        }
    }

    onlineCount(now) {
        let n = 0;
        for (const s of this.online.values()) if (!s.ended && s.expires > now) n++;
        return n;
    }

    noteMinute(now, online) {
        const minute = Math.floor(now / 60_000);
        const last = this.ring[this.ring.length - 1];
        if (last && last[0] === minute) {
            if (online <= last[1]) return;
            last[1] = online;
        } else {
            this.ring.push([minute, online]);
            while (this.ring.length > MINUTE_RING) this.ring.shift();
            this.sql.exec("DELETE FROM minutes WHERE m <= ?", minute - MINUTE_RING);
        }
        this.sql.exec("INSERT OR REPLACE INTO minutes (m, online) VALUES (?, ?)", minute, online);
    }

    allowOpen(ip, now) {
        if (!ip) return true;
        const hour = Math.floor(now / 3_600_000);
        const entry = this.opensByIp.get(ip);
        if (!entry || entry.hour !== hour) {
            if (this.opensByIp.size > 5000) this.opensByIp.clear();
            this.opensByIp.set(ip, { hour, opens: 1 });
            return true;
        }
        return ++entry.opens <= OPENS_PER_IP_HOUR;
    }

    openSession(b, meta, now) {
        const visitor = this.sql.exec("SELECT first FROM visitors WHERE id = ?", b.v).toArray()[0];
        const isNew = !visitor;
        if (isNew) this.sql.exec("INSERT INTO visitors (id, first, last, opens) VALUES (?, ?, ?, 1)", b.v, now, now);
        else this.sql.exec("UPDATE visitors SET last = ?, opens = opens + 1 WHERE id = ?", now, b.v);
        const start = now - b.rt * 1000;
        this.sql.exec(`INSERT INTO sessions (id, visitor, start, last, repeat_visit, nickname, country, device, os, browser, referrer, site)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            b.s, b.v, start, start, isNew ? 0 : 1, b.nick, meta.country, meta.device, meta.os, meta.browser, b.ref, meta.site);
        return {
            session: {
                id: b.s, visitor: b.v, start, last: start, expires: 0, runtime: 0, ended: false,
                nickname: b.nick, country: meta.country, device: meta.device, os: meta.os,
                browser: meta.browser, site: meta.site, state: "menu", track: null,
            },
            isNew,
        };
    }

    async beat(b, meta) {
        const now = Date.now();
        let s = this.online.get(b.s);
        let opened = false;
        let isNew = false;
        if (!s) {
            const row = this.sql.exec("SELECT * FROM sessions WHERE id = ?", b.s).toArray()[0];
            if (row) {
                // Another visitor's session id is never taken over.
                if (row.visitor !== b.v) return;
                s = {
                    id: row.id, visitor: row.visitor, start: row.start, last: row.last, expires: 0,
                    runtime: row.runtime, ended: false, nickname: row.nickname, country: row.country,
                    device: row.device, os: row.os, browser: row.browser, site: row.site, state: "menu", track: null,
                };
            } else {
                if (!this.allowOpen(meta.ip, now)) return;
                ({ session: s, isNew } = this.openSession(b, meta, now));
                opened = true;
            }
            this.online.set(b.s, s);
        } else if (s.visitor !== b.v) {
            return;
        }

        const sinceLast = Math.max(0, (now - s.last) / 1000);
        const runtime = opened ? 0 : Math.min(b.rt, sinceLast + 15, MAX_BEAT_S);
        const focus = Math.min(b.ft, runtime);
        const driving = Math.min(b.dt, runtime);

        s.last = now;
        s.runtime += runtime;
        s.ended = !!b.end;
        s.expires = now + b.nx * 1000 + LIVE_GRACE_MS;
        if (b.nick) s.nickname = b.nick;
        if (b.st) s.state = b.st;
        s.track = b.tk;

        const ev = b.ev;
        this.sql.exec(`UPDATE sessions SET last = ?, runtime = runtime + ?, focus = focus + ?, driving = driving + ?,
            attempts = attempts + ?, finishes = finishes + ?, ended = ?, nickname = COALESCE(?, nickname) WHERE id = ?`,
            now, runtime, focus, driving, ev.attempts, ev.finishes, s.ended ? 1 : 0, b.nick, b.s);

        const online = this.onlineCount(now);
        this.noteMinute(now, online);
        const t = Math.floor(now / 1000 / BUCKET_S);
        this.sql.exec(`INSERT INTO buckets (t, runtime, focus, driving, opens, new_visitors, peak,
                attempts, finishes, uploads, replays, clips, editor, garage, standings)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(t) DO UPDATE SET runtime = runtime + excluded.runtime, focus = focus + excluded.focus,
                driving = driving + excluded.driving, opens = opens + excluded.opens,
                new_visitors = new_visitors + excluded.new_visitors, peak = MAX(peak, excluded.peak),
                attempts = attempts + excluded.attempts, finishes = finishes + excluded.finishes,
                uploads = uploads + excluded.uploads, replays = replays + excluded.replays,
                clips = clips + excluded.clips, editor = editor + excluded.editor,
                garage = garage + excluded.garage, standings = standings + excluded.standings`,
            t, runtime, focus, driving, opened ? 1 : 0, isNew ? 1 : 0, online,
            ev.attempts, ev.finishes, ev.uploads, ev.replays, ev.clips, ev.editor, ev.garage, ev.standings);

        const day = Math.floor(now / DAY_MS);
        for (const [track, [attempts, finishes, uploads]] of b.tr) {
            this.sql.exec(`INSERT INTO track_days (day, track, attempts, finishes, uploads) VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(day, track) DO UPDATE SET attempts = attempts + excluded.attempts,
                    finishes = finishes + excluded.finishes, uploads = uploads + excluded.uploads`,
                day, track, attempts, finishes, uploads);
        }

        for (const [id, other] of this.online) {
            if (other.ended || other.expires < now - 10 * 60_000) this.online.delete(id);
        }
    }

    // Unflushed seconds of everyone online, so the dashboard's running total is exact.
    liveView(now) {
        const sessions = [];
        let pending = 0;
        for (const s of this.online.values()) {
            if (s.ended || s.expires <= now) continue;
            pending += Math.min((now - s.last) / 1000, MAX_BEAT_S);
            sessions.push({
                nickname: s.nickname, country: s.country, device: s.device, os: s.os, browser: s.browser,
                site: s.site, state: s.state, track: s.track, since: s.start,
            });
        }
        sessions.sort((a, b) => a.since - b.since);
        const minute = Math.floor(now / 60_000);
        const ring = this.ring.filter(([m]) => m > minute - MINUTE_RING);
        return { online: sessions.length, pending, sessions, ring, now };
    }

    async liveStats() {
        const now = Date.now();
        const view = this.liveView(now);
        const totals = this.sql.exec(
            "SELECT COALESCE(SUM(runtime), 0) AS runtime, COALESCE(SUM(opens), 0) AS opens FROM buckets").one();
        return { ...view, totalRuntime: totals.runtime, totalOpens: totals.opens };
    }

    async stats(rangeKey, tzOffsetMin) {
        const range = RANGES[rangeKey] ?? RANGES.day;
        const tz = Math.max(-840, Math.min(840, Math.trunc(tzOffsetMin) || 0)) * 60;
        const cacheKey = rangeKey + "|" + tz;
        const hit = this.statsCache.get(cacheKey);
        const now = Date.now();
        if (hit && now - hit.at < STATS_TTL_MS) return { ...hit.data, live: await this.liveStats() };

        const data = this.computeStats(range, tz, now);
        this.statsCache.set(cacheKey, { at: now, data });
        return { ...data, live: await this.liveStats() };
    }

    computeStats(range, tz, now) {
        const startMs = range.ms == null ? 0 : now - range.ms;
        const startT = Math.floor(startMs / 1000 / BUCKET_S);
        const step = range.step;

        const series = this.sql.exec(`SELECT CAST((t * ${BUCKET_S} + ?) / ? AS INTEGER) AS g,
                SUM(runtime) AS runtime, SUM(focus) AS focus, SUM(driving) AS driving, SUM(opens) AS opens,
                SUM(new_visitors) AS newVisitors, MAX(peak) AS peak, SUM(attempts) AS attempts,
                SUM(finishes) AS finishes, SUM(uploads) AS uploads
            FROM buckets WHERE t >= ? GROUP BY g ORDER BY g`, tz, step, startT).toArray();

        const totals = this.sql.exec(`SELECT COALESCE(SUM(runtime), 0) AS runtime, COALESCE(SUM(focus), 0) AS focus,
                COALESCE(SUM(driving), 0) AS driving, COALESCE(SUM(opens), 0) AS opens,
                COALESCE(SUM(new_visitors), 0) AS newVisitors, COALESCE(MAX(peak), 0) AS peak,
                COALESCE(SUM(attempts), 0) AS attempts, COALESCE(SUM(finishes), 0) AS finishes,
                COALESCE(SUM(uploads), 0) AS uploads, COALESCE(SUM(replays), 0) AS replays,
                COALESCE(SUM(clips), 0) AS clips, COALESCE(SUM(editor), 0) AS editor,
                COALESCE(SUM(garage), 0) AS garage, COALESCE(SUM(standings), 0) AS standings
            FROM buckets WHERE t >= ?`, startT).one();

        // Sunday = 0. Epoch day 0 was a Thursday.
        const heat = this.sql.exec(`SELECT (CAST((t * ${BUCKET_S} + ?) / 86400 AS INTEGER) + 4) % 7 AS wd,
                CAST(((t * ${BUCKET_S} + ?) % 86400) / 3600 AS INTEGER) AS h, SUM(runtime) AS runtime, SUM(opens) AS opens
            FROM buckets WHERE t >= ? GROUP BY wd, h`, tz, tz, startT).toArray();

        const firstBucket = this.sql.exec("SELECT MIN(t) AS t FROM buckets").one().t;
        const peakEver = this.sql.exec("SELECT t, peak FROM buckets ORDER BY peak DESC, t ASC LIMIT 1").toArray()[0] ?? null;
        const busiestDay = this.sql.exec(`SELECT CAST((t * ${BUCKET_S} + ?) / 86400 AS INTEGER) AS d, SUM(runtime) AS runtime, SUM(opens) AS opens
            FROM buckets GROUP BY d ORDER BY runtime DESC LIMIT 1`, tz).toArray()[0] ?? null;
        const visitorsEver = this.sql.exec("SELECT COUNT(*) AS n FROM visitors").one().n;

        const countries = new Map();
        const devices = new Map();
        const oses = new Map();
        const browsers = new Map();
        const referrers = new Map();
        const sites = new Map();
        const players = new Map();
        const uniques = new Map();
        const lengths = new Array(SESSION_LENGTHS.length + 1).fill(0);
        const visitors = new Set();
        let returningOpens = 0;
        let sessionCount = 0;
        let longest = null;

        for (const s of this.sql.exec(`SELECT visitor, start, runtime, focus, driving, attempts, finishes, repeat_visit,
                nickname, country, device, os, browser, referrer, site FROM sessions WHERE start >= ?`, startMs)) {
            sessionCount++;
            visitors.add(s.visitor);
            if (s.repeat_visit) returningOpens++;
            tally(countries, s.country, s.runtime);
            tally(devices, s.device, s.runtime);
            tally(oses, s.os, s.runtime);
            tally(browsers, s.browser, s.runtime);
            tally(referrers, s.referrer || "direct", s.runtime);
            tally(sites, s.site, s.runtime);

            let i = 0;
            while (i < SESSION_LENGTHS.length && s.runtime >= SESSION_LENGTHS[i]) i++;
            lengths[i]++;
            if (!longest || s.runtime > longest.runtime) {
                longest = { runtime: s.runtime, start: s.start, nickname: s.nickname, country: s.country };
            }

            const p = players.get(s.visitor) ?? {
                nickname: null, country: null, opens: 0, runtime: 0, driving: 0, attempts: 0, finishes: 0, lastSeen: 0,
            };
            p.opens++;
            p.runtime += s.runtime;
            p.driving += s.driving;
            p.attempts += s.attempts;
            p.finishes += s.finishes;
            if (s.start >= p.lastSeen) {
                p.lastSeen = s.start;
                if (s.nickname) p.nickname = s.nickname;
                if (s.country) p.country = s.country;
            }
            players.set(s.visitor, p);

            const g = Math.floor((s.start / 1000 + tz) / step);
            let set = uniques.get(g);
            if (!set) uniques.set(g, (set = new Set()));
            set.add(s.visitor);
        }

        const tracks = this.sql.exec(`SELECT track, SUM(attempts) AS attempts, SUM(finishes) AS finishes, SUM(uploads) AS uploads
            FROM track_days WHERE day >= ? GROUP BY track ORDER BY attempts DESC, finishes DESC LIMIT 20`,
            Math.floor(startMs / DAY_MS)).toArray();

        const nowG = Math.floor((now / 1000 + tz) / step);
        let firstG;
        if (range.ms != null) firstG = Math.floor((startMs / 1000 + tz) / step);
        else if (firstBucket != null) firstG = Math.floor((firstBucket * BUCKET_S + tz) / step);
        else firstG = nowG;

        return {
            range: { step, firstG, nowG, tz, start: startMs },
            series,
            uniques: [...uniques].map(([g, set]) => [g, set.size]),
            totals: { ...totals, sessions: sessionCount, visitors: visitors.size, returningOpens },
            heat,
            lengths: { edges: SESSION_LENGTHS, counts: lengths },
            countries: topRows(countries, 25),
            devices: topRows(devices, 6),
            oses: topRows(oses, 8),
            browsers: topRows(browsers, 8),
            referrers: topRows(referrers, 12),
            sites: topRows(sites, 6),
            players: [...players.values()].sort((a, b) => b.runtime - a.runtime).slice(0, 25),
            tracks,
            records: {
                firstSeen: firstBucket == null ? null : firstBucket * BUCKET_S * 1000,
                peak: peakEver ? { online: peakEver.peak, at: peakEver.t * BUCKET_S * 1000 } : null,
                busiestDay: busiestDay ? { day: busiestDay.d, runtime: busiestDay.runtime, opens: busiestDay.opens } : null,
                longest,
                visitorsEver,
            },
        };
    }
}

// Validates a beat from the page. Returns null for anything malformed.
export function readBeat(text) {
    if (typeof text !== "string" || text.length > 4096) return null;
    let raw;
    try {
        raw = JSON.parse(text);
    } catch {
        return null;
    }
    if (!raw || typeof raw !== "object") return null;
    const id = /^[0-9a-f]{32}$/;
    if (!id.test(raw.s ?? "") || !id.test(raw.v ?? "")) return null;

    const ev = {};
    for (const name of EVENT_NAMES) ev[name] = Math.floor(clampNumber(raw.ev?.[name], 500));

    const tr = [];
    if (raw.tr && typeof raw.tr === "object") {
        for (const [track, counts] of Object.entries(raw.tr).slice(0, 30)) {
            if (!/^[0-9a-f]{64}$/.test(track) || !Array.isArray(counts)) continue;
            const c = [0, 1, 2].map((i) => Math.floor(clampNumber(counts[i], 500)));
            if (c[0] || c[1] || c[2]) tr.push([track, c]);
        }
    }

    const text64 = (value, max) => {
        if (typeof value !== "string") return null;
        const clean = value.replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, max);
        return clean || null;
    };
    const ref = text64(raw.ref, 64);

    return {
        s: raw.s,
        v: raw.v,
        rt: clampNumber(raw.rt, MAX_BEAT_S),
        ft: clampNumber(raw.ft, MAX_BEAT_S),
        dt: clampNumber(raw.dt, MAX_BEAT_S),
        nx: Math.max(20, Math.min(360, clampNumber(raw.nx, 360) || 60)),
        end: raw.end === 1 || raw.end === true,
        nick: text64(raw.nick, 40),
        ref: ref && /^[a-z0-9.-]+$/i.test(ref) ? ref.toLowerCase() : null,
        st: STATES.has(raw.st) ? raw.st : null,
        tk: typeof raw.tk === "string" && /^[0-9a-f]{64}$/.test(raw.tk) ? raw.tk : null,
        ev,
        tr,
    };
}

// Coarse labels only; the raw user agent is never stored.
export function describeClient(request) {
    const ua = request.headers.get("User-Agent") || "";
    let os = "Other";
    if (/CrOS/.test(ua)) os = "ChromeOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Macintosh|Mac OS X/.test(ua)) os = "macOS";
    else if (/Linux/.test(ua)) os = "Linux";

    let browser = "Other";
    if (/Edg\//.test(ua)) browser = "Edge";
    else if (/OPR\/|Opera/.test(ua)) browser = "Opera";
    else if (/Firefox\/|FxiOS/.test(ua)) browser = "Firefox";
    else if (/SamsungBrowser/.test(ua)) browser = "Samsung";
    else if (/Chrome\/|CriOS/.test(ua)) browser = "Chrome";
    else if (/Safari\//.test(ua)) browser = "Safari";

    let device = "Desktop";
    if (/iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua))) device = "Tablet";
    else if (/Mobi|iPhone|iPod/.test(ua)) device = "Phone";

    const country = request.cf?.country;
    return {
        os,
        browser,
        device,
        country: typeof country === "string" && /^[A-Z]{2}$/.test(country) ? country : null,
    };
}
