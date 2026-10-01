#!/usr/bin/env node
// Builds the event from a private map list:
//   node tools/build-event.js ../private/event.json
//
// Reads the map list (hardest first), assigns difficulties, shuffles the order, numbers the
// maps "#01".."#NN", encrypts every track code into tracks/event/event.track, and writes
// mod/event_config.js plus EVENT_TRACK_IDS in proxy/wrangler.toml.
//
// The plain track codes only ever live in the private file; nothing written into the site
// contains them unencrypted. Keep the private folder OUT of the git repository.
//
// Track ids are computed with the game's own code through the Kacky Lab physics harness
// (set KACKY_LAB to its folder if it isn't at ../../Kacky Lab).

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SITE = path.resolve(__dirname, "..");
const LAB = process.env.KACKY_LAB || path.resolve(SITE, "..", "..", "Kacky Lab");

// Same scale and names as Kacky Throwback 2.
const DIFFICULTIES = {
    1: "Easy", 2: "High Easy", 3: "Low Medium", 4: "Medium", 5: "High Medium",
    6: "Low Hard", 7: "Hard", 8: "Very Hard", 9: "Absurd",
};
const ENVIRONMENTS = ["Summer", "Winter", "Desert"];

function fail(message) {
    console.error("build-event: " + message);
    process.exit(1);
}

// Hardest first: the top `absurd` maps are Absurd (9); the rest are spread as evenly as
// possible over Very Hard (8) down to Easy (1), harder levels taking any remainder.
function autoDifficulties(count, absurd) {
    const out = [];
    for (let i = 0; i < Math.min(absurd, count); i++) out.push(9);
    const rest = count - out.length;
    const levels = 8;
    const base = Math.floor(rest / levels);
    let extra = rest % levels;
    for (let level = 8; level >= 1; level--) {
        let n = base + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;
        for (let i = 0; i < n; i++) out.push(level);
    }
    return out;
}

// Deterministic shuffle so a rebuild with the same seed gives the same numbers.
function shuffle(list, seed) {
    let s = seed >>> 0 || 1;
    const rnd = () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rnd() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// The key is stored as XOR-masked 8-byte chunks, never as one plain string.
function splitKey(keyHex) {
    const chunks = [];
    const masks = [];
    for (let i = 0; i < keyHex.length; i += 16) {
        const part = Buffer.from(keyHex.slice(i, i + 16), "hex");
        const mask = crypto.randomBytes(part.length);
        chunks.push(Buffer.from(part.map((b, k) => b ^ mask[k])).toString("hex"));
        masks.push(mask.toString("hex"));
    }
    return { chunks, masks };
}

function encrypt(json, key) {
    const nonce = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, nonce);
    const body = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(json), "utf8")), cipher.final()]);
    // WebCrypto AES-GCM wants the tag appended to the ciphertext.
    return Buffer.concat([nonce, body, cipher.getAuthTag()]).toString("base64");
}

