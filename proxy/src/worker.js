// NSWS leaderboard proxy; PROXY.md explains what it hides and why. Never log request
// URLs or bodies: both can carry a player's userToken, which is an account secret.

import { TrafficStats, readBeat, describeClient } from "./traffic.js";
import { AntiCheat, RunChecker } from "./anticheat.js";

export { TrafficStats, AntiCheat, RunChecker };

const DEFAULT_UPSTREAM = "https://vps.kodub.com";
const DEFAULT_UPSTREAM_ORIGIN = "https://www.kodub.com";
const DEFAULT_ALLOWED_ORIGINS = ["https://brinleyww.github.io"];
const DEFAULT_VERSION = "0.6.2";

// Only these path prefixes are forwarded, so the Worker can't be used as an
// open relay to arbitrary hosts.
const ALLOWED_PREFIXES = ["/v6/"];

// Edge cache TTLs (seconds) for passed-through GETs; anything unlisted is never cached.
// Never add an endpoint whose URL carries a userToken, such as `user`.
const CACHE_TTL = {
    "/v6/recordings": 3600, // recordings are addressed by immutable id
};

// Upstream refuses to return more than this many entries per request.
const PAGE_SIZE = 500;
// How far into a leaderboard the Worker reads to find banned players and the
// caller's own entry. Community boards are a few hundred runs, so they are read
// whole. Official tracks can have far larger boards; past what is read there,
// ranks are corrected only for the bans found in the part that was read.
const SCAN_LIMIT_COMMUNITY = 5000;
const SCAN_LIMIT_OTHER = PAGE_SIZE;
const BOARD_TTL_MS = 10_000;
const BOARD_CACHE_MAX = 64;
// Shorter than this, TRACK_SALT could be guessed, so it is ignored.
const MIN_SALT_LENGTH = 16;
const OWNER_KEY_PREFIX = "nsws-owner:";
const TRAFFIC_PREFIX = "/nsws/";
const MAX_TRAFFIC_BODY = 4096;
const MAX_TRACK_SYNC_BODY = 400_000;
// How long a Worker instance reuses a board's anti-cheat verdicts. Any entry it hasn't
// seen yet is always classified at once.
const ANTICHEAT_TTL_MS = 15_000;

// Track ids, user tokens and token hashes are all 64 lowercase hex characters.
const HEX64 = /^[0-9a-f]{64}$/;

// Headers we must not pass upstream: hop-by-hop, Cloudflare-injected, our own
// site's cookies, and the Origin/Referer pair we replace ourselves.
const STRIP_REQUEST_HEADERS = new Set([
    "host", "origin", "referer", "cookie", "connection", "keep-alive",
    "transfer-encoding", "upgrade-insecure-requests", "content-length",
]);

class BadRequest extends Error {}

class UpstreamError extends Error {
    constructor(status) {
        super("Upstream answered " + status);
        this.status = status;
    }
}

// A list var may be a TOML array, a JSON array string, or a comma-separated string.
function listVar(value, fallback) {
    if (value == null || value === "") return fallback;
    if (Array.isArray(value)) return value.map(String);
    const text = String(value).trim();
    if (text.startsWith("[")) {
        try {
            const parsed = JSON.parse(text);
            if (Array.isArray(parsed)) return parsed.map(String);
        } catch {
            /* not JSON - read it as comma-separated */
        }
    }
    return text.split(",").map((s) => s.trim()).filter(Boolean);
}

function intVar(value) {
    if (value == null || value === "") return null;
    const n = Number(value);
    return Number.isSafeInteger(n) ? n : null;
}

function normalizeNickname(name) {
    return String(name ?? "").trim().toLowerCase();
}

function hashSet(value) {
    return new Set(listVar(value, []).map((h) => h.trim().toLowerCase()).filter((h) => HEX64.test(h)));
}

let warnedShortSalt = false;

function readConfig(env) {
    const salt = typeof env.TRACK_SALT === "string" ? env.TRACK_SALT : "";
    if (salt && salt.length < MIN_SALT_LENGTH && !warnedShortSalt) {
        warnedShortSalt = true;
        console.warn("TRACK_SALT is shorter than " + MIN_SALT_LENGTH + " characters and is being ignored");
    }
    return {
        upstream: env.UPSTREAM || DEFAULT_UPSTREAM,
        upstreamOrigin: env.UPSTREAM_ORIGIN || DEFAULT_UPSTREAM_ORIGIN,
        // Browsers send the Origin's host in lowercase, whatever case the list was typed in.
        allowedOrigins: listVar(env.ALLOWED_ORIGINS, DEFAULT_ALLOWED_ORIGINS).map((o) => o.trim().toLowerCase().replace(/\/+$/, "")),
        banned: new Set(listVar(env.BANNED_NICKNAMES, []).map(normalizeNickname)),
        publicNicknames: new Set(listVar(env.PUBLIC_NICKNAMES, []).map(normalizeNickname)),
        // The real Author Medal account(s). When set, anyone else using a PUBLIC_NICKNAMES name
        // is hidden, so nobody can set the medals or dodge the standings by renaming themselves.
        authorIds: hashSet(env.AUTHOR_USER_IDS),
        currentWeek: intVar(env.CURRENT_WEEK),
        hiddenFromWeek: intVar(env.HIDDEN_FROM_WEEK),
        trackSalt: salt.length >= MIN_SALT_LENGTH ? salt : null,
        // Kacky event: times stay visible, only other players' recordings are withheld.
        hideTimes: String(env.HIDE_TIMES ?? "false").toLowerCase() === "true",
        // The event's tracks (real track ids) and their week, for the overall standings.
        eventTracks: listVar(env.EVENT_TRACK_IDS, []).map((s) => s.trim().toLowerCase()).filter((s) => HEX64.test(s)),
        eventWeek: intVar(env.EVENT_WEEK) ?? intVar(env.CURRENT_WEEK) ?? 1,
        ownerKeys: hashSet(env.OWNER_KEY_HASHES),
        // Moderators: sha256(OWNER_KEY_PREFIX + token), like the owner's, but they only get the
        // moderation page. Their own runs are checked and shielded like anyone else's.
        modKeys: hashSet(env.MODERATOR_KEY_HASHES),
        // The owner's public userId (sha256 of the token), whose runs may come from anywhere.
        ownerUserIds: [...hashSet(env.OWNER_USER_IDS)],
        // Runs not driven on the site: "shadow" shows each one only to the player who drove it,
        // "public" shows them to everyone. Either way they are flagged for the moderation page.
        offsitePublic: String(env.OFFSITE_RUNS ?? "shadow").toLowerCase() === "public",
        // Ids of runs the anti-cheat hides on this request's board; set per request.
        blocked: null,
        // Flagged (not driven on site) run id -> its player's userId; set per request.
        flagged: null,
        // The caller's userId (sha256 of their token), who still sees their own flagged runs.
        viewer: null,
        // The caller sees every flagged run (the owner); set per request.
        seesFlagged: false,
        // The request carries the owner's key in nswsOwner; set per request.
        owner: false,
    };
}

