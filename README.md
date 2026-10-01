# PolyTrack Kacky Event

A two-week Kacky event site for PolyTrack. The event tab and standings are laid out like [Kacky Throwback 2](https://dorachad.github.io/KackyThrowback2/). The game build, clips, medals and leaderboard proxy come from [Not So Weekly Shorts](https://notweeklyshorts.github.io), whose clips come from [misotweaks](https://missonance.github.io/misotweaks/).

The game is served as static files by GitHub Pages. A small Cloudflare Worker (`proxy/`) sits between it and Kodub's leaderboard server, and that is what enforces the event rules.

## What players get

- **Grinding stats.** Pausing a run shows a panel with this session's and the all-time numbers for that map (time, attempts, resets, finishes, finish rate, best/last/average finish, top speed, distance, inputs and more), plus a line for the whole event. The idea and the first rows are from MisoTweaks. Stored in the player's browser only.
- **No PolyFX and no Visual Effects popup.** Neither graphics mod is part of this build.
- **Kacky Event tab.** It opens by default under Play. Each map shows as a card:
  - its number (`#07`), name, author and difficulty tag;
  - the top 3 (🥇🥈🥉);
  - **See leaderboard** opens the map's leaderboard;
  - clicking the card plays the map.
- **Overall standings** beside the cards.
  - Players are ranked by maps finished, then by average rank (AP) over those maps.
  - The **Author Medal** account never appears in the standings and never takes a rank from anyone.
- **Medals** (Author / Gold / Silver / Bronze) on every map.
  - The Author time is the map's **validation run**: the run that was already on the map's own Kodub leaderboard when the site first read it. Validation runs are never shown on the site. Without one, the time of the **Author Medal** account is used.
  - Gold, Silver and Bronze are within 5%, 10% and 20% of that time.
- **Clips.** Players can clip their close attempts and finishes and share them as clip codes (`ClipsClau2...`); see **Clips** in the main menu. Select several clips of the same map to watch them together, with the timer, speedometer and checkpoint counter showing. A clip holds the run and the track id, never the track code.
- **Times and ranks** of everyone are visible. **Recordings are not**: nobody can watch or ghost someone else's run. Your own runs can still be watched.

Difficulties use the Kacky Throwback 2 scale:

| Level | Name |
|---|---|
| 9 | Absurd |
| 8 | Very Hard |
| 7 | Hard |
| 6 | Low Hard |
| 5 | High Medium |
| 4 | Medium |
| 3 | Low Medium |
| 2 | High Easy |
| 1 | Easy |

## Adding the maps

The plain track codes never go into this repository.

1. Put them in `private/event.json`, next to this folder and **not** inside it. List the maps **hardest first**:

   ```json
   {
     "title": "Kacky Event",
     "organisers": ["you", "friend"],
     "discordUrl": "https://discord.gg/...",
     "start": "2026-10-10T18:00:00Z",
     "end": "2026-10-24T18:00:00Z",
     "seed": 12345,
     "ownerHash": "(from tools/owner-key.js)",
     "absurdCount": 2,
     "maps": [
       { "name": "Hardest map", "author": "Someone", "code": "PolyTrack2..." },
       { "name": "Next map", "author": "Someone", "code": "PolyTrack2...", "difficulty": 8 }
     ]
   }
   ```

   - **Difficulty.** The top `absurdCount` maps become **Absurd**. The rest are spread evenly from Very Hard down to Easy. Add `"difficulty": 1-9` to any map to set it yourself.
   - **Covers.** Add `"cover": "images/covers/07.png"` to a map to use your own cover picture, like Kacky Throwback 2's. Without one, the card shows a top-down picture of the map. `"thumb"` sets a different picture for the map's own track screen (a wide cover suits the cards, a 16:9 picture suits the track screen). `"icon"` replaces the difficulty icon, and `"coverFit": "contain"` shows the cover whole instead of filling the card.

2. Build:

   ```
   node tools/build-event.js ../private/event.json
   ```

   The build does the following:

   - It checks every code.
   - It assigns the difficulties.
   - It **shuffles the order** and numbers the maps `#01`…`#NN`. The same `seed` gives the same order.
   - It writes these files:
     - `tracks/event/event.track`: the encrypted maps;
     - `mod/event_config.js`;
     - `EVENT_TRACK_IDS` in `proxy/wrangler.toml`;
     - `private/event-build.json`: your record of which number is which map.

   It needs the Kacky Lab physics harness at `../../Kacky Lab`, or set `KACKY_LAB` to its folder.

3. Redeploy the Worker (below), then push the site.

## Deploying

### 1. Become the owner

The owner is you. Only the owner can use the moderation page.

1. In the game, open **Garage**, click your name, then **Export**, and copy your private token.
2. Run `node tools/owner-key.js <token>`.
3. Put the two values it prints into `proxy/wrangler.toml`, and put `ownerHash` into `private/event.json`.

Never commit the token itself.

### 2. The Worker (Cloudflare, free plan)

```
cd proxy
npx wrangler login
npx wrangler secret put TRACK_SALT      # paste a long random string; keep a copy; never change it
npx wrangler deploy
```

1. Put the URL it prints, with a trailing `/`, into `mod/api_base.js`.
2. Put the site's address, `https://<your-github-username>.github.io`, into `ALLOWED_ORIGINS` in `proxy/wrangler.toml`.
3. Deploy again.

### 3. The site (GitHub Pages)

1. Push this folder to a GitHub repository.
2. Go to Settings → Pages → *Deploy from a branch*, choose `main`, then `/ (root)`.

### 4. Sync the maps and set the medals

- **Sync the maps for the anti-cheat.** Open the site once with your owner profile. A few seconds after loading, it uploads each map's physics data to the Worker. Until a map is synced, runs on it stay hidden.
- **Set the Author Medals.** The Author Medal account is `private/author-medal.json`; its user id is in `AUTHOR_USER_IDS`, so anyone else calling themselves "Author Medal" is hidden. `node tools/make-author-runs.js ../private/event.json ../private/author-inputs.json` builds runs from known inputs (each is replayed first), and `node tools/post-author-runs.js <worker url> <site url> ../private/author-runs.json ../private/author-medal.json` posts them. For other maps, import the account's token into the game as a profile and drive them.

## Moderation

Open `moderate.html` on the site in the browser where your owner profile is active. For every map it lists every run, whether hidden or not. For each run it shows where it was driven:

| Label | Meaning |
|---|---|
| **Driven on site** | Played and uploaded through this site. |
| **FLAGGED: driven off site** | Uploaded to Kodub some other way, for example with an extracted track code or another tool. See below. |
| **Validation run** | On the map's own Kodub board before the Worker first read it. Never shown; the fastest is the map's author time. Listed inside each map, with **Remove** (don't use it) and **Show as a normal run**. **Re-read validation runs now** takes the boards as they are at that moment; use it just before the event starts. |
| **Approved by you** | Allowed by hand. |

### Off-site runs (flagged)

Every off-site run is **flagged and saved** in the red box at the top of the page. The box keeps each run even after the player replaces it or it leaves Kodub's board. For each run it shows:

- the player, the map, the time and when it was first seen;
- **Replay check**: whether its inputs really finish the map in the game's physics. "Inputs really finish" means someone played the map somewhere else; "Inputs don't finish" means the run was faked;
- **Copy clip code**: the run as a clip code. Paste it into **Clips** in the game to watch it.

`OFFSITE_RUNS` in `proxy/wrangler.toml` decides who sees these runs:

- `"shadow"` (the default): **only the player who drove it** sees it, on the map's leaderboard, their own rank and the overall standings. They think it counted. Nobody else sees it, and nobody is ranked against it.
- `"public"`: everyone sees it and it counts, until you remove it.

**Approve** makes a flagged run count for everyone. **Remove run** and **Ban player** hide it from everyone, including the player who drove it.

### Moderators

`MODERATOR_KEY_HASHES` in `proxy/wrangler.toml` lists people who can use this page and nothing else. Their own runs are checked and kept private like anyone else's. For each moderator:

1. Run `node tools/owner-key.js <their token>`.
2. Add the value on its `OWNER_KEY_HASHES` line to `MODERATOR_KEY_HASHES`.

Only the owner (you) can sync maps to the anti-cheat. Your own runs skip the checks.

Every run is also replayed through the game's own physics. A run that doesn't really finish on the time it claims is refused before it reaches Kodub.

The page has these buttons:

- **Remove run**: takes one time off the map's leaderboard and out of the standings.
- **Ban player**: removes an account from every leaderboard and from the standings.
- **Approve**: lets through a hidden run you know is fine.
- **Restore** and **Unban**: undo.

Changes apply within about 15 seconds. `BANNED_NICKNAMES` in `proxy/wrangler.toml` bans by name, but the page bans by account, which is sturdier because names can change.

## What is and isn't protected

- **Kept private by the Worker.** These are enforced on the server, so no page trick gets around them:
  - other players' recordings;
  - whether a run was driven on the site;
  - bans and removed runs;
  - the anti-cheat replay.
- **Stored under secret ids.** Event runs are stored on Kodub under track ids derived from `TRACK_SALT`, so nobody can read or upload to them through Kodub directly or through another proxy.
- **Track codes are encrypted.** They're in the site's files as AES-GCM ciphertext, with the key split and masked. The page never exposes a function that returns them. Hosting a map in multiplayer, which would send its code to other players, is blocked.
- **The limit.** A browser game has to decrypt a map to play it. Someone skilled with developer tools can still pull a code out of memory while playing. What stops that from helping them is the Worker: a run driven outside the site never counts. `disable-devtool` in `index.html` only discourages casual poking.

## Files

| Path | What it is |
|---|---|
| `mod/kacky_event.js` | The event tab and standings. |
| `mod/grinding_stats.js` | The grinding stats panel in the pause menu. |
| `mod/event_config.js` | Generated: maps, difficulties, numbers, key parts, event text. |
| `mod/api_base.js` | The Worker's address. |
| `moderate.html` | The owner's moderation page. |
| `proxy/` | The Cloudflare Worker: leaderboard proxy, standings, anti-cheat, moderation. |
| `tools/` | `build-event.js`, `owner-key.js`. |
| `main.bundle.js` | The game. Changes from Not So Weekly Shorts: the event track list, private decryption, visible times with private recordings, Author Medal benchmark, multiplayer block, branding. |

## Credits and permission

- PolyTrack is by Kodub.
- The game build, proxy, medals and clips are from Not So Weekly Shorts by brinleyww, and the clips are from misotweaks by Missonance (Apache-2.0).
- The event layout follows Kacky Throwback 2 by DoraChad. The difficulty icons (`images/event/difficulty/1-9.png`) are its own.

Not So Weekly Shorts and Kacky Throwback 2 publish no license. Ask their authors before hosting this publicly.