async function main() {
    const input = process.argv[2];
    if (!input) fail("usage: node tools/build-event.js <private/event.json>");
    const cfg = JSON.parse(fs.readFileSync(input, "utf8"));
    const maps = cfg.maps;
    if (!Array.isArray(maps) || !maps.length) fail("event.json needs a non-empty \"maps\" list (hardest first)");

    let simLib;
    try {
        simLib = require(path.join(LAB, "sim", "sim.js"));
    } catch (err) {
        fail("can't load the Kacky Lab harness from " + LAB + " (set KACKY_LAB): " + err.message);
    }
    const pt = await simLib.boot();

    const auto = autoDifficulties(maps.length, cfg.absurdCount ?? 2);
    const seen = new Set();
    const tracks = maps.map((m, rank) => {
        const code = String(m.code || "").replace(/\s+/g, "");
        const parsed = pt.Ko.fromExportString(code);
        if (!parsed) fail(`map ${rank + 1} (${m.name}) has a track code the game can't read`);
        const id = parsed.trackData.getId();
        if (seen.has(id)) fail(`map ${rank + 1} (${m.name}) is the same track as an earlier map`);
        seen.add(id);
        if (!parsed.trackData.getStartTransform()) fail(`map ${rank + 1} (${m.name}) has no start`);
        const difficulty = Number.isInteger(m.difficulty) ? m.difficulty : auto[rank];
        if (!DIFFICULTIES[difficulty]) fail(`map ${rank + 1} (${m.name}): difficulty must be 1-9`);
        return {
            rank: rank + 1,
            id,
            code,
            name: m.name || parsed.trackMetadata.name,
            author: m.author || parsed.trackMetadata.author || "Unknown",
            env: ENVIRONMENTS[parsed.trackData.environment] || "Summer",
            difficulty,
            cover: m.cover || null,
            coverFit: m.coverFit || null,
            icon: m.icon || null,
            thumb: m.thumb || null,
        };
    });

    const order = shuffle(tracks, cfg.seed ?? Date.now());
    order.forEach((t, i) => (t.number = i + 1));
    const pad = String(order.length).length < 2 ? 2 : String(order.length).length;
    const label = (t) => "#" + String(t.number).padStart(pad, "0");

    const key = crypto.randomBytes(32);
    const file = "tracks/event/event.track";
    fs.mkdirSync(path.join(SITE, "tracks", "event"), { recursive: true });
    fs.writeFileSync(path.join(SITE, file), encrypt({ tracks: order.map((t) => ({ id: t.id, trackExportString: t.code })) }, key));
    const { chunks, masks } = splitKey(key.toString("hex"));

    const title = cfg.title || "Kacky Event";
    const config = {
        title,
        tabTitle: cfg.tabTitle || title,
        tabAllTracks: cfg.tabAllTracks || "All tracks",
        // Pictures behind the two tabs on the track selection screen.
        tabCover: cfg.tabCover || null,
        tabAllTracksCover: cfg.tabAllTracksCover || null,
        organisers: cfg.organisers || [],
        discordUrl: cfg.discordUrl || "",
        discordLabel: cfg.discordLabel || (title + " Discord"),
        start: cfg.start || null,
        end: cfg.end || null,
        ownerHash: cfg.ownerHash || "",
        difficulties: DIFFICULTIES,
    };
    const weeks = [{
        week: 1,
        label: title,
        chunks,
        masks,
        file,
        tracks: order.map((t) => ({ id: t.id, name: label(t) + " " + t.name, short: label(t), author: t.author, env: t.env, thumb: t.thumb || t.cover || "images/event/thumb_" + t.env + ".svg" })),
    }];
    const eventTracks = order.map((t) => ({
        id: t.id, number: t.number, label: label(t), name: t.name, author: t.author, env: t.env,
        difficulty: t.difficulty, cover: t.cover, coverFit: t.coverFit, icon: t.icon,
    }));
    const js = "// Written by tools/build-event.js - don't edit by hand; rebuild instead.\n"
        + "window.__eventConfig = " + JSON.stringify(config, null, 2) + ";\n"
        + "window.__eventWeeks = " + JSON.stringify(weeks, null, 2) + ";\n"
        + "window.__eventTracks = " + JSON.stringify(eventTracks, null, 2) + ";\n";
    fs.writeFileSync(path.join(SITE, "mod", "event_config.js"), js);

    const tomlPath = path.join(SITE, "proxy", "wrangler.toml");
    const toml = fs.readFileSync(tomlPath, "utf8");
    const ids = "EVENT_TRACK_IDS = [\n" + order.map((t) => `    "${t.id}", # ${label(t)} ${t.name.replace(/[\r\n#]/g, "")}`).join("\n") + "\n]";
    if (!/EVENT_TRACK_IDS = \[[^\]]*\]/.test(toml)) fail("EVENT_TRACK_IDS not found in proxy/wrangler.toml");
    fs.writeFileSync(tomlPath, toml.replace(/EVENT_TRACK_IDS = \[[^\]]*\]/, ids));

    // Private record of the build (ranks, numbers, ids) - next to the input, not in the site.
    const record = path.join(path.dirname(path.resolve(input)), "event-build.json");
    fs.writeFileSync(record, JSON.stringify({
        builtAt: new Date().toISOString(),
        tracks: order.map((t) => ({ label: label(t), rank: t.rank, difficulty: t.difficulty, difficultyName: DIFFICULTIES[t.difficulty], name: t.name, author: t.author, id: t.id })),
    }, null, 2));

    console.log(`${order.length} maps built:`);
    for (const t of order) console.log(`  ${label(t)}  ${DIFFICULTIES[t.difficulty].padEnd(11)}  (rank ${String(t.rank).padStart(2)})  ${t.name} - ${t.author}`);
    console.log("\nWrote " + file + ", mod/event_config.js, proxy/wrangler.toml (EVENT_TRACK_IDS), " + record);
    process.exit(0);
}

main().catch((err) => fail(err.stack || String(err)));
