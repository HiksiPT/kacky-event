#!/usr/bin/env node
// Posts the Author Medal runs (from tools/make-author-runs.js) through the event Worker:
//   node tools/post-author-runs.js <worker url> <site url> ../private/author-runs.json ../private/author-medal.json
// e.g.
//   node tools/post-author-runs.js https://kacky-event-proxy.you.workers.dev https://you.github.io ../private/author-runs.json ../private/author-medal.json
//
// author-medal.json holds the Author Medal account: { "token": "<64 hex>", "nickname": "Author Medal" }.
// Its user id (sha256 of the token) must be in AUTHOR_USER_IDS in proxy/wrangler.toml.
// The runs go through the Worker exactly like a run driven on the site, so they are replayed
// by the anti-cheat and stored under the event's hidden track ids. A run only replaces the
// account's time on a map if it is faster; the Worker keeps each account's best.

const fs = require("fs");
const crypto = require("crypto");

// Primary #044600, secondary #6d6e00, frame #000000, rims #676767.
const CAR_STYLE = "AAAAAABGBABubQAAAGdnZw";

async function main() {
    const [api, site, runsFile, accountFile] = process.argv.slice(2);
    if (!api || !site || !runsFile || !accountFile) {
        console.error("usage: node tools/post-author-runs.js <worker url> <site url> <author-runs.json> <author-medal.json>");
        process.exit(1);
    }
    const { runs } = JSON.parse(fs.readFileSync(runsFile, "utf8"));
    const account = JSON.parse(fs.readFileSync(accountFile, "utf8"));
    if (!/^[0-9a-f]{64}$/.test(account.token || "")) throw new Error("author-medal.json needs a 64-character token");
    const origin = new URL(site).origin;
    const week = 1;
    let ok = 0;
    for (const run of runs) {
        const body = new URLSearchParams({
            version: "0.6.2",
            userToken: account.token,
            nickname: account.nickname || "Author Medal",
            carStyle: account.carStyle || CAR_STYLE,
            trackId: run.trackId,
            frames: String(run.frames),
            recording: run.recording,
        });
        const res = await fetch(new URL("v6/leaderboard?nswsWeek=" + week, api.endsWith("/") ? api : api + "/"), {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded", Origin: origin },
            body,
        });
        const text = await res.text();
        const good = res.ok;
        if (good) ok++;
        console.log(`${good ? "posted " : "FAILED "} ${String(run.frames).padStart(6)}  ${run.name}${good ? "" : "  -> " + res.status + " " + text.slice(0, 80)}`);
    }
    console.log(`\n${ok}/${runs.length} runs posted as "${account.nickname || "Author Medal"}" (user id ${crypto.createHash("sha256").update(account.token).digest("hex").slice(0, 12)}...)`);
}

main().catch((err) => {
    console.error(err.stack || String(err));
    process.exit(1);
});
