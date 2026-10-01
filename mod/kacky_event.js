// The event tab (modelled on Kacky Throwback 2): every map as a card with its number,
// difficulty and top 3, and the overall standings — maps finished first, then average rank.
// Standings come from the proxy's /event/standings, which already leaves out the
// "Author Medal" account, banned players, removed runs and runs not driven on this site.
(function () {
    const CFG = window.__eventConfig || {};
    const TRACKS = (window.__eventTracks || []).slice().sort((a, b) => a.number - b.number);
    const API = window.__nswsApiBase;
    const NAMES = CFG.difficulties || { 1: "Easy", 2: "High Easy", 3: "Low Medium", 4: "Medium", 5: "High Medium", 6: "Low Hard", 7: "Hard", 8: "Very Hard", 9: "Absurd" };
    const REFRESH_MS = 60_000;

    const css = document.createElement("style");
    css.textContent = `
button[data-event-hidden] { display: none !important; }
.kev-tab { background: transparent; }
.track-selection-ui.kev-active > .tracks-container:not(.kev-tab) { display: none !important; }
.kev-root { display: flex; flex-direction: column; height: 100%; box-sizing: border-box; }
.kev-title { text-align: center; color: #fff; font-size: 70px; margin: 20px 20px 0; }
.kev-sub { text-align: center; color: #fff; opacity: .8; font-size: 18px; margin: 4px 0 12px; }
.kev-main { display: flex; flex-direction: row; min-height: 0; flex: 1; }
.kev-tracks { gap: 20px; padding: 20px; width: 60%; display: flex; flex-direction: column; overflow-y: scroll; overflow-x: clip; direction: rtl; box-sizing: border-box; }
.kev-card { width: 100%; height: 180px; flex-shrink: 0; position: relative; direction: ltr; }
.kev-card > .kev-cover { position: absolute; inset: 0; border: none; cursor: pointer; clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  background-size: cover; background-position: center; image-rendering: pixelated; }
.kev-card > .kev-cover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(90deg, rgba(10,15,40,.75), rgba(10,15,40,.15) 60%, rgba(10,15,40,.55)); }
.kev-card > .kev-cover.kev-fit { background-size: contain, cover; background-repeat: no-repeat; image-rendering: auto; }
.kev-card:hover > .kev-cover { filter: brightness(1.15); }
.kev-name, .kev-author, .kev-tag-text, .kev-top3 { text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; color: #fff; }
.kev-name { margin: 8px 20px; font-size: 45px; position: relative; z-index: 1; pointer-events: none; }
.kev-name > .kev-num { opacity: .85; margin-right: 12px; }
.kev-author { margin: 0 20px; font-size: 18px; position: relative; z-index: 1; pointer-events: none; }
.kev-tag-div { width: 70%; height: 40%; position: absolute; bottom: 5%; left: 0; display: flex; flex-direction: row; pointer-events: none; }
.kev-tag { margin: 0 0 0 20px; display: flex; flex-direction: row; height: 100%; align-items: center; }
.kev-tag-img { height: 60%; aspect-ratio: 1/1; background-size: cover; background-position: center; }
.kev-tag-text { margin: 0 10px; font-size: 24px; }
.kev-right { position: absolute; right: 0; top: 0; height: 100%; width: 28%; z-index: 1; display: flex; flex-direction: column; justify-content: end; align-items: flex-end; }
.kev-top3 { list-style: none; text-align: right; font-size: 22px; margin: 0 12px 0 0; padding: 0; white-space: nowrap; }
.kev-view { border: solid #fff 4px; margin: 4% 12px 5% 0; border-radius: 10px; background: none; color: #fff; font-size: 16px; cursor: pointer; width: 80%; padding: 6px; font-family: inherit; }
.kev-view:hover { background: rgba(255,255,255,.12); }
.kev-lb-outer { width: 40%; margin: 20px 40px 0 20px; display: flex; flex-direction: column; min-height: 0; }
.kev-lb { background: #28346a; width: 100%; flex: 1; display: flex; flex-direction: column; min-height: 0; }
.kev-lb-note { color: #fff; text-align: center; font-size: 15px; margin: 6px 0; }
.kev-entries { flex: 1; display: flex; flex-direction: column; overflow-y: scroll; overflow-x: hidden; }
.kev-row { height: 50px; display: flex; flex-direction: row; color: #fff; align-items: center; text-align: center; flex-shrink: 0; }
.kev-row p { margin: 10px 6px; padding: 10px; border-radius: 5px; }
.kev-row .kev-c-rank { min-width: 34px; }
.kev-row .kev-c-name { flex: 1; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kev-row .kev-c-num { min-width: 60px; }
.kev-row.kev-body p { background: #212b58; }
.kev-row.kev-me p { background: #3a4a8f; }
`;
    document.head.appendChild(css);

    // Difficulty icons: Kacky Throwback 2's own (images/event/difficulty/1-9.png).
    function badge(level) {
        return 'url("images/event/difficulty/' + (level >= 1 && level <= 9 ? level : 5) + '.png")';
    }

    const ENV_BG = { Summer: "linear-gradient(135deg,#3d7a4a,#1f3d6b)", Winter: "linear-gradient(135deg,#8fb5e0,#2b4a7a)", Desert: "linear-gradient(135deg,#c79a55,#6b4424)" };

    function el(tag, cls, text) {
        const e = document.createElement(tag);
        if (cls) e.className = cls;
        if (text != null) e.textContent = text;
        return e;
    }

    // The player's own token: the standings count their own runs exactly as their boards show them.
    function profileToken() {
        try {
            const slot = parseInt(localStorage.getItem("polytrack_v5_prod_user_slot") ?? "0", 10);
            const token = JSON.parse(localStorage.getItem("polytrack_v5_prod_user_" + (slot >= 0 ? slot : 0)))?.token;
            return typeof token === "string" && /^[0-9a-f]{64}$/.test(token) ? token : null;
        } catch {
            return null;
        }
    }

    function profileNickname() {
        try {
            const slot = parseInt(localStorage.getItem("polytrack_v5_prod_user_slot") ?? "0", 10);
            return JSON.parse(localStorage.getItem("polytrack_v5_prod_user_" + (slot >= 0 ? slot : 0)))?.nickname ?? null;
        } catch {
            return null;
        }
    }

    function openTrack(id, play) {
        if (!window.__bw_selectTrackById || !window.__bw_selectTrackById(id)) return;
        if (!play) return;
        // Quick play: press the track screen's Play button once it is up.
        let tries = 0;
        const t = setInterval(() => {
            const btn = [...document.querySelectorAll("#ui button")].find((b) => b.offsetParent && /^\s*Play\s*$/.test(b.textContent));
            if (btn || ++tries > 40) {
                clearInterval(t);
                btn?.click();
            }
        }, 50);
    }

    function timeLeft() {
        const now = Date.now();
        const start = CFG.start ? Date.parse(CFG.start) : null;
        const end = CFG.end ? Date.parse(CFG.end) : null;
        const fmt = (ms) => {
            const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60;
            return (d ? d + "d " : "") + h + "h " + m + "m";
        };
        if (start && now < start) return "Starts in " + fmt(start - now);
        if (end && now < end) return "Ends in " + fmt(end - now);
        if (end) return "The event has ended";
        return "";
    }

    let cards = new Map();
    let entriesDiv = null;
    let noteEl = null;
    let subEl = null;

    function build(container) {
        const root = el("div", "kev-root");
        root.appendChild(el("p", "kev-title", "---- " + (CFG.title || "Kacky Event") + " ----"));
        subEl = root.appendChild(el("p", "kev-sub", timeLeft()));
        const main = root.appendChild(el("div", "kev-main"));
        const list = main.appendChild(el("div", "kev-tracks"));

        for (const t of TRACKS) {
            const card = list.appendChild(el("div", "kev-card"));
            const cover = card.appendChild(el("button", "kev-cover"));
            // The map's colours sit under the picture, so a missing picture still leaves a card.
            cover.style.backgroundImage = (t.cover ? `url("${t.cover}"), ` : "") + (ENV_BG[t.env] || ENV_BG.Summer);
            if (t.cover) cover.style.imageRendering = "auto";
            if (t.cover && t.coverFit === "contain") cover.classList.add("kev-fit");
            cover.title = "Play";
            cover.addEventListener("click", () => openTrack(t.id, true));
            const name = card.appendChild(el("p", "kev-name"));
            name.appendChild(el("span", "kev-num", t.label));
            name.appendChild(document.createTextNode(t.name));
            card.appendChild(el("p", "kev-author", t.author));
            const tagDiv = card.appendChild(el("div", "kev-tag-div"));
            const tag = tagDiv.appendChild(el("div", "kev-tag"));
            const img = tag.appendChild(el("div", "kev-tag-img"));
            img.style.backgroundImage = t.icon ? `url("${t.icon}")` : badge(t.difficulty);
            tag.appendChild(el("p", "kev-tag-text", NAMES[t.difficulty] || ""));
            const right = card.appendChild(el("div", "kev-right"));
            const top3 = right.appendChild(el("ul", "kev-top3"));
            const view = right.appendChild(el("button", "kev-view", "See leaderboard"));
            view.addEventListener("click", () => openTrack(t.id, false));
            cards.set(t.id, { top3, cover, t });
        }
        list.appendChild(el("div", "kev-card")).style.height = "40px";

        const lbOuter = main.appendChild(el("div", "kev-lb-outer"));
        noteEl = lbOuter.appendChild(el("p", "kev-lb-note", "Loading standings…"));
        const lb = lbOuter.appendChild(el("div", "kev-lb"));
        lb.appendChild(row("Rank", "Player", "# Of Tracks", "AP", "kev-head"));
        entriesDiv = lb.appendChild(el("div", "kev-entries"));
        container.appendChild(root);

        loadCovers();
        refresh();
        setInterval(() => {
            if (container.classList.contains("open")) refresh();
            if (subEl) subEl.textContent = timeLeft();
        }, REFRESH_MS);
    }

    function row(rank, name, count, ap, cls) {
        const r = el("div", "kev-row " + (cls || ""));
        r.appendChild(el("p", "kev-c-rank", String(rank)));
        r.appendChild(el("p", "kev-c-name", name));
        r.appendChild(el("p", "kev-c-num", String(count)));
        r.appendChild(el("p", "kev-c-num", String(ap)));
        return r;
    }

    async function loadCovers() {
        if (!window.__eventThumbnail) return;
        for (const { cover, t } of cards.values()) {
            if (t.cover) continue;
            try {
                const url = await window.__eventThumbnail(t.id);
                if (url) cover.style.backgroundImage = `url("${url}"), ${ENV_BG[t.env] || ENV_BG.Summer}`;
            } catch {
                /* keep the plain background */
            }
        }
    }

    // The medals' author time for an event map, from the Worker (the map's validation run on
    // Kodub, which is never on the board itself). undefined = not an event map.
    let authorCache = null;
    window.__eventAuthorTime = function (trackId) {
        if (!API || !(window.__eventTracks || []).some((t) => t.id === trackId)) return undefined;
        if (!authorCache || Date.now() - authorCache.at > 60000) {
            authorCache = {
                at: Date.now(),
                data: fetch(API + "event/standings", { credentials: "omit", cache: "no-store" }).then((r) => {
                    if (!r.ok) throw new Error("HTTP " + r.status);
                    return r.json();
                }),
            };
            authorCache.data.catch(() => (authorCache = null));
        }
        return authorCache.data.then((d) => {
            const frames = d.tracks?.[trackId]?.authorFrames;
            return typeof frames === "number" ? frames / 1000 : null;
        });
    };

    let loading = false;
    async function refresh() {
        if (loading || !API) return;
        loading = true;
        try {
            const res = await fetch(API + "event/standings" + (profileToken() ? "?userToken=" + profileToken() : ""), { credentials: "omit", cache: "no-store" });
            if (!res.ok) throw new Error("HTTP " + res.status);
            const data = await res.json();
            const me = profileNickname();
            entriesDiv.innerHTML = "";
            data.standings.forEach((p, i) => {
                entriesDiv.appendChild(row(i + 1, p.nickname, p.finished, Math.round(p.averageRank * 100) / 100,
                    "kev-body" + (me && p.nickname === me ? " kev-me" : "")));
            });
            if (!data.standings.length) entriesDiv.appendChild(el("p", "kev-lb-note", "No finishes yet. Be the first!"));
            for (const [id, c] of cards) {
                c.top3.innerHTML = "";
                const top = data.tracks?.[id]?.top3 || [];
                top.forEach((p, i) => c.top3.appendChild(el("li", null, ["🥇", "🥈", "🥉"][i] + p.nickname)));
            }
            noteEl.textContent = "Ranked by maps finished, then average rank (AP) · updated "
                + new Date(data.updated).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch (err) {
            noteEl.textContent = "Couldn't load the standings (" + err.message + ")";
        } finally {
            loading = false;
        }
    }

    // Adds the event tab to the track selection screen, next to the existing category button,
    // and opens it by default.
    function attach(ui) {
        const bar = ui.querySelector(".category-container");
        if (!bar || bar.querySelector(".kev-tab-button")) return;
        const button = el("button", "button mod kev-tab-button");
        button.appendChild(el("div", "cover"));
        button.appendChild(document.createTextNode(CFG.tabTitle || CFG.title || "Event"));
        bar.prepend(button);
        const container = el("div", "tracks-container kev-tab");
        ui.appendChild(container);
        build(container);

        const select = (mine) => {
            ui.classList.toggle("kev-active", mine);
            for (const b of bar.querySelectorAll("button")) b.classList.toggle("selected", mine ? b === button : b !== button && b.classList.contains("selected"));
            for (const c of ui.querySelectorAll(":scope > .tracks-container")) {
                if (c === container) c.classList.toggle("open", mine);
                else if (mine) c.classList.remove("open");
            }
        };
        button.addEventListener("click", () => select(true));
        for (const b of bar.querySelectorAll("button")) {
            if (b !== button) b.addEventListener("click", () => {
                button.classList.remove("selected");
                container.classList.remove("open");
                ui.classList.remove("kev-active");
                b.classList.add("selected");
            });
        }
        // The game's own tab keeps its "open" class; ours goes on top by default.
        const other = [...bar.querySelectorAll("button")].find((b) => b !== button);
        const otherOpen = [...ui.querySelectorAll(":scope > .tracks-container")].find((c) => c !== container && c.classList.contains("open"));
        other?.classList.remove("selected");
        otherOpen?.classList.remove("open");
        button.classList.add("selected");
        container.classList.add("open");
        ui.classList.add("kev-active");
    }

    const observer = new MutationObserver(() => {
        const ui = document.querySelector(".track-selection-ui");
        if (ui) attach(ui);
    });
    const start = () => observer.observe(document.getElementById("ui") || document.body, { childList: true, subtree: true });
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
})();
