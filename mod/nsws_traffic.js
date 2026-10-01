// Site traffic for the owner dashboard, the owner's anti-cheat track sync, and the notice
// shown when a run fails the anti-cheat. Beats carry random ids, the nickname and what the
// player is doing; never the account token.
(function () {
    const API = window.__nswsApiBase;
    if (!API || !window.fetch || !window.crypto || !crypto.getRandomValues) return;

    // sha256("nsws-owner:" + token); the Worker checks the same hash before sending any stats.
    // Set in mod/event_config.js (tools/owner-key.js prints it). Empty = nobody is the owner.
    const OWNER_HASH = (window.__eventConfig || {}).ownerHash || "";
    const VISITOR_KEY = "nsws_visitor";
    const BEAT_VISIBLE_S = 60;
    const BEAT_HIDDEN_S = 240;
    const MIN_GAP_MS = 15000;
    // A longer gap between samples means the tab was frozen or the machine slept.
    const MAX_SAMPLE_VISIBLE_S = 5;
    const MAX_SAMPLE_HIDDEN_S = 75;
    const TRACK_ID = /^[0-9a-f]{64}$/;
    const TRACK_EVENTS = { attempts: 0, finishes: 1, uploads: 2 };

    const randomHex = (bytes) => Array.from(crypto.getRandomValues(new Uint8Array(bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
    const sessionId = randomHex(16);
    let visitorId = null;
    try {
        visitorId = localStorage.getItem(VISITOR_KEY);
    } catch {}
    if (!/^[0-9a-f]{32}$/.test(visitorId || "")) {
        visitorId = randomHex(16);
        try {
            localStorage.setItem(VISITOR_KEY, visitorId);
        } catch {}
    }

    function readProfile() {
        try {
            const slot = parseInt(localStorage.getItem("polytrack_v5_prod_user_slot") ?? "0", 10);
            return JSON.parse(localStorage.getItem("polytrack_v5_prod_user_" + (slot >= 0 ? slot : 0)));
        } catch {
            return null;
        }
    }

    let runtime = 0;
    let focus = 0;
    let driving = 0;
    let events = {};
    let tracks = {};
    let seq = 0;
    let sentNick = null;
    let currentTrack = null;
    let lastSample = performance.now();
    let lastBeat = -Infinity;

    function currentState() {
        if (document.querySelector(".editor-ui")) return "editor";
        if (document.querySelector(".preview-toolbar-ui")) return "watch";
        if (document.querySelector(".game-ui")) return "race";
        if (document.querySelector(".customization-ui")) return "garage";
        return "menu";
    }

    function sample() {
        const now = performance.now();
        const hidden = document.visibilityState === "hidden";
        const seconds = Math.min((now - lastSample) / 1000, hidden ? MAX_SAMPLE_HIDDEN_S : MAX_SAMPLE_VISIBLE_S);
        lastSample = now;
        if (!(seconds > 0)) return;
        runtime += seconds;
        if (!hidden && document.hasFocus()) {
            focus += seconds;
            if (currentState() === "race") driving += seconds;
        }
    }

    function beat(end) {
        sample();
        const state = currentState();
        const hidden = document.visibilityState === "hidden";
        const body = {
            s: sessionId,
            v: visitorId,
            n: seq++,
            rt: Math.round(runtime * 10) / 10,
            ft: Math.round(focus * 10) / 10,
            dt: Math.round(driving * 10) / 10,
            nx: hidden ? BEAT_HIDDEN_S : BEAT_VISIBLE_S,
            st: state,
            tk: state === "race" ? currentTrack : null,
            ev: events,
            tr: tracks,
        };
        if (end) body.end = 1;
        if (body.n === 0 && document.referrer) {
            try {
                const host = new URL(document.referrer).host;
                if (host && host !== location.host) body.ref = host;
            } catch {}
        }
        const nick = readProfile()?.nickname;
        if (typeof nick === "string" && nick !== sentNick) body.nick = nick;

        const sent = { runtime, focus, driving, events, tracks };
        runtime = focus = driving = 0;
        events = {};
        tracks = {};
        lastBeat = performance.now();
        fetch(API + "nsws/beat", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify(body),
            keepalive: true,
            credentials: "omit",
        }).then((response) => {
            if (response.ok && body.nick) sentNick = body.nick;
        }).catch(() => {
            // Try again with the next beat, unless the page is going away.
            if (end) return;
            runtime += sent.runtime;
            focus += sent.focus;
            driving += sent.driving;
            for (const [k, v] of Object.entries(sent.events)) events[k] = (events[k] || 0) + v;
            for (const [k, v] of Object.entries(sent.tracks)) {
                const t = tracks[k] || (tracks[k] = [0, 0, 0]);
                for (let i = 0; i < 3; i++) t[i] += v[i];
            }
        });
    }

    setInterval(() => {
        sample();
        const hidden = document.visibilityState === "hidden";
        if (performance.now() - lastBeat >= (hidden ? BEAT_HIDDEN_S : BEAT_VISIBLE_S) * 1000) beat(false);
    }, 1000);

    document.addEventListener("visibilitychange", () => {
        if (performance.now() - lastBeat >= MIN_GAP_MS) beat(false);
    });
    window.addEventListener("pagehide", () => beat(true));
    window.addEventListener("pageshow", (e) => {
        if (e.persisted) {
            lastSample = performance.now();
            beat(false);
        }
    });

    window.__nswsTraffic = {
        event(name, track) {
            events[name] = (events[name] || 0) + 1;
            if (typeof track !== "string" || !TRACK_ID.test(track) || !(name in TRACK_EVENTS)) return;
            const t = tracks[track] || (tracks[track] = [0, 0, 0]);
            t[TRACK_EVENTS[name]]++;
            if (name === "attempts") currentTrack = track;
        },
    };

    async function ownerToken() {
        const token = readProfile()?.token;
        if (typeof token !== "string" || !TRACK_ID.test(token) || !crypto.subtle) return null;
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("nsws-owner:" + token));
        const hash = Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
        return OWNER_HASH && hash === OWNER_HASH ? token : null;
    }
    window.__eventIsOwner = () => ownerToken().then((t) => !!t, () => false);

    function ownerPost(path, token, extra) {
        return fetch(API + "nsws/" + path, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ token, ...extra }),
            credentials: "omit",
            cache: "no-store",
        });
    }

    // The Worker can't decrypt or build tracks itself, so the owner's game sends each
    // Not So Weekly Shorts track's physics data the first time it is missing there.
    let syncing = null;
    function syncTracks(force) {
        if (syncing) return syncing;
        syncing = (async () => {
            const token = await ownerToken();
            if (!token || !window.__nswsTrackCheckData || !window.__nswsTracksForWeek) return { synced: 0, total: 0 };
            const status = await ownerPost("anticheat", token, {});
            if (!status.ok) throw new Error("HTTP " + status.status);
            const have = new Set((await status.json()).tracks.map((t) => t.id));
            const ids = [...new Set((window.__nswsWeeks || []).flatMap((w) => window.__nswsTracksForWeek(w.week).map((t) => t.id)))]
                .filter((id) => force || !have.has(id));
            let synced = 0;
            // One track per request keeps each one well inside the Worker's CPU limit.
            for (const id of ids) {
                const track = await window.__nswsTrackCheckData(id).catch(() => null);
                if (!track) continue;
                const response = await ownerPost("anticheat/tracks", token, { tracks: [track] });
                if (response.ok) synced++;
            }
            return { synced, total: ids.length };
        })().finally(() => {
            syncing = null;
        });
        return syncing;
    }

    let autoSynced = false;
    let panelScript = null;
    window.__nswsOwner = {
        check: () => ownerToken().then((token) => {
            if (token && !autoSynced) {
                autoSynced = true;
                setTimeout(() => syncTracks(false).catch(() => {}), 4000);
            }
            return !!token;
        }, () => false),
        syncTracks,
        token: ownerToken,
        api: API,
        async open() {
            if (!(await ownerToken())) return;
            if (!panelScript) {
                panelScript = new Promise((resolve, reject) => {
                    const script = document.createElement("script");
                    script.src = "mod/nsws_owner.js";
                    script.onload = resolve;
                    script.onerror = () => {
                        panelScript = null;
                        reject(new Error("Failed to load the owner dashboard"));
                    };
                    document.head.appendChild(script);
                });
            }
            await panelScript;
            window.__nswsOwnerPanel.open();
        },
    };

    let lastNotice = 0;
    window.__nswsRunRejected = () => {
        if (Date.now() - lastNotice < 15000) return;
        lastNotice = Date.now();
        const note = document.createElement("div");
        note.textContent = "This run failed the anti-cheat check, so it wasn't uploaded.";
        note.style.cssText = "position:fixed;left:50%;bottom:72px;transform:translateX(-50%);z-index:10003;" +
            "background:var(--surface-color,#28346a);color:#fff;padding:12px 22px;font-size:18px;" +
            "clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);box-shadow:0 8px 24px rgba(0,0,0,.4);pointer-events:none;";
        document.body.appendChild(note);
        setTimeout(() => note.remove(), 6000);
    };

    beat(false);
})();