// A flagged run that this caller must not see: with OFFSITE_RUNS = "shadow" only its own
// player (and the owner) sees it, so the player believes it counted.
function isShadowed(entry, cfg) {
    if (cfg.offsitePublic || cfg.seesFlagged || !cfg.flagged?.has(entry.id)) return false;
    return !cfg.viewer || entry.userId !== cfg.viewer;
}

// Someone other than the real Author Medal account using its name.
function isImpostor(entry, cfg) {
    return cfg.authorIds.size > 0 && cfg.publicNicknames.has(normalizeNickname(entry.nickname)) && !cfg.authorIds.has(entry.userId);
}

// Hidden from a board: a banned player, a run the anti-cheat hasn't passed, someone
// else's flagged run, or an Author Medal impostor.
function isBanned(entry, cfg) {
    return cfg.banned.has(normalizeNickname(entry.nickname)) || (cfg.blocked?.has(entry.id) ?? false) || isShadowed(entry, cfg) || isImpostor(entry, cfg);
}

// Puts one request's anti-cheat verdicts on cfg. If the anti-cheat is unreachable the board
// still loads, unfiltered, rather than failing.
async function applyVerdicts(env, cfg, track, view) {
    const verdict = await blockedRuns(env, cfg, track, view).catch((err) => {
        console.error("anti-cheat unavailable:", err && err.message);
        return null;
    });
    cfg.blocked = verdict?.blocked ?? null;
    cfg.flagged = verdict?.flagged ?? null;
}

function isAllowedOrigin(origin, cfg) {
    return !!origin && (cfg.allowedOrigins.includes(origin.toLowerCase()) || cfg.allowedOrigins.includes("*"));
}

// Opening a proxy URL in a tab (from the network panel, a copied link, ...) is
// a navigation. The game only ever calls the API with XHR/fetch/WebSocket.
function isNavigation(request) {
    const mode = request.headers.get("Sec-Fetch-Mode");
    const dest = request.headers.get("Sec-Fetch-Dest");
    return mode === "navigate" || mode === "nested-navigate"
        || dest === "document" || dest === "iframe" || dest === "frame";
}

function corsHeaders(origin) {
    return {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
        "Vary": "Origin",
    };
}

const BLANK_PAGE = '<!doctype html><html style="background:#000"><head><meta name="color-scheme" content="dark"><title></title></head><body style="margin:0;background:#000"></body></html>';

function forbidden() {
    return new Response(BLANK_PAGE, {
        status: 403,
        headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
}

function plain(status, text, origin) {
    return new Response(text, {
        status,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin) },
    });
}

function json(data, origin) {
    return new Response(JSON.stringify(data), {
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            // These replies can hold the caller's own entry; no cache may hand
            // them to anyone else.
            "Cache-Control": "no-store",
            ...corsHeaders(origin),
        },
    });
}

function withCors(response, origin) {
    const headers = new Headers(response.headers);
    for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
    // The upstream's own CORS/cookie headers are meaningless to our callers.
    headers.delete("set-cookie");
    return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
    });
}

function errorResponse(err, origin) {
    if (err instanceof BadRequest) return plain(400, "Bad request", origin);
    if (err instanceof UpstreamError) {
        return err.status >= 400 && err.status < 500
            ? plain(err.status, "Upstream refused the request", origin)
            : plain(502, "Upstream unreachable", origin);
    }
    console.error("leaderboard proxy error:", err && err.message);
    return plain(502, "Upstream unreachable", origin);
}

function upstreamRequestHeaders(request, upstreamOrigin) {
    const headers = new Headers();
    for (const [key, value] of request.headers) {
        const name = key.toLowerCase();
        if (STRIP_REQUEST_HEADERS.has(name)) continue;
        if (name.startsWith("cf-") || name.startsWith("x-forwarded-")) continue;
        headers.set(key, value);
    }
    headers.set("Origin", upstreamOrigin);
    headers.set("Referer", upstreamOrigin + "/");
    return headers;
}

const encoder = new TextEncoder();
let saltKey = null;

function hex(buffer) {
    return Array.from(new Uint8Array(buffer), (b) => b.toString(16).padStart(2, "0")).join("");
}

