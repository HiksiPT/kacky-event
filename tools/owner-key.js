#!/usr/bin/env node
// Prints the values that make you the event's owner (moderation page, anti-cheat sync):
//   node tools/owner-key.js <your profile's private token>
//
// Get the token in the game: Garage -> your name -> Export. Never commit or share the token
// itself; only the two hashes below go into the repository.
const crypto = require("crypto");
const token = (process.argv[2] || "").trim().toLowerCase();
if (!/^[0-9a-f]{64}$/.test(token)) {
    console.error("usage: node tools/owner-key.js <64-character private token>");
    process.exit(1);
}
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const ownerHash = sha("nsws-owner:" + token);
console.log("proxy/wrangler.toml:");
console.log(`  OWNER_KEY_HASHES = ["${ownerHash}"]`);
console.log(`  OWNER_USER_IDS = ["${sha(token)}"]`);
console.log("private/event.json:");
console.log(`  "ownerHash": "${ownerHash}"`);
