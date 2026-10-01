#!/usr/bin/env node
// Builds the Author Medal runs from known finishing inputs:
//   node tools/make-author-runs.js ../private/event.json ../private/author-inputs.json
//
// author-inputs.json: { "inputs": { "<map name>": [[frame, "u"], [3004, "ur"], ...] } }
// (keys: u = accelerate, d = brake/reverse, l = left, r = right; a frame is 1 ms).
//
// Every run is replayed with the game's own physics (the Kacky Lab harness) on the map's
// current code, and only runs that finish are kept, with the exact finish time. Writes
// private/author-runs.json next to the event file, for tools/post-author-runs.js.

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const SITE = path.resolve(__dirname, "..");
const LAB = process.env.KACKY_LAB || path.resolve(SITE, "..", "..", "Kacky Lab");

// The game's recording format: for each key (up, right, down, left, reset) a 3-byte count
// and the frames where it toggles (3-byte deltas), deflated and base64url-encoded.
function recording(schedule) {
    const keys = { up: "u", right: "r", down: "d", left: "l", reset: "x" };
    const segs = schedule.slice().sort((a, b) => a[0] - b[0]);
    const parts = [];
    for (const ch of Object.values(keys)) {
        const toggles = [];
        let held = false;
        for (const [f, k] of segs) {
            const now = k.includes(ch);
            if (now !== held) {
                toggles.push(f);
                held = now;
            }
        }
        const b = Buffer.alloc(3 + 3 * toggles.length);
        b[0] = toggles.length & 255; b[1] = (toggles.length >>> 8) & 255; b[2] = (toggles.length >>> 16) & 255;
        toggles.forEach((v, i) => {
            const d = i === 0 ? v : v - toggles[i - 1];
            b[3 + 3 * i] = d & 255; b[4 + 3 * i] = (d >>> 8) & 255; b[5 + 3 * i] = (d >>> 16) & 255;
        });
        parts.push(b);
    }
    return zlib.deflateSync(Buffer.concat(parts), { level: 9 }).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const fmt = (f) => `${Math.floor(f / 60000)}:${String(Math.floor(f / 1000) % 60).padStart(2, "0")}.${String(f % 1000).padStart(3, "0")}`;

async function main() {
    const [eventFile, inputsFile] = process.argv.slice(2);
    if (!eventFile || !inputsFile) {
        console.error("usage: node tools/make-author-runs.js <private/event.json> <private/author-inputs.json>");
        process.exit(1);
    }
    const event = JSON.parse(fs.readFileSync(eventFile, "utf8"));
    const inputs = JSON.parse(fs.readFileSync(inputsFile, "utf8")).inputs || {};
    const { simulate, boot } = require(path.join(LAB, "sim", "sim.js"));
    const pt = await boot();
    const runs = [];
    const missing = [];
    for (const m of event.maps) {
        const code = m.code.replace(/\s+/g, "");
        const parsed = pt.Ko.fromExportString(code);
        const name = m.name || parsed.trackMetadata.name;
        const schedule = inputs[name];
        if (!schedule) {
            missing.push(name + " (no inputs)");
            continue;
        }
        const r = await simulate(code, schedule, { maxFrames: 60000 });
        if (!r.final.finished) {
            missing.push(name + " (inputs no longer finish)");
            continue;
        }
        runs.push({ name, trackId: parsed.trackData.getId(), frames: r.final.finishFrames, recording: recording(schedule), schedule });
        console.log(`  ${fmt(r.final.finishFrames).padStart(9)}  ${name}`);
    }
    const out = path.join(path.dirname(path.resolve(eventFile)), "author-runs.json");
    fs.writeFileSync(out, JSON.stringify({ builtAt: new Date().toISOString(), runs }, null, 1));
    console.log(`\n${runs.length} Author Medal runs written to ${out}`);
    if (missing.length) console.log("No Author Medal run for:\n  " + missing.join("\n  "));
    process.exit(0);
}

main().catch((err) => {
    console.error(err.stack || String(err));
    process.exit(1);
});
