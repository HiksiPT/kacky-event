// Grinding stats: a panel in the pause menu with this session's numbers and the all-time
// numbers for the map being driven. The idea and the first seven rows (time, resets,
// finishes, attempts, finish rate, since finish, best time) come from MisoTweaks by
// Missonance (Apache-2.0); the rest are this site's own.
//
// main.bundle.js calls __grindOnAttempt (a new car = a new attempt), __grindOnCheckpoint
// and __grindOnFinish. Everything is kept in this browser's localStorage only.
(function () {
    const STORAGE_KEY = "kacky_grinding_stats";
    const HIDDEN_KEY = "kacky_grinding_hidden";
    const SAMPLE_MS = 50;

    const fresh = () => ({
        timeMs: 0, resets: 0, finishes: 0, bestMs: null, lastMs: null, finishSumMs: 0,
        topSpeed: 0, bestCp: 0, longestMs: 0, attemptSumMs: 0, distanceM: 0, inputs: 0,
        firstFinishAttempt: null, sessions: 0,
    });

    function loadAll() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") || {};
        } catch {
            return {};
        }
    }
    let all = loadAll();
    let dirty = false;
    function save() {
        if (!dirty) return;
        dirty = false;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
        } catch {}
    }
    const total = (id) => (all[id] = Object.assign(fresh(), all[id] || {}));

    let trackId = null;
    let session = fresh();
    let sinceFinish = 0;
    // The attempt in progress: its car, and what it has done so far.
    let attempt = null;
    let lastTick = performance.now();

    function setTrack(id) {
        if (id === trackId) return;
        trackId = id;
        session = fresh();
        sinceFinish = 0;
        attempt = null;
        if (id) {
            total(id).sessions++;
            dirty = true;
        }
    }

    const both = (fn) => {
        fn(session);
        if (trackId) fn(total(trackId));
        dirty = true;
    };

    // An attempt only counts once the car has actually set off.
    function closeAttempt(finishedMs) {
        const a = attempt;
        attempt = null;
        if (!a || !a.started) return;
        const length = finishedMs ?? a.timeMs;
        both((s) => {
            s.attemptSumMs += length;
            if (length > s.longestMs) s.longestMs = length;
            if (finishedMs == null) s.resets++;
        });
        if (finishedMs == null) sinceFinish++;
    }

    window.__grindOnAttempt = function (id, car) {
        setTrack(id);
        closeAttempt(null);
        attempt = { car, started: false, timeMs: 0, controls: {} };
    };

    window.__grindOnCheckpoint = function (id, index) {
        if (id !== trackId) return;
        both((s) => {
            if (index + 1 > s.bestCp) s.bestCp = index + 1;
        });
    };

    window.__grindOnFinish = function (id, frames) {
        if (id !== trackId || !Number.isFinite(frames)) return;
        const t = total(id);
        if (t.firstFinishAttempt == null) t.firstFinishAttempt = t.resets + t.finishes + 1;
        if (session.firstFinishAttempt == null) session.firstFinishAttempt = session.resets + session.finishes + 1;
        if (attempt) attempt.started = true;
        closeAttempt(frames);
        both((s) => {
            s.finishes++;
            s.lastMs = frames;
            s.finishSumMs += frames;
            if (s.bestMs == null || frames < s.bestMs) s.bestMs = frames;
        });
        sinceFinish = 0;
        save();
        render();
    };

    const paused = () => !!document.querySelector(".pause-screen-ui:not(.fade-out)");
    const driving = () => !!document.querySelector(".game-ui");

    function sample() {
        const now = performance.now();
        let dt = now - lastTick;
        lastTick = now;
        if (!(dt > 0) || dt > 2000) dt = 0;
        if (!driving()) {
            if (trackId) {
                closeAttempt(null);
                save();
            }
            return;
        }
        if (!trackId || document.hidden || paused()) return;
        both((s) => (s.timeMs += dt));
        const a = attempt;
        if (!a) return;
        let car = a.car;
        try {
            if (car.hasStarted()) a.started = true;
            if (!a.started || car.hasFinished?.()) return;
            a.timeMs = car.getTime().numberOfFrames;
            const speed = car.getSpeedKmh();
            const controls = car.getControls();
            let presses = 0;
            for (const k of ["up", "down", "left", "right"]) {
                if (controls[k] && !a.controls[k]) presses++;
                a.controls[k] = !!controls[k];
            }
            both((s) => {
                if (speed > s.topSpeed) s.topSpeed = speed;
                s.distanceM += (Math.abs(speed) / 3.6) * (dt / 1000);
                s.inputs += presses;
            });
        } catch {
            /* the car was disposed between attempts */
        }
    }

    // ---- the panel ----------------------------------------------------------------------
    const clock = (ms) => {
        const s = Math.floor(Math.max(0, ms) / 1000);
        const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60);
        return (h ? h + ":" + String(m).padStart(2, "0") : String(m).padStart(2, "0")) + ":" + String(s % 60).padStart(2, "0");
    };
    const race = (ms) => {
        if (ms == null) return "--:--.---";
        const n = Math.round(ms), m = Math.floor(n / 60000), s = Math.floor(n / 1000) % 60;
        return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(n % 1000).padStart(3, "0");
    };
    const pct = (a, b) => (b ? Math.round((a / b) * 100) + "%" : "--%");
    const avg = (a, b, f = (v) => v.toFixed(1)) => (b ? f(a / b) : "--");
    const dist = (m) => (m >= 1000 ? (m / 1000).toFixed(1) + " km" : Math.round(m) + " m");

    // [label, value(stats, isSession), starts a new group]
    const ROWS = [
        ["Time", (s) => clock(s.timeMs)],
        ["Attempts", (s) => String(s.resets + s.finishes)],
        ["Resets", (s) => String(s.resets)],
        ["Finishes", (s) => String(s.finishes)],
        ["Finish rate", (s) => pct(s.finishes, s.resets + s.finishes)],
        ["Since finish", (s, cur) => (cur ? String(sinceFinish) : "avg " + avg(s.resets, s.finishes))],
        ["Best time", (s) => race(s.bestMs), true],
        ["Last finish", (s) => race(s.lastMs)],
        ["Average finish", (s) => (s.finishes ? race(s.finishSumMs / s.finishes) : "--:--.---")],
        ["First finish", (s) => (s.firstFinishAttempt ? "attempt " + s.firstFinishAttempt : "--")],
        ["Top speed", (s) => Math.round(s.topSpeed) + " km/h", true],
        ["Checkpoints reached", (s) => String(s.bestCp)],
        ["Longest attempt", (s) => race(s.longestMs || null)],
        ["Average attempt", (s) => (s.resets + s.finishes ? race(s.attemptSumMs / (s.resets + s.finishes)) : "--:--.---")],
        ["Distance driven", (s) => dist(s.distanceM)],
        ["Inputs", (s) => String(s.inputs)],
        ["Inputs per attempt", (s) => avg(s.inputs, s.resets + s.finishes)],
        ["Time per finish", (s) => (s.finishes ? clock(s.timeMs / s.finishes) : "--")],
        ["Sessions", (s, cur) => (cur ? "" : String(s.sessions))],
    ];

    let panel = null;
    let cells = [];
    let footer = null;

    function build() {
        const ui = document.getElementById("ui");
        if (!ui) return null;
        const css = document.createElement("style");
        css.textContent = `
.grinding-ui{position:absolute;right:calc(var(--safe-area-horizontal, 0px) + 16px);bottom:16px;z-index:3;min-width:330px;box-sizing:border-box;
  background-color:var(--surface-color,#112052);color:var(--text-color,#fff);opacity:0;transform:translateX(10px);transition:opacity .3s,transform .3s;pointer-events:none;
  clip-path:polygon(10px 0,100% 0,100% 100%,0 100%);}
.grinding-ui.visible{opacity:.96;transform:none;pointer-events:auto;}
.grinding-ui>.head{display:flex;align-items:center;padding:6px 12px 6px 22px;}
.grinding-ui>.head>h2{margin:0;flex:1;font-size:26px;font-weight:normal;}
.grinding-ui>.head>button{font-family:inherit;font-size:14px;color:inherit;background:var(--surface-tertiary-color,#28346a);border:none;padding:3px 10px;cursor:pointer;}
.grinding-ui>.cols{display:flex;justify-content:flex-end;gap:0;padding:0 12px 2px;font-size:12px;opacity:.6;}
.grinding-ui>.cols>span{width:96px;text-align:right;}
.grinding-ui>.rows{background-color:var(--surface-secondary-color,#212b58);padding:6px 12px 8px;max-height:60vh;overflow-y:auto;}
.grinding-ui .row{display:flex;font-size:16px;line-height:1.35;}
.grinding-ui .row.group{margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.15);}
.grinding-ui .row>.label{flex:1;opacity:.75;white-space:nowrap;padding-right:12px;}
.grinding-ui .row>.cur,.grinding-ui .row>.tot{width:96px;text-align:right;white-space:nowrap;}
.grinding-ui .row>.tot{opacity:.75;}
.grinding-ui>.foot{padding:5px 12px 7px 22px;font-size:13px;opacity:.7;}
.grinding-ui.collapsed>.cols,.grinding-ui.collapsed>.rows,.grinding-ui.collapsed>.foot{display:none;}`;
        document.head.appendChild(css);
        const el = document.createElement("div");
        el.className = "grinding-ui";
        const head = el.appendChild(document.createElement("div"));
        head.className = "head";
        head.appendChild(document.createElement("h2")).textContent = "Grinding stats";
        const toggle = head.appendChild(document.createElement("button"));
        const applyCollapsed = (c) => {
            el.classList.toggle("collapsed", c);
            toggle.textContent = c ? "Show" : "Hide";
        };
        toggle.addEventListener("click", () => {
            const c = !el.classList.contains("collapsed");
            applyCollapsed(c);
            try {
                localStorage.setItem(HIDDEN_KEY, c ? "1" : "0");
            } catch {}
        });
        let hidden = false;
        try {
            hidden = localStorage.getItem(HIDDEN_KEY) === "1";
        } catch {}
        applyCollapsed(hidden);
        const cols = el.appendChild(document.createElement("div"));
        cols.className = "cols";
        cols.appendChild(document.createElement("span")).textContent = "This session";
        cols.appendChild(document.createElement("span")).textContent = "All time";
        const rows = el.appendChild(document.createElement("div"));
        rows.className = "rows";
        cells = ROWS.map(([label, , group]) => {
            const row = rows.appendChild(document.createElement("div"));
            row.className = group ? "row group" : "row";
            row.appendChild(document.createElement("span")).className = "label";
            row.firstChild.textContent = label;
            const cur = row.appendChild(document.createElement("span"));
            cur.className = "cur";
            const tot = row.appendChild(document.createElement("span"));
            tot.className = "tot";
            return [cur, tot];
        });
        footer = el.appendChild(document.createElement("div"));
        footer.className = "foot";
        ui.appendChild(el);
        return el;
    }

    function render() {
        if (!panel || !trackId) return;
        const t = total(trackId);
        ROWS.forEach(([, value], i) => {
            cells[i][0].textContent = value(session, true);
            cells[i][1].textContent = value(t, false);
        });
        // Across every map of the event.
        const ids = (window.__eventTracks || []).map((m) => m.id);
        if (ids.length) {
            let time = 0, finished = 0, attempts = 0;
            for (const id of ids) {
                const s = all[id];
                if (!s) continue;
                time += s.timeMs || 0;
                attempts += (s.resets || 0) + (s.finishes || 0);
                if (s.finishes) finished++;
            }
            footer.textContent = `Whole event: ${finished}/${ids.length} maps finished · ${attempts} attempts · ${clock(time)} played`;
        } else {
            footer.textContent = "";
        }
    }

    let tickCount = 0;
    setInterval(() => {
        sample();
        if (++tickCount % 10) return;
        save();
        const show = driving() && paused() && !!trackId;
        if (show && !panel) panel = build();
        if (!panel) return;
        if (show) render();
        panel.classList.toggle("visible", show);
    }, SAMPLE_MS);
    window.addEventListener("pagehide", save);
})();