// The game's userTokenHash is the SHA-256 of the token, as hex.
async function sha256Hex(text) {
    return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

// Same shape as a real track id, but nobody without TRACK_SALT can work it out.
// The week is part of it, so claiming the wrong week for a track only ever
// reaches an empty board.
async function hiddenTrackId(salt, week, trackId) {
    if (saltKey?.salt !== salt) {
        const key = await crypto.subtle.importKey(
            "raw", encoder.encode(salt), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
        saltKey = { salt, key };
    }
    return hex(await crypto.subtle.sign("HMAC", saltKey.key, encoder.encode(`nsws-week-${week}:${trackId}`)));
}

async function trackContext(cfg, trackId, weekParam) {
    if (!HEX64.test(trackId ?? "")) throw new BadRequest();
    // The page adds nswsWeek for Not So Weekly Shorts tracks only.
    const week = /^[1-9][0-9]{0,3}$/.test(weekParam ?? "") ? Number(weekParam) : null;
    return {
        trackId,
        week,
        secret: week != null && cfg.currentWeek != null && week >= cfg.currentWeek,
        hiddenId: week != null && cfg.trackSalt && cfg.hiddenFromWeek != null && week >= cfg.hiddenFromWeek
            ? await hiddenTrackId(cfg.trackSalt, week, trackId)
            : null,
    };
}

function intParam(value, min, max) {
    if (value == null || !/^[0-9]{1,16}$/.test(value)) throw new BadRequest();
    const n = Number(value);
    if (!Number.isSafeInteger(n) || n < min || n > max) throw new BadRequest();
    return n;
}

function readOptions(params) {
    return {
        version: params.get("version") || DEFAULT_VERSION,
        onlyVerified: params.get("onlyVerified") === "true" ? "true" : "false",
    };
}

// Whose own entry to report, if anyone's.
async function callerHash(params, track) {
    const token = params.get("userToken");
    if (token && HEX64.test(token)) return sha256Hex(token);
    // The hash on its own is public, so for a week still in progress it can't be
    // taken as "this is me" - it would hand out anyone's time.
    if (track.secret) return null;
    const claimed = params.get("userTokenHash");
    return claimed && HEX64.test(claimed) ? claimed : null;
}

// Only the owner's key proves ownership: OWNER_KEY_HASHES holds sha256(OWNER_KEY_PREFIX + token),
// which, unlike the plain token hash, is not anyone's public userId. The owner gets
// past every restriction here; nobody else gets any exception.
async function isOwner(token, cfg) {
    if (!cfg.ownerKeys.size || typeof token !== "string" || !HEX64.test(token)) return false;
    return cfg.ownerKeys.has(await sha256Hex(OWNER_KEY_PREFIX + token));
}

async function isModerator(token, cfg) {
    if (await isOwner(token, cfg)) return true;
    if (!cfg.modKeys.size || typeof token !== "string" || !HEX64.test(token)) return false;
    return cfg.modKeys.has(await sha256Hex(OWNER_KEY_PREFIX + token));
}

// For a request from outside the allowed sites (another tool or site, or a tab):
// it is let through only if it carries the owner's key, as nswsOwner, as the userToken
// of a read, or as the userToken of an upload.
async function carriesOwnerKey(request, url, cfg) {
    if (cfg.owner || await isOwner(url.searchParams.get("userToken"), cfg)) return true;
    if (request.method !== "POST") return false;
    const length = Number(request.headers.get("Content-Length"));
    if (length > 2_000_000) return false;
    const form = new URLSearchParams(await request.clone().text());
    return isOwner(form.get("userToken"), cfg);
}

async function fetchUpstreamJson(cfg, request, path, params) {
    const target = new URL(path, cfg.upstream);
    for (const [key, value] of Object.entries(params)) target.searchParams.set(key, String(value));
    let response;
    try {
        response = await fetch(target.toString(), {
            headers: upstreamRequestHeaders(request, cfg.upstreamOrigin),
        });
    } catch {
        throw new UpstreamError(502);
    }
    if (!response.ok) throw new UpstreamError(response.status);
    return response.json();
}

async function fetchBoard(cfg, request, trackId, read, limit) {
    const entries = [];
    for (;;) {
        const data = await fetchUpstreamJson(cfg, request, "/v6/leaderboard", {
            version: read.version,
            trackId,
            skip: entries.length,
            amount: PAGE_SIZE,
            onlyVerified: read.onlyVerified,
        });
        if (!data || !Number.isSafeInteger(data.total) || !Array.isArray(data.entries)) {
            throw new UpstreamError(502);
        }
        entries.push(...data.entries);
        if (data.entries.length < PAGE_SIZE || entries.length >= data.total) {
            return { total: data.total, entries, complete: true };
        }
        if (entries.length >= limit) return { total: data.total, entries, complete: false };
    }
}

// Boards are the same for every caller until they are filtered and hidden per
// request, so each Worker instance keeps the last copy for a few seconds.
// Only finished data is kept: a pending fetch belongs to the request that
// started it and must not be awaited by another one.
const boards = new Map();

async function loadBoard(cfg, request, trackId, read, limit, fresh) {
    const key = [cfg.upstream, trackId, read.version, read.onlyVerified, limit].join("|");
    const hit = boards.get(key);
    if (!fresh && hit && Date.now() - hit.at < BOARD_TTL_MS) return hit.board;
    const board = await fetchBoard(cfg, request, trackId, read, limit);
    boards.delete(key);
    boards.set(key, { at: Date.now(), board });
    if (boards.size > BOARD_CACHE_MAX) boards.delete(boards.keys().next().value);
    return board;
}

// A hidden week still shows the runs that were set under the real id before
// it was hidden: one entry per player, whichever run is faster.
function mergeBoards(real, hidden) {
    const best = new Map();
    for (const entry of real.entries.concat(hidden.entries)) {
        const key = typeof entry.userId === "string" && entry.userId ? entry.userId : "#" + entry.id;
        const kept = best.get(key);
        if (!kept || entry.frames < kept.frames) best.set(key, entry);
    }
    // Stable sort, so equal times keep upstream order (real-id runs first).
    const entries = [...best.values()].sort((a, b) => a.frames - b.frames);
    const complete = real.complete && hidden.complete;
    return { total: complete ? entries.length : real.total + hidden.total, entries, complete };
}

// track id -> { at, cutoff, keep: Set, removed: Set }; see AntiCheat.baseline.
const baselines = new Map();

// Splits a map's own Kodub board into its validation runs (never shown; the fastest is the
// author time) and everything else. If the anti-cheat can't be reached nothing is split.
async function splitValidation(env, track, real) {
    const anti = antiCheat(env);
    if (!anti || track.week == null) return { rest: real.entries, validation: [], removed: new Set() };
    let base = baselines.get(track.trackId);
    if (!base || Date.now() - base.at > ANTICHEAT_TTL_MS) {
        const maxId = real.entries.reduce((max, e) => (Number.isSafeInteger(e.id) && e.id > max ? e.id : max), 0);
        try {
            const b = await anti.baseline(track.trackId, track.week, maxId);
            base = { at: Date.now(), cutoff: b.cutoff, keep: new Set(b.keep), removed: new Set(b.removed) };
            baselines.set(track.trackId, base);
        } catch (err) {
            console.error("anti-cheat unavailable:", err && err.message);
            return { rest: real.entries, validation: [], removed: new Set() };
        }
    }
    const validation = [];
    const rest = [];
    for (const e of real.entries) (Number.isSafeInteger(e.id) && e.id <= base.cutoff && !base.keep.has(e.id) ? validation : rest).push(e);
    return { rest, validation, removed: base.removed };
}

// The board as this track's players see it, banned players still included. On an event
// track, `validation` holds the map's validation runs, which are not in `entries`.
async function loadView(env, cfg, request, track, read, fresh = false) {
    const limit = track.week != null ? SCAN_LIMIT_COMMUNITY : SCAN_LIMIT_OTHER;
    if (track.week == null) return loadBoard(cfg, request, track.trackId, read, limit, fresh);
    const [real, hidden] = await Promise.all([
        loadBoard(cfg, request, track.trackId, read, limit, fresh),
        track.hiddenId ? loadBoard(cfg, request, track.hiddenId, read, limit, fresh) : null,
    ]);
    const split = await splitValidation(env, track, real);
    const own = { total: Math.max(0, real.total - split.validation.length), entries: split.rest, complete: real.complete };
    const view = hidden ? mergeBoards(own, hidden) : own;
    return { ...view, validation: split.validation, validationRemoved: split.removed };
}

// The map's author time: its fastest validation run the owner hasn't removed.
function validationFrames(view) {
    const frames = (view.validation ?? []).filter((e) => !view.validationRemoved.has(e.id)).map((e) => e.frames);
    return frames.length ? Math.min(...frames) : null;
}

function bannedCount(entries, cfg) {
    let n = 0;
    for (const entry of entries) if (isBanned(entry, cfg)) n++;
    return n;
}

// Rank of a player's run counting only players who aren't banned. A banned
// player still gets a rank for their own run - it is only ever shown to them,
// and without their own entry the game would keep uploading the run again.
function rankOf(view, hash, cfg) {
    const index = view.entries.findIndex((e) => e.userId === hash);
    if (index < 0) return null;
    return { entry: view.entries[index], position: index + 1 - bannedCount(view.entries.slice(0, index), cfg) };
}

// An upstream position on an unmerged board, minus the banned players above it.
function withoutBannedAbove(view, position, cfg) {
    if (!Number.isSafeInteger(position) || position <= 0) return position;
    return position - bannedCount(view.entries.slice(0, position - 1), cfg);
}

function filteredTotal(view, cfg) {
    const banned = bannedCount(view.entries, cfg);
    return view.complete ? view.entries.length - banned : Math.max(0, view.total - banned);
}

async function ownEntry(cfg, request, track, read, view, hash) {
    const rank = rankOf(view, hash, cfg);
    if (rank) {
        const { entry, position } = rank;
        return { position, frames: entry.frames, verifiedState: entry.verifiedState, id: entry.id };
    }
    if (view.complete || track.hiddenId) return null;
    // Further down a big board than was read: ask upstream, then take off the
    // banned players found in the part that was read - they are all ahead.
    const data = await fetchUpstreamJson(cfg, request, "/v6/leaderboardUserEntry", {
        version: read.version,
        trackId: track.trackId,
        userTokenHash: hash,
        onlyVerified: read.onlyVerified,
    });
    if (!data || typeof data !== "object" || !Number.isSafeInteger(data.position)) return null;
    return { ...data, position: Math.max(1, data.position - bannedCount(view.entries, cfg)) };
}

// Page rows past what was read (big official boards only). Assumes no banned
// player sits between the end of the read and this page.
async function readPastScan(cfg, request, track, read, rawSkip, count) {
    const data = await fetchUpstreamJson(cfg, request, "/v6/leaderboard", {
        version: read.version,
        trackId: track.trackId,
        skip: rawSkip,
        amount: Math.min(PAGE_SIZE, count + cfg.banned.size),
        onlyVerified: read.onlyVerified,
    });
    const entries = data && Array.isArray(data.entries) ? data.entries : [];
    return entries.filter((e) => !isBanned(e, cfg)).slice(0, count);
}

// Someone else's run on a week still in progress: keep who they are and where
// they rank; drop the time, the recording id (so their ghost can't be fetched)
// and when it was set. PUBLIC_NICKNAMES keep their time - the medals' Author
// Time is read from it - but not their recording.
function shield(entry, position, callerHashValue, cfg) {
    if (callerHashValue && entry.userId === callerHashValue) return entry;
    // With HIDE_TIMES off (the Kacky event), everyone's time is shown; the recording id and
    // user id are still withheld, so nobody can watch or ghost anyone else's run.
    const isPublic = !cfg.hideTimes || cfg.publicNicknames.has(normalizeNickname(entry.nickname));
    return {
        id: -position,
        userId: "",
        nickname: entry.nickname,
        countryCode: entry.countryCode ?? null,
        carStyle: entry.carStyle,
        // A stand-in that still passes the game's checks and sorts in rank order.
        frames: isPublic ? entry.frames : position,
        verifiedState: entry.verifiedState,
        hidden: !isPublic,
    };
}

// ---- Kacky event: overall standings and moderation ----------------------------------

// Every event track's board as the site shows it (bans, moderation and the anti-cheat
// applied), with the Author Medal account(s) taken out so they never take a rank.
// ranked: the runs everyone sees. flagged: the runs not driven on the site (with
// OFFSITE_RUNS = "public" they are in ranked instead).
async function eventBoards(env, cfg, request, fresh = false, trackIds = cfg.eventTracks) {
    const read = { version: DEFAULT_VERSION, onlyVerified: "false" };
    return Promise.all(trackIds.map(async (trackId) => {
        const track = await trackContext(cfg, trackId, String(cfg.eventWeek));
        const view = await loadView(env, cfg, request, track, read, fresh);
        const verdict = await blockedRuns(env, cfg, track, view).catch(() => null);
        const blocked = verdict?.blocked ?? null;
        const flaggedIds = verdict?.flagged ?? new Map();
        const shown = view.entries.filter((e) => !cfg.banned.has(normalizeNickname(e.nickname)) && !(blocked?.has(e.id)) && !isImpostor(e, cfg));
        const isAuthor = (e) => cfg.publicNicknames.has(normalizeNickname(e.nickname));
        const isFlagged = (e) => !cfg.offsitePublic && flaggedIds.has(e.id);
        const benchmark = shown.filter((e) => isAuthor(e) && !isFlagged(e));
        const ranked = shown.filter((e) => !isAuthor(e) && !isFlagged(e));
        const flagged = shown.filter((e) => !isAuthor(e) && isFlagged(e));
        return { trackId, ranked, flagged, benchmark, all: view.entries, blocked, flaggedIds,
            validation: view.validation ?? [], validationRemoved: view.validationRemoved ?? new Set(), validationFrames: validationFrames(view) };
    }));
}

const STANDINGS_TTL_MS = 60_000;
// Cloudflare's free plan allows 50 outside requests (Kodub reads and anti-cheat calls) per
// request to the Worker, and one map costs four. So the standings are kept as one small
// summary per map, stored in the anti-cheat object, and each request for them refreshes only
// the few maps whose summary is oldest. Everyone gets the stored summaries of the rest.
const REFRESH_PER_REQUEST = 8;
const SUMMARY_REUSE_MS = 15_000;
let summaries = null;     // { at, byTrack: { trackId: summary } }, this Worker instance's copy

// What the standings need from one map's board.
function summarize(b) {
    const slim = (e) => ({ id: e.id, userId: e.userId, nickname: e.nickname, countryCode: e.countryCode ?? null, frames: e.frames });
    return {
        trackId: b.trackId,
        at: Date.now(),
        ranked: b.ranked.map(slim),
        flagged: b.flagged.map(slim),
        // The validation run's time; without one, the Author Medal account's.
        authorFrames: b.validationFrames ?? (b.benchmark.length ? Math.min(...b.benchmark.map((e) => e.frames)) : null),
    };
}

async function eventSummaries(env, cfg, request) {
    const anti = antiCheat(env);
    const now = Date.now();
    if (!summaries || now - summaries.at > SUMMARY_REUSE_MS) {
        const stored = anti ? await anti.eventSummaries().catch(() => null) : null;
        summaries = { at: now, byTrack: stored ?? summaries?.byTrack ?? {} };
    }
    const byTrack = summaries.byTrack;
    const stale = cfg.eventTracks
        .filter((id) => !byTrack[id] || now - byTrack[id].at > STANDINGS_TTL_MS)
        .sort((a, b) => (byTrack[a]?.at ?? 0) - (byTrack[b]?.at ?? 0))
        .slice(0, REFRESH_PER_REQUEST);
    if (stale.length) {
        try {
            const fresh = (await eventBoards(env, cfg, request, false, stale)).map(summarize);
            for (const s of fresh) byTrack[s.trackId] = s;
            if (anti) await anti.saveEventSummaries(fresh).catch(() => {});
        } catch (err) {
            // Kodub unreachable or a limit hit: serve what is stored rather than nothing.
            console.error("standings refresh failed:", err && err.message);
        }
    }
    return cfg.eventTracks.map((id) => byTrack[id]).filter(Boolean);
}

// Ranked by maps finished (more is better), then by average rank over the maps finished.
// viewer: a player whose own flagged runs are counted for them alone (OFFSITE_RUNS =
// "shadow"), so their standings match the boards they see.
function standingsFrom(cfg, boards, viewer) {
    const players = new Map();
    const tracks = {};
    for (const b of boards) {
        let ranked = b.ranked;
        const own = viewer ? b.flagged.filter((e) => e.userId === viewer) : [];
        if (own.length) ranked = ranked.concat(own).sort((x, y) => x.frames - y.frames);
        tracks[b.trackId] = {
            finishers: ranked.length,
            top3: ranked.slice(0, 3).map((e) => ({ nickname: e.nickname, countryCode: e.countryCode ?? null, frames: e.frames })),
            authorFrames: b.authorFrames,
        };
        ranked.forEach((e, i) => {
            const key = e.userId || "#" + e.id;
            let p = players.get(key);
            if (!p) players.set(key, (p = { nickname: e.nickname, countryCode: e.countryCode ?? null, positions: [] }));
            p.positions.push(i + 1);
        });
    }
    const standings = [...players.values()].map((p) => ({
        nickname: p.nickname,
        countryCode: p.countryCode,
        finished: p.positions.length,
        averageRank: p.positions.reduce((a, b) => a + b, 0) / p.positions.length,
    })).sort((a, b) => b.finished - a.finished || a.averageRank - b.averageRank);
    // loaded < totalTracks while the first summaries are still being gathered.
    return { updated: Date.now(), totalTracks: cfg.eventTracks.length, loaded: boards.length, standings, tracks };
}

async function computeStandings(env, cfg, request, viewer) {
    const boards = await eventSummaries(env, cfg, request);
    return standingsFrom(cfg, boards, viewer);
}

async function handleStandings(request, url, env, cfg, origin) {
    const token = url.searchParams.get("userToken");
    const viewer = token && HEX64.test(token) ? await sha256Hex(token) : null;
    return json(await computeStandings(env, cfg, request, viewer), origin);
}

// The owner's moderation page: every run on every event track, in full, with where it
// came from, plus the ban and removed-run lists.
// trackIds: the maps to list in this call (the page asks for a few at a time, to stay inside
// the free plan's 50 outside requests).
async function moderationOverview(env, cfg, request, trackIds) {
    const anti = antiCheat(env);
    const boards = await eventBoards(env, cfg, request, true, trackIds);
    const tracks = [];
    for (const b of boards) {
        const seen = anti ? new Map((await anti.runs(b.trackId)).map((r) => [r.id, r])) : new Map();
        tracks.push({
            trackId: b.trackId,
            authorFrames: b.validationFrames,
            validation: b.validation.map((e) => ({
                id: e.id, userId: e.userId, nickname: e.nickname, frames: e.frames,
                removed: b.validationRemoved.has(e.id), authorTime: !b.validationRemoved.has(e.id) && e.frames === b.validationFrames,
            })),
            entries: b.all.map((e) => {
                const r = seen.get(e.id);
                const flagged = b.flaggedIds.has(e.id);
                return {
                    id: e.id, userId: e.userId, nickname: e.nickname, frames: e.frames, flagged,
                    shown: !b.blocked?.has(e.id) && !cfg.banned.has(normalizeNickname(e.nickname)) && !isImpostor(e, cfg) && (!flagged || cfg.offsitePublic),
                    author: cfg.publicNicknames.has(normalizeNickname(e.nickname)) && !isImpostor(e, cfg),
                    impostor: isImpostor(e, cfg),
                    source: r?.source ?? null, state: r?.state ?? null, reason: r?.reason ?? null,
                };
            }),
        });
    }
    return {
        tracks,
        eventTracks: cfg.eventTracks,
        offsiteRuns: cfg.offsitePublic ? "public" : "shadow",
        flagged: anti ? await anti.flaggedRuns() : [],
        moderation: anti ? await anti.moderation() : { bans: [], removed: [] },
        bannedNicknames: [...cfg.banned],
        antiCheat: anti ? await anti.summary() : null,
    };
}

function afterModeration() {
    baselines.clear();
    summaries = null;
    verdicts.clear();
}

function antiCheat(env) {
    return env.ANTICHEAT ? env.ANTICHEAT.get(env.ANTICHEAT.idFromName("global")) : null;
}

// One instance: each replay is its own call, so an upload waits behind at most one
// background replay, and only one copy of the physics is in memory.
function runChecker(env) {
    return env.RUN_CHECKER.get(env.RUN_CHECKER.idFromName("main"));
}

// track id -> { at, known: Set of classified ids, verdict: { blocked: Set, flagged: Map } }
const verdicts = new Map();

// { blocked: Set of run ids nobody sees, flagged: Map of run id -> userId not driven on site }
async function blockedRuns(env, cfg, track, view) {
    const anti = antiCheat(env);
    if (!anti || track.week == null) return null;
    const hit = verdicts.get(track.trackId);
    if (hit && Date.now() - hit.at < ANTICHEAT_TTL_MS && view.entries.every((e) => hit.known.has(e.id))) return hit.verdict;
    const entries = view.entries.map((e) => ({ id: e.id, userId: e.userId, frames: e.frames, nickname: e.nickname, countryCode: e.countryCode }));
    const result = await anti.classify(track.trackId, track.week, entries, cfg.ownerUserIds);
    const verdict = { blocked: new Set(result.blocked), flagged: new Map(result.flagged) };
    verdicts.delete(track.trackId);
    verdicts.set(track.trackId, { at: Date.now(), known: new Set(view.entries.map((e) => e.id)), verdict });
    if (verdicts.size > BOARD_CACHE_MAX) verdicts.delete(verdicts.keys().next().value);
    return verdict;
}

async function handleLeaderboard(request, url, env, cfg, origin) {
    const params = url.searchParams;
    const track = await trackContext(cfg, params.get("trackId"), params.get("nswsWeek"));
    const skip = intParam(params.get("skip"), 0, Number.MAX_SAFE_INTEGER);
    const amount = intParam(params.get("amount"), 1, PAGE_SIZE);
    const read = readOptions(params);
    const hash = await callerHash(params, track);
    const owner = cfg.owner || await isOwner(params.get("userToken"), cfg);

    const view = await loadView(env, cfg, request, track, read);
    cfg.viewer = hash;
    cfg.seesFlagged = owner;
    await applyVerdicts(env, cfg, track, view);
    const ranked = view.entries.filter((e) => !isBanned(e, cfg));
    let page = ranked.slice(skip, skip + amount);
    if (!view.complete && !track.hiddenId && page.length < amount) {
        const rawSkip = Math.max(skip, ranked.length) + (view.entries.length - ranked.length);
        page = page.concat(await readPastScan(cfg, request, track, read, rawSkip, amount - page.length));
    }
    if (track.secret && !owner) page = page.map((entry, i) => shield(entry, skip + i + 1, hash, cfg));

    const body = {
        total: filteredTotal(view, cfg),
        entries: page,
        userEntry: hash ? await ownEntry(cfg, request, track, read, view, hash) : null,
    };
    if (owner && track.secret) body.owner = true;
    return json(body, origin);
}

async function handleUserEntry(request, url, env, cfg, origin) {
    const params = url.searchParams;
    const track = await trackContext(cfg, params.get("trackId"), params.get("nswsWeek"));
    const hash = await callerHash(params, track);
    if (!hash) return json(null, origin);
    const read = readOptions(params);
    const view = await loadView(env, cfg, request, track, read);
    cfg.viewer = hash;
    await applyVerdicts(env, cfg, track, view);
    return json(await ownEntry(cfg, request, track, read, view, hash), origin);
}

function postUpstream(request, cfg, path, body) {
    return fetch(new URL(path, cfg.upstream).toString(), {
        method: "POST",
        headers: upstreamRequestHeaders(request, cfg.upstreamOrigin),
        body,
        redirect: "manual",
    });
}

// Replaces one field of a form body and leaves every other byte as it came, so
// the recording and car style reach upstream exactly as the game encoded them.
function replaceFormValue(body, name, value) {
    return body.split("&").map((part) => (part.split("=", 1)[0] === name ? name + "=" + value : part)).join("&");
}

// Where the run lands on the board as it stood just before it was sent,
// counting only players who aren't banned. Upstream keeps each player's best
// run, and a run tying someone else's ranks behind it.
function recountPositions(before, hash, frames, upstreamPrevious, cfg) {
    const rank = rankOf(before, hash, cfg);
    const best = rank ? Math.min(frames, rank.entry.frames) : frames;
    let ahead = 0;
    for (const e of before.entries) if (e.userId !== hash && !isBanned(e, cfg) && e.frames <= best) ahead++;
    const positions = { newPosition: ahead + 1 };
    if (rank) positions.previousPosition = rank.position;
    // No earlier run: keep upstream's "unranked" value (0) or its "last place".
    else if (upstreamPrevious > 0) positions.previousPosition = filteredTotal(before, cfg) + 1;
    return positions;
}

// A new run makes the kept copies of its board stale.
function forgetBoards(...trackIds) {
    for (const key of boards.keys()) {
        if (trackIds.some((id) => id && key.includes("|" + id + "|"))) boards.delete(key);
    }
    for (const id of trackIds) verdicts.delete(id);
}

function antiCheatRejected(origin) {
    return plain(422, "Run failed the anti-cheat check", origin);
}

async function handleSubmit(request, url, env, cfg, origin) {
    const raw = await request.text();
    const form = new URLSearchParams(raw);
    const trackId = form.get("trackId") ?? "";
    const token = form.get("userToken") ?? "";
    const frames = Number(form.get("frames"));
    // Not a submission this Worker understands: forward it as it came.
    if (!HEX64.test(trackId) || !HEX64.test(token) || !Number.isSafeInteger(frames)) {
        return withCors(await postUpstream(request, cfg, url.pathname, raw), origin);
    }

    const track = await trackContext(cfg, trackId, url.searchParams.get("nswsWeek"));
    const hash = await sha256Hex(token);
    const ownerUpload = cfg.owner || await isOwner(token, cfg);
    const read = readOptions(form);
    const body = track.hiddenId ? replaceFormValue(raw, "trackId", track.hiddenId) : raw;

    // Upstream reports positions on the board it stored the run on, counting
    // banned players (and, for a hidden week, missing the runs still under the
    // real id). The board from just before the run lets both be recounted the
    // way the leaderboard shows them.
    // Runs on these boards are replayed first; a run that doesn't really finish on the
    // time it claims never reaches Kodub.
    const anti = track.week != null && !ownerUpload ? antiCheat(env) : null;
    let check = null;
    if (anti) {
        const recording = form.get("recording") ?? "";
        const nickname = (form.get("nickname") ?? "").slice(0, 64);
        const key = await sha256Hex(trackId + "|" + frames + "|" + recording);
        const prep = await anti.prepareSubmit(trackId, key);
        if (prep.rejected) return antiCheatRejected(origin);
        let state = "pending";
        if (prep.payload) {
            const result = await runChecker(env).check(prep.payload, recording, frames);
            if (!result.valid) {
                await anti.reject({ key, track: trackId, week: track.week, userId: hash, nickname, frames, reason: result.reason });
                return antiCheatRejected(origin);
            }
            state = "valid";
        }
        await anti.expect({ track: trackId, userId: hash, frames, state });
        check = { recording, nickname, state };
    }

    const before = await loadView(env, cfg, request, track, read).catch(() => null);
    cfg.viewer = hash;
    if (before) await applyVerdicts(env, cfg, track, before);
    const response = await postUpstream(request, cfg, url.pathname, body);
    forgetBoards(track.trackId, track.hiddenId);
    const text = await response.text();
    let result = null;
    try {
        result = JSON.parse(text);
    } catch {
        /* not JSON - handed back untouched below */
    }
    if (check && response.ok) {
        const uploadId = typeof result === "number" ? result : result?.uploadId;
        await anti.confirm({
            track: trackId, week: track.week, uploadId, userId: hash, nickname: check.nickname, frames,
            state: check.state, recording: check.state === "pending" ? check.recording : null,
        });
    }
    if (!response.ok || !result || typeof result !== "object" || !Number.isSafeInteger(result.newPosition)) {
        return new Response(text, {
            status: response.status,
            headers: {
                "Content-Type": response.headers.get("Content-Type") || "text/plain; charset=utf-8",
                "Cache-Control": "no-store",
                ...corsHeaders(origin),
            },
        });
    }

    if (before?.complete) {
        const positions = recountPositions(before, hash, frames, result.previousPosition, cfg);
        result.newPosition = positions.newPosition;
        if (Number.isSafeInteger(result.previousPosition) && positions.previousPosition != null) {
            result.previousPosition = positions.previousPosition;
        }
    } else if (before && !track.hiddenId) {
        // Only part of a big board was read: take off the banned players found in it.
        result.newPosition = withoutBannedAbove(before, result.newPosition, cfg);
        result.previousPosition = withoutBannedAbove(before, result.previousPosition, cfg);
    }
    return json(result, origin);
}

async function passThrough(request, url, cfg, origin, ctx, env) {
    // Nobody but the owner may download the recording of an event run: recording ids are
    // sequential, so hiding them on the boards alone would not stop someone guessing them.
    if (url.pathname === "/v6/recordings" && !cfg.owner) {
        const ids = (url.searchParams.get("ids") ?? url.searchParams.get("recordingIds") ?? "")
            .split(",").map(Number).filter(Number.isSafeInteger);
        const anti = antiCheat(env);
        const token = url.searchParams.get("userToken");
        url.searchParams.delete("userToken");      // never forwarded upstream
        if (ids.length && anti) {
            const mine = token && HEX64.test(token) ? await sha256Hex(token) : null;
            const others = (await anti.eventRunIds(ids)).filter((r) => r.userId !== mine);
            if (others.length) return plain(403, "Recording is private", origin);
        }
    }
    const target = new URL(cfg.upstream);
    target.pathname = url.pathname;
    target.search = url.search;

    // Multiplayer signalling (/v6/multiplayer/host, /v6/multiplayer/join) is
    // a WebSocket upgrade: forward it untouched and hand back the 101 as-is.
    // A 101 response cannot be cloned or have headers appended.
    if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
        return fetch(new Request(target.toString(), {
            method: request.method,
            headers: upstreamRequestHeaders(request, cfg.upstreamOrigin),
            body: request.body,
        }));
    }

    const ttl = request.method === "GET" ? CACHE_TTL[url.pathname] : undefined;
    // Key on the URL alone. CORS headers are added per-request afterwards,
    // so a response cached for one origin is still correct for the next.
    const cacheKey = ttl ? new Request(target.toString(), { method: "GET" }) : null;

    if (cacheKey) {
        // A broken or unavailable cache must never take the proxy down with
        // it, so every cache operation falls open to the upstream fetch.
        try {
            const hit = await caches.default.match(cacheKey);
            if (hit) return withCors(hit, origin);
        } catch {
            /* cache unavailable - fall through and fetch upstream */
        }
    }

    let response;
    try {
        response = await fetch(target.toString(), {
            method: request.method,
            headers: upstreamRequestHeaders(request, cfg.upstreamOrigin),
            body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
            redirect: "manual",
        });
    } catch {
        return plain(502, "Upstream unreachable", origin);
    }

    if (cacheKey && response.status === 200) {
        const headers = new Headers(response.headers);
        headers.delete("set-cookie");
        headers.set("Cache-Control", `public, max-age=${ttl}`);
        const cacheable = new Response(response.body, {
            status: 200,
            statusText: response.statusText,
            headers,
        });
        ctx.waitUntil(caches.default.put(cacheKey, cacheable.clone()).catch(() => {}));
        return withCors(cacheable, origin);
    }

    return withCors(response, origin);
}

async function readSmallBody(request, limit) {
    const length = Number(request.headers.get("Content-Length"));
    if (length > limit) return null;
    const text = await request.text();
    return text.length > limit ? null : text;
}

// A track as the owner's game builds it for the physics check.
function readTrackSync(t) {
    const p = t?.payload;
    const v = p?.mountainVertices;
    const o = p?.mountainOffset;
    if (!HEX64.test(t?.id ?? "") || !Number.isSafeInteger(t.week)) return null;
    if (typeof p?.trackData !== "string" || !p.trackData || !Array.isArray(v) || v.length > 200_000) return null;
    if (!v.every(Number.isFinite) || ![o?.x, o?.y, o?.z].every(Number.isFinite)) return null;
    return { id: t.id, week: t.week, payload: { trackData: p.trackData, mountainVertices: v, mountainOffset: { x: o.x, y: o.y, z: o.z } } };
}

async function handleTraffic(request, url, env, cfg, origin, ctx) {
    if (request.method !== "POST") return plain(405, "Method not allowed", origin);
    if (!env.TRAFFIC) return plain(503, "Traffic stats are off", origin);
    const stub = env.TRAFFIC.get(env.TRAFFIC.idFromName("global"));
    const syncing = url.pathname === TRAFFIC_PREFIX + "anticheat/tracks";
    const text = await readSmallBody(request, syncing ? MAX_TRACK_SYNC_BODY : MAX_TRAFFIC_BODY);
    if (text == null) return plain(413, "Too large", origin);

    if (url.pathname === TRAFFIC_PREFIX + "beat") {
        const beat = readBeat(text);
        if (!beat) return plain(400, "Bad request", origin);
        const client = describeClient(request);
        const meta = { ...client, site: new URL(origin).host, ip: request.headers.get("CF-Connecting-IP") };
        ctx.waitUntil(stub.beat(beat, meta).catch((err) => console.error("traffic beat failed:", err && err.message)));
        return new Response(null, { status: 204, headers: { "Cache-Control": "no-store", ...corsHeaders(origin) } });
    }

    let body;
    try {
        body = JSON.parse(text);
    } catch {
        return plain(400, "Bad request", origin);
    }
    const moderating = url.pathname.startsWith(TRAFFIC_PREFIX + "mod/");
    if (!(await (moderating ? isModerator : isOwner)(body?.token, cfg))) return plain(403, "Forbidden", origin);
    if (moderating) {
        const anti = antiCheat(env);
        if (!anti) return plain(503, "Anti-cheat is off", origin);
        const what = url.pathname.slice((TRAFFIC_PREFIX + "mod/").length);
        const reason = typeof body.reason === "string" ? body.reason.slice(0, 200) : null;
        const nickname = typeof body.nickname === "string" ? body.nickname.slice(0, 64) : null;
        let result;
        if (what === "overview") {
            // At most 6 maps per call; with none named, only the lists that aren't per map.
            const wanted = Array.isArray(body.tracks) ? body.tracks.filter((id) => cfg.eventTracks.includes(id)).slice(0, 6) : [];
            return json(await moderationOverview(env, cfg, request, wanted), origin);
        }
        if (what === "recording") {
            if (!Number.isSafeInteger(body.id)) return plain(400, "Bad request", origin);
            return json(await anti.flaggedRecording(body.id), origin);
        }
        if (what === "ban") {
            if (!HEX64.test(body.userId ?? "")) return plain(400, "Bad request", origin);
            result = await anti.ban({ userId: body.userId, nickname, reason });
        } else if (what === "unban") {
            if (!HEX64.test(body.userId ?? "")) return plain(400, "Bad request", origin);
            result = await anti.unban(body.userId);
        } else if (what === "remove") {
            if (!Number.isSafeInteger(body.id)) return plain(400, "Bad request", origin);
            result = await anti.removeRun({ id: body.id, track: body.track, userId: body.userId, nickname, frames: body.frames, reason });
        } else if (what === "restore") {
            if (!Number.isSafeInteger(body.id)) return plain(400, "Bad request", origin);
            result = await anti.restoreRun(body.id);
        } else if (what === "approve") {
            if (!Number.isSafeInteger(body.id)) return plain(400, "Bad request", origin);
            const info = HEX64.test(body.track ?? "")
                ? { track: body.track, week: cfg.eventWeek, userId: body.userId, nickname, frames: body.frames }
                : null;
            result = await anti.approve(body.id, info);
        } else if (what === "rebaseline") {
            // Every run now on the maps' own Kodub boards becomes a validation run.
            const read = { version: DEFAULT_VERSION, onlyVerified: "false" };
            const list = [];
            for (const trackId of cfg.eventTracks) {
                const board = await loadBoard(cfg, request, trackId, read, SCAN_LIMIT_COMMUNITY, true);
                list.push({ track: trackId, week: cfg.eventWeek, cutoff: board.entries.reduce((max, e) => (Number.isSafeInteger(e.id) && e.id > max ? e.id : max), 0) });
            }
            result = await anti.rebaseline(list);
        } else {
            return plain(404, "Not found", origin);
        }
        afterModeration();
        // The stored standings summaries are out of date now; they are refreshed first.
        await anti.staleEventSummaries().catch(() => {});
        return json(result, origin);
    }
    if (url.pathname === TRAFFIC_PREFIX + "live") return json(await stub.liveStats(), origin);
    if (url.pathname === TRAFFIC_PREFIX + "stats") {
        return json(await stub.stats(String(body.range ?? "day"), Number(body.tz) || 0), origin);
    }
    const anti = antiCheat(env);
    if (url.pathname.startsWith(TRAFFIC_PREFIX + "anticheat") && !anti) return plain(503, "Anti-cheat is off", origin);
    if (url.pathname === TRAFFIC_PREFIX + "anticheat") return json(await anti.summary(), origin);
    if (syncing) {
        if (!Array.isArray(body.tracks) || body.tracks.length > 2) return plain(400, "Bad request", origin);
        const tracks = body.tracks.map(readTrackSync);
        if (tracks.some((t) => !t)) return plain(400, "Bad request", origin);
        return json(await anti.putTracks(tracks), origin);
    }
    if (url.pathname === TRAFFIC_PREFIX + "anticheat/approve") {
        if (!Number.isSafeInteger(body.id)) return plain(400, "Bad request", origin);
        return json(await anti.approve(body.id), origin);
    }
    return plain(404, "Not found", origin);
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const cfg = readConfig(env);
        cfg.owner = await isOwner(url.searchParams.get("nswsOwner"), cfg);
        url.searchParams.delete("nswsOwner");

        if (url.pathname.startsWith(TRAFFIC_PREFIX)) {
            const requestOrigin = request.headers.get("Origin");
            const fromSite = !isNavigation(request) && isAllowedOrigin(requestOrigin, cfg);
            // Owner endpoints check the owner's key themselves, so they work from anywhere.
            if (!fromSite && url.pathname === TRAFFIC_PREFIX + "beat") return forbidden();
            const origin = requestOrigin || "*";
            if (request.method === "OPTIONS") {
                return new Response(null, { status: 204, headers: corsHeaders(origin) });
            }
            try {
                return await handleTraffic(request, url, env, cfg, origin, ctx);
            } catch (err) {
                console.error("traffic error:", err && err.message);
                return plain(500, "Traffic stats failed", origin);
            }
        }

        if (url.pathname === "/event/standings") {
            const requestOrigin = request.headers.get("Origin");
            if (isNavigation(request) || !isAllowedOrigin(requestOrigin, cfg)) return forbidden();
            if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(requestOrigin) });
            try {
                return await handleStandings(request, url, env, cfg, requestOrigin);
            } catch (err) {
                return errorResponse(err, requestOrigin);
            }
        }

        if (!ALLOWED_PREFIXES.some((p) => url.pathname.startsWith(p))) {
            // Not an API path. If assets are bound, let the site handle it.
            if (env.ASSETS) return env.ASSETS.fetch(request);
            return new Response("Not found", { status: 404 });
        }

        // The API is only for the game on our own site. Opening a proxy URL in
        // a tab sends no Origin, and another site sends its own - both get 403,
        // and without CORS headers a page on another site can't read it anyway.
        // The owner's key is the one exception.
        const requestOrigin = request.headers.get("Origin");
        const fromSite = !isNavigation(request) && isAllowedOrigin(requestOrigin, cfg);
        if (request.method === "OPTIONS") {
            if (!fromSite && !requestOrigin) return forbidden();
            // A preflight carries no key; the request that follows is checked in full.
            return new Response(null, { status: 204, headers: corsHeaders(requestOrigin) });
        }
        if (!fromSite && !(await carriesOwnerKey(request, url, cfg))) return forbidden();
        const origin = requestOrigin || "*";

        try {
            if (url.pathname === "/v6/leaderboard") {
                if (request.method === "GET") return await handleLeaderboard(request, url, env, cfg, origin);
                if (request.method === "POST") return await handleSubmit(request, url, env, cfg, origin);
            } else if (url.pathname === "/v6/leaderboardUserEntry" && request.method === "GET") {
                return await handleUserEntry(request, url, env, cfg, origin);
            }
        } catch (err) {
            return errorResponse(err, origin);
        }

        return passThrough(request, url, cfg, origin, ctx, env);
    },
};
