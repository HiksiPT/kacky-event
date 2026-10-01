// Race Control: the owner's site traffic dashboard. Loaded by nsws_traffic.js only after
// the profile's token matches the owner hash; the Worker checks the token again.
(function () {
    if (window.__nswsOwnerPanel) return;

    const ACCENT = "#b3c1ff";
    const GOOD = "#3ddc84";
    const GOLD = "#ffc94a";
    const STATE_COLORS = { menu: "#3987e5", race: "#d95926", editor: "#199e70", watch: "#c98500", garage: "#d55181" };
    const STATE_LABELS = { menu: "In menus", race: "Racing", editor: "In the editor", watch: "Watching replays", garage: "In the garage" };
    const RANGES = [["day", "24H"], ["3d", "3D"], ["week", "7D"], ["month", "30D"], ["all", "All"]];
    const TABS = [["overview", "Overview"], ["live", "Live"], ["drivers", "Drivers"], ["tracks", "Tracks"], ["audience", "Audience"], ["anticheat", "Anti-cheat"]];
    const LIVE_REFRESH_MS = 10000;
    const STATS_REFRESH_MS = 60000;
    const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const REASONS = {
        "no-finish": "Doesn't cross the finish on its time",
        "not-uploaded-here": "Uploaded outside this site",
        "no-recording": "Recording missing",
        "unreadable": "Recording unreadable",
        "bad-time": "Impossible time",
    };

    const CSS = `
#nrc-overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.75);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}
#nrc-overlay *{box-sizing:border-box;}
.nrc-panel{position:relative;width:min(1200px,96vw);height:min(880px,94vh);background:var(--surface-color);color:var(--text-color);display:flex;flex-direction:column;overflow:hidden;clip-path:polygon(0 0,100% 0,calc(100% - 14px) 100%,0 100%);}
.nrc-checker{height:8px;flex-shrink:0;background:repeating-conic-gradient(#fff 0 25%,#112052 0 50%) 0 0/8px 8px;opacity:.85;}
.nrc-head{display:flex;align-items:center;gap:16px;flex-wrap:wrap;padding:14px 24px 12px;background:var(--surface-secondary-color);border-bottom:1px solid rgba(255,255,255,.08);flex-shrink:0;}
.nrc-title{display:flex;align-items:baseline;gap:12px;margin-right:auto;}
.nrc-title h1{margin:0;font-size:34px;font-weight:400;color:${ACCENT};text-shadow:0 2px 0 #112052;}
.nrc-tag{font-size:12px;padding:3px 10px;background:${GOLD};color:#1b1f3a;clip-path:polygon(5px 0,100% 0,calc(100% - 5px) 100%,0 100%);letter-spacing:1px;}
.nrc-live{display:flex;align-items:center;gap:8px;font-size:16px;padding:6px 14px;background:var(--surface-tertiary-color);clip-path:polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%);}
.nrc-dot{width:10px;height:10px;border-radius:50%;background:${GOOD};box-shadow:0 0 0 0 rgba(61,220,132,.6);animation:nrc-pulse 1.6s infinite;}
.nrc-dot.off{background:#5d6a7c;animation:none;}
@keyframes nrc-pulse{0%{box-shadow:0 0 0 0 rgba(61,220,132,.55);}70%{box-shadow:0 0 0 9px rgba(61,220,132,0);}100%{box-shadow:0 0 0 0 rgba(61,220,132,0);}}
.nrc-chips{display:flex;gap:6px;}
.nrc-chip.button{font-size:18px;padding:7px 16px;}
.nrc-chip.button.on{background:var(--button-hover-color);box-shadow:inset 0 -3px 0 ${ACCENT};}
.nrc-close.button{font-size:22px;padding:6px 16px;}
.nrc-tabs{display:flex;gap:6px;padding:10px 24px 0;background:var(--surface-secondary-color);flex-shrink:0;overflow-x:auto;}
.nrc-tab.button{font-size:20px;padding:9px 22px;background:var(--surface-tertiary-color);}
.nrc-tab.button.on{background:var(--surface-color);color:${ACCENT};}
.nrc-body{flex:1;overflow-y:auto;padding:20px 24px 28px;scrollbar-color:#7272c2 #223;}
.nrc-status{padding:60px 0;text-align:center;font-size:22px;color:rgba(255,255,255,.6);}
.nrc-status .button{margin-top:18px;font-size:20px;}
.nrc-hero{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(0,1fr);gap:14px;margin-bottom:14px;}
.nrc-card{background:var(--surface-secondary-color);padding:16px 18px;clip-path:polygon(0 0,100% 0,calc(100% - 10px) 100%,0 100%);min-width:0;}
.nrc-card h2{margin:0 0 4px;font-size:20px;font-weight:400;display:flex;align-items:center;gap:10px;}
.nrc-card h2 img{width:22px;height:22px;}
.nrc-sub{font-size:13px;color:rgba(255,255,255,.55);margin:0 0 12px;line-height:1.35;}
.nrc-odo{font-size:clamp(34px,5vw,56px);color:${ACCENT};letter-spacing:1px;margin:6px 0 8px;white-space:nowrap;font-variant-numeric:tabular-nums;text-shadow:0 3px 0 #112052;}
.nrc-odo small{font-size:.5em;color:rgba(179,193,255,.7);margin:0 6px 0 2px;}
.nrc-rate{font-size:15px;color:rgba(255,255,255,.75);}
.nrc-rate b{color:${GOOD};font-weight:400;}
.nrc-tiles{display:grid;grid-template-columns:repeat(auto-fill,minmax(190px,1fr));gap:10px;margin-bottom:14px;}
.nrc-tile{background:var(--button-color);padding:12px 16px 12px 18px;clip-path:polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%);position:relative;min-width:0;}
.nrc-tile::before{content:"";position:absolute;left:8px;right:0;top:0;height:3px;background:${ACCENT};opacity:.55;}
.nrc-tile .k{font-size:13px;color:rgba(255,255,255,.6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.nrc-tile .v{font-size:28px;margin-top:6px;white-space:nowrap;font-variant-numeric:tabular-nums;}
.nrc-tile .d{font-size:12px;color:rgba(255,255,255,.5);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.nrc-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,460px),1fr));gap:14px;margin-bottom:14px;}
.nrc-charthead{display:flex;align-items:flex-start;gap:10px;flex-wrap:wrap;}
.nrc-charthead>div:first-child{margin-right:auto;}
.nrc-big{font-size:26px;color:${ACCENT};margin:2px 0 10px;font-variant-numeric:tabular-nums;}
.nrc-toggle{display:flex;gap:4px;}
.nrc-toggle .button{font-size:13px;padding:5px 11px;background:var(--surface-tertiary-color);}
.nrc-toggle .button.on{background:var(--button-hover-color);box-shadow:inset 0 -2px 0 ${ACCENT};}
.nrc-chart{position:relative;width:100%;height:220px;background:var(--surface-tertiary-color);}
.nrc-chart svg{display:block;width:100%;height:100%;}
.nrc-chart text{font-size:11px;fill:rgba(255,255,255,.5);font-style:italic;}
.nrc-tip{position:fixed;z-index:10002;pointer-events:none;background:#0d1533;color:#fff;border:1px solid rgba(179,193,255,.35);padding:8px 11px;font-size:13px;line-height:1.4;white-space:nowrap;display:none;box-shadow:0 8px 20px rgba(0,0,0,.45);}
.nrc-tip b{color:${ACCENT};font-weight:400;font-size:15px;}
.nrc-heat{display:grid;grid-template-columns:38px repeat(24,minmax(0,1fr));gap:2px;}
.nrc-heat .c{aspect-ratio:1;min-height:10px;background:var(--surface-tertiary-color);}
.nrc-heat .l{font-size:11px;color:rgba(255,255,255,.5);display:flex;align-items:center;}
.nrc-heat .hl{font-size:10px;color:rgba(255,255,255,.45);text-align:center;}
.nrc-legend{display:flex;align-items:center;gap:8px;font-size:11px;color:rgba(255,255,255,.5);margin-top:8px;}
.nrc-legend .ramp{width:120px;height:8px;background:linear-gradient(90deg,#192042,${ACCENT});}
.nrc-podium{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px;}
.nrc-rec{background:var(--surface-tertiary-color);padding:12px 14px;border-left:3px solid ${GOLD};}
.nrc-rec .k{font-size:12px;color:${GOLD};letter-spacing:.5px;}
.nrc-rec .v{font-size:24px;margin:6px 0 4px;}
.nrc-rec .d{font-size:12px;color:rgba(255,255,255,.55);}
.nrc-table{width:100%;border-collapse:collapse;font-size:15px;}
.nrc-table th{font-size:12px;font-weight:400;color:rgba(255,255,255,.5);text-align:left;padding:6px 8px;border-bottom:1px solid rgba(255,255,255,.08);white-space:nowrap;}
.nrc-table td{padding:8px;border-bottom:1px solid rgba(255,255,255,.05);white-space:nowrap;font-variant-numeric:tabular-nums;}
.nrc-table tr:hover td{background:rgba(255,255,255,.03);}
.nrc-table .num{text-align:right;}
.nrc-table .name{max-width:260px;overflow:hidden;text-overflow:ellipsis;}
.nrc-table .rank{color:rgba(255,255,255,.45);width:32px;}
.nrc-table .p1 .rank{color:${GOLD};}.nrc-table .p2 .rank{color:#d7dce8;}.nrc-table .p3 .rank{color:#e0a36b;}
.nrc-scroll{overflow-x:auto;}
.nrc-flag{width:22px;height:15px;object-fit:cover;vertical-align:-2px;margin-right:8px;box-shadow:0 0 0 1px rgba(255,255,255,.12);}
.nrc-bars{display:flex;flex-direction:column;gap:9px;}
.nrc-bar{display:grid;grid-template-columns:minmax(90px,170px) 1fr auto;align-items:center;gap:10px;font-size:14px;}
.nrc-bar .lab{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.nrc-bar .track{height:12px;background:var(--surface-tertiary-color);position:relative;}
.nrc-bar .fill{position:absolute;left:0;top:0;bottom:0;background:${ACCENT};border-radius:0 4px 4px 0;min-width:2px;}
.nrc-bar .val{font-size:13px;color:rgba(255,255,255,.7);white-space:nowrap;font-variant-numeric:tabular-nums;}
.nrc-stack{display:flex;height:22px;gap:2px;margin:10px 0 12px;background:var(--surface-tertiary-color);}
.nrc-stack>div{height:100%;min-width:3px;}
.nrc-keys{display:flex;flex-wrap:wrap;gap:8px 18px;font-size:13px;}
.nrc-keys span{display:inline-flex;align-items:center;gap:7px;}
.nrc-keys i{display:inline-block;width:12px;height:12px;border-radius:2px;}
.nrc-pill{display:inline-block;font-size:12px;padding:3px 9px;color:#fff;clip-path:polygon(4px 0,100% 0,calc(100% - 4px) 100%,0 100%);}
.nrc-empty{padding:26px 0;text-align:center;color:rgba(255,255,255,.45);font-size:15px;}
.nrc-foot{font-size:12px;color:rgba(255,255,255,.4);margin-top:16px;line-height:1.5;}
@media (max-width:720px){.nrc-hero{grid-template-columns:1fr;}.nrc-close.button{position:absolute;right:18px;top:20px;}.nrc-title{margin-right:64px;}.nrc-bar{grid-template-columns:minmax(0,1fr) auto;gap:4px 10px;}.nrc-bar .track{grid-column:1/-1;order:3;}.nrc-head{padding:10px 14px;}.nrc-tabs{padding:8px 14px 0;}.nrc-body{padding:14px;}.nrc-title h1{font-size:26px;}.nrc-chip.button{font-size:15px;padding:6px 11px;}}
`;

    const regionNames = (() => {
        try {
            return new Intl.DisplayNames(["en"], { type: "region" });
        } catch {
            return null;
        }
    })();
    const countryName = (code) => {
        if (!code || code === "?") return "Unknown";
        try {
            return regionNames?.of(code) || code;
        } catch {
            return code;
        }
    };
    const nf = new Intl.NumberFormat("en-US");
    const num = (n) => nf.format(Math.round(n || 0));
    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) + "%" : "–");

    function duration(seconds) {
        const s = Math.max(0, Math.round(seconds || 0));
        if (s < 60) return s + "s";
        const m = Math.floor(s / 60);
        if (m < 60) return m + "m " + String(s % 60).padStart(2, "0") + "s";
        const h = Math.floor(m / 60);
        if (h < 48) return h + "h " + String(m % 60).padStart(2, "0") + "m";
        const d = Math.floor(h / 24);
        return d + "d " + (h % 24) + "h";
    }

    function hours(seconds) {
        const h = (seconds || 0) / 3600;
        return h >= 100 ? num(h) + "h" : h >= 1 ? h.toFixed(1) + "h" : duration(seconds);
    }

    function el(tag, className, text) {
        const e = document.createElement(tag);
        if (className) e.className = className;
        if (text != null) e.textContent = text;
        return e;
    }

    function flag(code) {
        const img = el("img", "nrc-flag");
        img.alt = "";
        img.src = code && code !== "?" ? "images/countries/" + code.toLowerCase() + ".svg" : "images/blank_flag.svg";
        img.onerror = () => {
            img.onerror = null;
            img.src = "images/blank_flag.svg";
        };
        return img;
    }

    function trackName(id) {
        if (!id) return "Unknown track";
        for (const w of window.__nswsWeeks || []) {
            const tracks = window.__nswsTracksForWeek ? window.__nswsTracksForWeek(w.week) : w.tracks || [];
            const t = tracks.find((x) => x.id === id || x.contentId === id);
            if (t) return "Week " + w.week + " · " + t.name;
        }
        try {
            const name = window.__bw_getTrackName?.(id);
            if (name) return name;
        } catch {}
        return "Track " + id.slice(0, 8) + "…";
    }

    const fmt = {
        time: (ms) => new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        dayTime: (ms) => new Date(ms).toLocaleString([], { weekday: "short", hour: "2-digit", minute: "2-digit" }),
        date: (ms) => new Date(ms).toLocaleDateString([], { month: "short", day: "numeric" }),
        dateTime: (ms) => new Date(ms).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        fullDate: (ms) => new Date(ms).toLocaleDateString([], { year: "numeric", month: "short", day: "numeric" }),
    };

    function stepLabels(step) {
        const end = (ms) => ms + step * 1000;
        if (step < 3600) {
            return { tick: fmt.time, tip: (ms) => fmt.dayTime(ms) + " – " + fmt.time(end(ms)), upTo: (ms) => fmt.dayTime(end(ms)) };
        }
        if (step < 86400) {
            return {
                tick: step === 3600 ? fmt.dayTime : fmt.date,
                tip: (ms) => fmt.dateTime(ms) + " – " + fmt.time(end(ms)),
                upTo: (ms) => fmt.dateTime(end(ms)),
            };
        }
        const day = (ms) => new Date(ms).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric", year: "numeric" });
        return { tick: fmt.date, tip: day, upTo: (ms) => "end of " + day(ms) };
    }

    function niceMax(v) {
        if (!(v > 0)) return 1;
        const p = Math.pow(10, Math.floor(Math.log10(v)));
        for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
        return 10 * p;
    }

    // Seconds scale nicely only in whole minutes and hours.
    function niceTimeMax(v) {
        if (!(v > 0)) return 60;
        for (const unit of [60, 3600, 86400]) {
            if (v <= unit * 60 || unit === 86400) return niceMax(v / unit) * unit;
        }
        return v;
    }

    const tip = el("div", "nrc-tip");

    function showTip(html, x, y) {
        tip.innerHTML = html;
        tip.style.display = "block";
        const r = tip.getBoundingClientRect();
        let left = x + 14;
        let top = y - r.height - 12;
        if (left + r.width > window.innerWidth - 8) left = x - r.width - 14;
        if (top < 8) top = y + 16;
        tip.style.left = left + "px";
        tip.style.top = top + "px";
    }
    const hideTip = () => {
        tip.style.display = "none";
    };
    const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

    const SVG = "http://www.w3.org/2000/svg";
    function svgEl(tag, attrs) {
        const e = document.createElementNS(SVG, tag);
        for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
        return e;
    }

    // points: [{t (ms), v}]. kind: "area" or "bars". isTime: values are seconds.
    function drawChart(box, points, opts) {
        box.textContent = "";
        const W = Math.max(280, box.clientWidth);
        const H = box.clientHeight || 220;
        const pad = { l: 58, r: 14, t: 14, b: 26 };
        const pw = W - pad.l - pad.r;
        const ph = H - pad.t - pad.b;
        const svg = svgEl("svg", { viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none" });
        box.appendChild(svg);
        const n = points.length;
        if (!n) return;
        const maxV = Math.max(...points.map((p) => p.v));
        const top = opts.isTime ? niceTimeMax(maxV) : niceMax(Math.max(maxV, opts.minMax || 0));
        const yOf = (v) => pad.t + ph - (v / top) * ph;
        const valueText = opts.isTime ? (v) => (top >= 7200 ? hours(v) : duration(v)) : (v) => num(v);

        for (let i = 0; i <= 4; i++) {
            const v = (top * i) / 4;
            const y = yOf(v);
            svg.appendChild(svgEl("line", { x1: pad.l, x2: W - pad.r, y1: y, y2: y, stroke: "rgba(255,255,255," + (i ? 0.07 : 0.18) + ")", "stroke-width": 1 }));
            const label = svgEl("text", { x: pad.l - 8, y: y + 4, "text-anchor": "end" });
            label.textContent = opts.isTime ? (top >= 7200 ? hours(v) : duration(v)) : num(v);
            svg.appendChild(label);
        }

        const slot = pw / n;
        const xOf = opts.kind === "bars" ? (i) => pad.l + slot * i + slot / 2 : (i) => pad.l + (n === 1 ? pw / 2 : (pw * i) / (n - 1));
        const ticks = Math.min(n, Math.max(2, Math.floor(pw / 110)));
        for (let k = 0; k < ticks; k++) {
            const i = ticks === 1 ? 0 : Math.round((k * (n - 1)) / (ticks - 1));
            const label = svgEl("text", { x: xOf(i), y: H - 8, "text-anchor": k === 0 ? "start" : k === ticks - 1 ? "end" : "middle" });
            label.textContent = opts.labels.tick(points[i].t);
            svg.appendChild(label);
        }

        if (opts.kind === "bars") {
            const bw = Math.max(1, slot - 2);
            const r = Math.min(4, bw / 2);
            points.forEach((p, i) => {
                if (!(p.v > 0)) return;
                const h = Math.max(1.5, (p.v / top) * ph);
                const x = xOf(i) - bw / 2;
                const y = pad.t + ph - h;
                const rr = Math.min(r, h);
                svg.appendChild(svgEl("path", {
                    d: `M${x},${y + h}V${y + rr}Q${x},${y} ${x + rr},${y}H${x + bw - rr}Q${x + bw},${y} ${x + bw},${y + rr}V${y + h}Z`,
                    fill: ACCENT,
                    opacity: 0.85,
                }));
            });
        } else {
            const gradId = "nrc-grad-" + Math.random().toString(36).slice(2);
            const defs = svgEl("defs", {});
            const grad = svgEl("linearGradient", { id: gradId, x1: 0, x2: 0, y1: 0, y2: 1 });
            grad.appendChild(svgEl("stop", { offset: "0", "stop-color": ACCENT, "stop-opacity": 0.35 }));
            grad.appendChild(svgEl("stop", { offset: "1", "stop-color": ACCENT, "stop-opacity": 0.02 }));
            defs.appendChild(grad);
            svg.appendChild(defs);
            const line = points.map((p, i) => (i ? "L" : "M") + xOf(i).toFixed(1) + "," + yOf(p.v).toFixed(1)).join("");
            svg.appendChild(svgEl("path", { d: line + `L${xOf(n - 1)},${pad.t + ph}L${xOf(0)},${pad.t + ph}Z`, fill: `url(#${gradId})` }));
            svg.appendChild(svgEl("path", { d: line, fill: "none", stroke: ACCENT, "stroke-width": 2, "stroke-linejoin": "round", "vector-effect": "non-scaling-stroke" }));
        }

        const cross = svgEl("line", { y1: pad.t, y2: pad.t + ph, stroke: "rgba(255,255,255,.35)", "stroke-width": 1, visibility: "hidden" });
        const dot = svgEl("circle", { r: 5, fill: ACCENT, stroke: "#192042", "stroke-width": 2, visibility: "hidden" });
        svg.appendChild(cross);
        svg.appendChild(dot);
        const hit = svgEl("rect", { x: pad.l, y: 0, width: pw, height: H, fill: "transparent" });
        svg.appendChild(hit);
        const move = (e) => {
            const rect = svg.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * W;
            const i = opts.kind === "bars"
                ? Math.floor((x - pad.l) / slot)
                : Math.round(((x - pad.l) / pw) * (n - 1));
            const idx = Math.max(0, Math.min(n - 1, i));
            const p = points[idx];
            const cx = xOf(idx);
            cross.setAttribute("x1", cx);
            cross.setAttribute("x2", cx);
            cross.setAttribute("visibility", "visible");
            dot.setAttribute("cx", cx);
            dot.setAttribute("cy", yOf(p.v));
            dot.setAttribute("visibility", "visible");
            showTip(`${esc(opts.labels.tip(p.t))}<br><b>${esc(valueText(p.v))}</b> ${esc(opts.unit || "")}`, e.clientX, e.clientY);
        };
        hit.addEventListener("pointermove", move);
        hit.addEventListener("pointerdown", move);
        hit.addEventListener("pointerleave", () => {
            cross.setAttribute("visibility", "hidden");
            dot.setAttribute("visibility", "hidden");
            hideTip();
        });
    }

    function tile(key, value, detail) {
        const t = el("div", "nrc-tile");
        t.appendChild(el("div", "k", key));
        t.appendChild(el("div", "v", value));
        if (detail) t.appendChild(el("div", "d", detail));
        return t;
    }

    function card(title, icon, sub) {
        const c = el("div", "nrc-card");
        const h = el("h2");
        if (icon) {
            const img = el("img");
            img.src = "images/" + icon + ".svg";
            img.alt = "";
            h.appendChild(img);
        }
        h.appendChild(document.createTextNode(title));
        c.appendChild(h);
        if (sub) c.appendChild(el("p", "nrc-sub", sub));
        return c;
    }

    function toggle(options, current, onPick) {
        const wrap = el("div", "nrc-toggle");
        for (const [key, label] of options) {
            const b = el("button", "button" + (key === current ? " on" : ""), label);
            b.addEventListener("click", () => {
                for (const other of wrap.children) other.classList.remove("on");
                b.classList.add("on");
                onPick(key);
            });
            wrap.appendChild(b);
        }
        return wrap;
    }

    function barList(rows, label, value, max) {
        const list = el("div", "nrc-bars");
        if (!rows.length) {
            list.appendChild(el("div", "nrc-empty", "Nothing yet"));
            return list;
        }
        const top = max ?? Math.max(...rows.map(value));
        for (const row of rows) {
            const r = el("div", "nrc-bar");
            const lab = el("div", "lab");
            label(row, lab);
            const track = el("div", "track");
            const fill = el("div", "fill");
            fill.style.width = (top > 0 ? (value(row) / top) * 100 : 0) + "%";
            track.appendChild(fill);
            r.appendChild(lab);
            r.appendChild(track);
            r.appendChild(el("div", "val", num(row.opens) + " opens · " + hours(row.runtime)));
            list.appendChild(r);
        }
        return list;
    }

    function table(headers, rows) {
        const wrap = el("div", "nrc-scroll");
        const t = el("table", "nrc-table");
        const thead = el("thead");
        const hr = el("tr");
        for (const [text, cls] of headers) hr.appendChild(el("th", cls || "", text));
        thead.appendChild(hr);
        t.appendChild(thead);
        const tbody = el("tbody");
        rows.forEach((cells, i) => {
            const tr = el("tr", i < 3 ? "p" + (i + 1) : "");
            cells.forEach((cell, j) => {
                const td = el("td", headers[j][1] || "");
                if (cell instanceof Node) td.appendChild(cell);
                else td.textContent = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        t.appendChild(tbody);
        wrap.appendChild(t);
        return wrap;
    }

    function withFlag(code, text) {
        const span = el("span");
        span.appendChild(flag(code));
        span.appendChild(document.createTextNode(text));
        return span;
    }

    const ui = {
        overlay: null,
        body: null,
        liveText: null,
        liveDot: null,
        range: "day",
        tab: "overview",
        stats: null,
        live: null,
        liveAt: 0,
        liveClockOffset: 0,
        error: null,
        timers: [],
        raf: 0,
        charts: [],
        runtimeMode: "total",
        opensMode: "rate",
        loading: 0,
        anti: null,
        antiError: null,
        antiBusy: "",
    };

    async function post(path, extra) {
        const token = await window.__nswsOwner.token();
        if (!token) throw Object.assign(new Error("not owner"), { status: 403 });
        const response = await fetch(window.__nswsOwner.api + "nsws/" + path, {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ token, ...extra }),
            credentials: "omit",
            cache: "no-store",
        });
        if (!response.ok) throw Object.assign(new Error("HTTP " + response.status), { status: response.status });
        return response.json();
    }

    function acceptLive(live) {
        ui.live = live;
        ui.liveAt = performance.now();
        ui.liveClockOffset = Date.now() - live.now;
        ui.liveDot.classList.toggle("off", !live.online);
        ui.liveText.textContent = live.online === 1 ? "1 online" : num(live.online) + " online";
    }

    async function loadStats() {
        const ticket = ++ui.loading;
        try {
            const data = await post("stats", { range: ui.range, tz: -new Date().getTimezoneOffset() });
            if (ticket !== ui.loading || !ui.overlay) return;
            ui.stats = data;
            ui.error = null;
            acceptLive(data.live);
        } catch (err) {
            if (ticket !== ui.loading || !ui.overlay) return;
            ui.error = err;
        }
        render();
    }

    async function loadAnti() {
        try {
            ui.anti = await post("anticheat", {});
            ui.antiError = null;
        } catch (err) {
            ui.antiError = err;
        }
        if (ui.overlay && ui.tab === "anticheat") render();
    }

    async function loadLive() {
        try {
            const live = await post("live", {});
            if (!ui.overlay) return;
            acceptLive(live);
            if (ui.tab === "live") render();
        } catch {}
    }

    function seriesPoints(stats, pick, cumulative) {
        const { step, firstG, nowG, tz } = stats.range;
        const byG = new Map(stats.series.map((r) => [r.g, r]));
        const points = [];
        let running = 0;
        for (let g = firstG; g <= nowG; g++) {
            const v = pick(byG.get(g), g) || 0;
            running += v;
            points.push({ t: (g * step - tz) * 1000, v: cumulative ? running : v });
        }
        return points;
    }

    // All-time runtime, including what the online players have run since their last beat.
    function odometerSeconds() {
        const live = ui.live;
        if (!live) return 0;
        return live.totalRuntime + live.pending + live.online * ((performance.now() - ui.liveAt) / 1000);
    }

    function odometerText(seconds) {
        const s = Math.floor(seconds);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        return `${num(h)}<small>h</small>${String(m).padStart(2, "0")}<small>m</small>${String(s % 60).padStart(2, "0")}<small>s</small>`;
    }

    function tick() {
        ui.raf = requestAnimationFrame(tick);
        const odo = ui.body?.querySelector("[data-odo]");
        if (odo) {
            const html = odometerText(odometerSeconds());
            if (odo.innerHTML !== html) odo.innerHTML = html;
        }
        const now = Date.now() - ui.liveClockOffset;
        for (const e of ui.body?.querySelectorAll("[data-since]") || []) {
            const text = duration((now - Number(e.dataset.since)) / 1000);
            if (e.textContent !== text) e.textContent = text;
        }
    }

    function rangeLabel() {
        return { day: "the past 24 hours", "3d": "the past 3 days", week: "the past 7 days", month: "the past 30 days", all: "all time" }[ui.range];
    }

    function renderOverview(body, s) {
        const t = s.totals;
        const live = ui.live;
        const hero = el("div", "nrc-hero");

        const odoCard = card("Total runtime · all time", "timer", "Every open copy of the site adds a second each second. 10 players online means +10s every second.");
        const odo = el("div", "nrc-odo");
        odo.dataset.odo = "1";
        odo.innerHTML = odometerText(odometerSeconds());
        odoCard.appendChild(odo);
        const rate = el("div", "nrc-rate");
        rate.innerHTML = live.online
            ? `Climbing <b>+${num(live.online)}s</b> every second right now · ${num(live.totalOpens)} opens all time`
            : `Nobody online right now · ${num(live.totalOpens)} opens all time`;
        odoCard.appendChild(rate);
        hero.appendChild(odoCard);

        const liveCard = card("Online now", "multiplayer");
        const big = el("div", "nrc-odo", num(live.online));
        liveCard.appendChild(big);
        liveCard.appendChild(stateStack(live.sessions));
        hero.appendChild(liveCard);
        body.appendChild(hero);

        const avg = t.sessions ? t.runtime / t.sessions : 0;
        const tiles = el("div", "nrc-tiles");
        tiles.appendChild(tile("Runtime", hours(t.runtime), pct(t.focus, t.runtime) + " with the tab in focus"));
        tiles.appendChild(tile("Site opens", num(t.opens), num(t.sessions) + " sessions"));
        tiles.appendChild(tile("Unique visitors", num(t.visitors), num(t.newVisitors) + " first-timers"));
        tiles.appendChild(tile("Returning", pct(t.returningOpens, t.sessions), "of opens came back"));
        tiles.appendChild(tile("Avg session", duration(avg), "per open"));
        tiles.appendChild(tile("Peak online", num(t.peak), "at once"));
        tiles.appendChild(tile("Time driving", hours(t.driving), pct(t.driving, t.focus) + " of focused time"));
        tiles.appendChild(tile("Races started", num(t.attempts), num(t.finishes) + " finished · " + pct(t.finishes, t.attempts)));
        tiles.appendChild(tile("Runs uploaded", num(t.uploads), "new personal bests"));
        tiles.appendChild(tile("Replays watched", num(t.replays), num(t.clips) + " clips saved"));
        body.appendChild(tiles);

        const labels = stepLabels(s.range.step);
        const charts = el("div", "nrc-grid2");

        const runCard = card("Site runtime", "graph");
        const runHead = el("div", "nrc-charthead");
        const runInfo = el("div");
        runInfo.appendChild(el("p", "nrc-sub", "Combined time the site was open, " + rangeLabel()));
        runInfo.appendChild(el("div", "nrc-big", hours(t.runtime)));
        runHead.appendChild(runInfo);
        const runBox = el("div", "nrc-chart");
        const drawRun = () => {
            const total = ui.runtimeMode === "total";
            drawChart(runBox, seriesPoints(s, (r) => r?.runtime, total), {
                kind: total ? "area" : "bars", isTime: true, labels: total ? { tick: labels.tick, tip: (ms) => "Up to " + labels.upTo(ms) } : labels,
                unit: total ? "total" : "of runtime",
            });
        };
        runHead.appendChild(toggle([["total", "Running total"], ["rate", "Per interval"]], ui.runtimeMode, (k) => {
            ui.runtimeMode = k;
            drawRun();
        }));
        runCard.appendChild(runHead);
        runCard.appendChild(runBox);
        charts.appendChild(runCard);

        const openCard = card("Site opens", "play");
        const openHead = el("div", "nrc-charthead");
        const openInfo = el("div");
        openInfo.appendChild(el("p", "nrc-sub", "Times the site was loaded, " + rangeLabel()));
        openInfo.appendChild(el("div", "nrc-big", num(t.opens)));
        openHead.appendChild(openInfo);
        const openBox = el("div", "nrc-chart");
        const drawOpens = () => {
            const total = ui.opensMode === "total";
            drawChart(openBox, seriesPoints(s, (r) => r?.opens, total), {
                kind: total ? "area" : "bars", labels: total ? { tick: labels.tick, tip: (ms) => "Up to " + labels.upTo(ms) } : labels,
                unit: "opens", minMax: 4,
            });
        };
        openHead.appendChild(toggle([["rate", "Per interval"], ["total", "Running total"]], ui.opensMode, (k) => {
            ui.opensMode = k;
            drawOpens();
        }));
        openCard.appendChild(openHead);
        openCard.appendChild(openBox);
        charts.appendChild(openCard);

        const peakCard = card("Players online", "multiplayer", "Most players on the site at the same moment in each interval");
        const peakBox = el("div", "nrc-chart");
        peakCard.appendChild(peakBox);
        charts.appendChild(peakCard);

        const uniqCard = card("Unique visitors", "helmet", "Different people who opened the site in each interval");
        const uniqBox = el("div", "nrc-chart");
        uniqCard.appendChild(uniqBox);
        charts.appendChild(uniqCard);
        body.appendChild(charts);

        const uniques = new Map(s.uniques);
        ui.charts = [drawRun, drawOpens,
            () => drawChart(peakBox, seriesPoints(s, (r) => r?.peak), { kind: "bars", labels, unit: "online at once", minMax: 4 }),
            () => drawChart(uniqBox, seriesPoints(s, (r, g) => uniques.get(g)), { kind: "bars", labels, unit: "visitors", minMax: 4 })];

        const lower = el("div", "nrc-grid2");
        lower.appendChild(heatCard(s));
        lower.appendChild(recordsCard(s));
        body.appendChild(lower);
    }

    function stateStack(sessions) {
        const wrap = el("div");
        const counts = {};
        for (const x of sessions) counts[x.state] = (counts[x.state] || 0) + 1;
        const total = sessions.length;
        const stack = el("div", "nrc-stack");
        const keys = el("div", "nrc-keys");
        for (const state of Object.keys(STATE_COLORS)) {
            const c = counts[state] || 0;
            if (c) {
                const seg = el("div");
                seg.style.flex = String(c);
                seg.style.background = STATE_COLORS[state];
                seg.title = STATE_LABELS[state] + ": " + c;
                stack.appendChild(seg);
            }
            const key = el("span");
            const sw = el("i");
            sw.style.background = STATE_COLORS[state];
            key.appendChild(sw);
            key.appendChild(document.createTextNode(STATE_LABELS[state] + " " + c));
            if (!c) key.style.opacity = ".45";
            keys.appendChild(key);
        }
        if (!total) stack.appendChild(el("div"));
        wrap.appendChild(stack);
        wrap.appendChild(keys);
        return wrap;
    }

    function heatCard(s) {
        const c = card("When people play", "timer", "Runtime by weekday and hour, in your local time, " + rangeLabel());
        const grid = el("div", "nrc-heat");
        const cells = new Map(s.heat.map((r) => [r.wd * 24 + r.h, r]));
        const max = Math.max(1, ...s.heat.map((r) => r.runtime));
        grid.appendChild(el("div"));
        for (let h = 0; h < 24; h++) grid.appendChild(el("div", "hl", h % 3 === 0 ? String(h).padStart(2, "0") : ""));
        for (const wd of [1, 2, 3, 4, 5, 6, 0]) {
            grid.appendChild(el("div", "l", DAY_NAMES[wd]));
            for (let h = 0; h < 24; h++) {
                const cell = el("div", "c");
                const r = cells.get(wd * 24 + h);
                if (r && r.runtime > 0) {
                    const k = Math.sqrt(r.runtime / max);
                    cell.style.background = mix("#192042", ACCENT, 0.12 + 0.88 * k);
                }
                cell.addEventListener("pointermove", (e) => {
                    showTip(`${DAY_NAMES[wd]} ${String(h).padStart(2, "0")}:00–${String((h + 1) % 24).padStart(2, "0")}:00<br><b>${esc(hours(r?.runtime || 0))}</b> runtime · ${num(r?.opens || 0)} opens`, e.clientX, e.clientY);
                });
                cell.addEventListener("pointerleave", hideTip);
                grid.appendChild(cell);
            }
        }
        c.appendChild(grid);
        const legend = el("div", "nrc-legend");
        legend.appendChild(document.createTextNode("Less"));
        legend.appendChild(el("span", "ramp"));
        legend.appendChild(document.createTextNode("More"));
        c.appendChild(legend);
        return c;
    }

    function mix(a, b, k) {
        const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
        const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
        return "rgb(" + pa.map((v, i) => Math.round(v + (pb[i] - v) * k)).join(",") + ")";
    }

    function recordsCard(s) {
        const c = card("Hall of fame", "trophy", "All-time records");
        const r = s.records;
        const grid = el("div", "nrc-podium");
        const rec = (k, v, d) => {
            const x = el("div", "nrc-rec");
            x.appendChild(el("div", "k", k));
            x.appendChild(el("div", "v", v));
            x.appendChild(el("div", "d", d));
            grid.appendChild(x);
        };
        rec("MOST ONLINE AT ONCE", r.peak ? num(r.peak.online) : "–", r.peak ? fmt.dateTime(r.peak.at) : "No data yet");
        rec("BUSIEST DAY", r.busiestDay ? hours(r.busiestDay.runtime) : "–",
            r.busiestDay ? fmt.fullDate(r.busiestDay.day * 86400000 - s.range.tz * 1000) + " · " + num(r.busiestDay.opens) + " opens" : "No data yet");
        rec("LONGEST SESSION" + (ui.range === "all" ? "" : " (" + RANGES.find((x) => x[0] === ui.range)[1] + ")"),
            r.longest ? duration(r.longest.runtime) : "–",
            r.longest ? (r.longest.nickname || "Someone") + " · " + fmt.dateTime(r.longest.start) : "No sessions in range");
        rec("VISITORS EVER", num(r.visitorsEver), r.firstSeen ? "Counting since " + fmt.fullDate(r.firstSeen) : "Counting starts now");
        c.appendChild(grid);
        return c;
    }

    function renderLive(body) {
        const live = ui.live;
        const hero = el("div", "nrc-hero");
        const now = card("Online now", "multiplayer", "Updates every 10 seconds");
        now.appendChild(el("div", "nrc-odo", num(live.online)));
        now.appendChild(stateStack(live.sessions));
        hero.appendChild(now);

        const ringCard = card("Last 3 hours", "graph", "Most players online in each minute");
        const ringBox = el("div", "nrc-chart");
        ringBox.style.height = "150px";
        ringCard.appendChild(ringBox);
        hero.appendChild(ringCard);
        body.appendChild(hero);
        const byMinute = new Map(live.ring);
        const lastMinute = Math.floor(live.now / 60000);
        const points = [];
        // Background tabs only check in every 4 minutes, so a quiet minute keeps the last count.
        let carried = 0;
        let quiet = 0;
        for (let m = lastMinute - 179; m <= lastMinute; m++) {
            if (byMinute.has(m)) {
                carried = byMinute.get(m);
                quiet = 0;
            } else if (++quiet > 4) {
                carried = 0;
            }
            points.push({ t: m * 60000 + ui.liveClockOffset, v: m === lastMinute ? live.online : carried });
        }
        ui.charts = [() => drawChart(ringBox, points, { kind: "area", labels: { tick: fmt.time, tip: fmt.time }, unit: "online", minMax: 4 })];

        const list = card("On the site", "helmet");
        if (!live.sessions.length) {
            list.appendChild(el("div", "nrc-empty", "Nobody is on the site right now."));
        } else {
            const rows = live.sessions.map((x) => {
                const doing = el("span");
                const pill = el("span", "nrc-pill", STATE_LABELS[x.state] || x.state);
                pill.style.background = STATE_COLORS[x.state] || "#3987e5";
                doing.appendChild(pill);
                if (x.state === "race" && x.track) doing.appendChild(document.createTextNode("  " + trackName(x.track)));
                const since = el("span", null, duration((Date.now() - ui.liveClockOffset - x.since) / 1000));
                since.dataset.since = String(x.since);
                return [withFlag(x.country, x.nickname || "Unnamed"), doing, since, x.device + " · " + x.os + " · " + x.browser, x.site || ""];
            });
            list.appendChild(table([["Player", "name"], ["Doing"], ["On site for", "num"], ["Device"], ["Site"]], rows));
        }
        body.appendChild(list);
    }

    function renderDrivers(body, s) {
        const t = s.totals;
        const tiles = el("div", "nrc-tiles");
        tiles.appendChild(tile("Unique visitors", num(t.visitors), rangeLabel()));
        tiles.appendChild(tile("First-timers", num(t.newVisitors), pct(t.newVisitors, t.visitors) + " of visitors"));
        tiles.appendChild(tile("Opens per visitor", t.visitors ? (t.sessions / t.visitors).toFixed(1) : "–", "average"));
        tiles.appendChild(tile("Avg session", duration(t.sessions ? t.runtime / t.sessions : 0), "per open"));
        body.appendChild(tiles);

        const top = card("Most time on the site", "trophy", "Top drivers " + rangeLabel() + ", by combined runtime across all their visits");
        if (!s.players.length) top.appendChild(el("div", "nrc-empty", "No visitors in this range yet."));
        else {
            top.appendChild(table(
                [["#", "rank"], ["Driver", "name"], ["Time on site", "num"], ["Driving", "num"], ["Visits", "num"], ["Races", "num"], ["Finishes", "num"], ["Last seen", "num"]],
                s.players.map((p, i) => [String(i + 1), withFlag(p.country, p.nickname || "Unnamed"), duration(p.runtime), duration(p.driving),
                    num(p.opens), num(p.attempts), num(p.finishes), fmt.dateTime(p.lastSeen)])));
        }
        body.appendChild(top);

        const grid = el("div", "nrc-grid2");
        grid.style.marginTop = "14px";
        const lenCard = card("How long people stay", "timer", "Sessions by length, " + rangeLabel());
        const edges = s.lengths.edges;
        const names = ["< " + duration(edges[0])].concat(edges.slice(1).map((e, i) => duration(edges[i]) + " – " + duration(e)), [duration(edges[edges.length - 1]) + "+"]);
        const lenRows = s.lengths.counts.map((c, i) => ({ key: names[i], opens: c }));
        const lenMax = Math.max(1, ...lenRows.map((r) => r.opens));
        const lenList = el("div", "nrc-bars");
        for (const r of lenRows) {
            const row = el("div", "nrc-bar");
            row.appendChild(el("div", "lab", r.key));
            const track = el("div", "track");
            const fill = el("div", "fill");
            fill.style.width = (r.opens / lenMax) * 100 + "%";
            track.appendChild(fill);
            row.appendChild(track);
            row.appendChild(el("div", "val", num(r.opens) + " sessions"));
            lenList.appendChild(row);
        }
        lenCard.appendChild(lenList);
        grid.appendChild(lenCard);

        const loyal = card("New vs returning", "refresh", "Opens by people who had visited before");
        const stack = el("div", "nrc-stack");
        const newOpens = t.sessions - t.returningOpens;
        for (const [n, color] of [[newOpens, STATE_COLORS.menu], [t.returningOpens, STATE_COLORS.race]]) {
            if (!n) continue;
            const seg = el("div");
            seg.style.flex = String(n);
            seg.style.background = color;
            stack.appendChild(seg);
        }
        loyal.appendChild(stack);
        const keys = el("div", "nrc-keys");
        for (const [label, n, color] of [["First visit", newOpens, STATE_COLORS.menu], ["Came back", t.returningOpens, STATE_COLORS.race]]) {
            const k = el("span");
            const sw = el("i");
            sw.style.background = color;
            k.appendChild(sw);
            k.appendChild(document.createTextNode(label + " " + num(n) + " (" + pct(n, t.sessions) + ")"));
            keys.appendChild(k);
        }
        loyal.appendChild(keys);
        grid.appendChild(loyal);
        body.appendChild(grid);
    }

    function renderTracks(body, s) {
        const t = s.totals;
        const tiles = el("div", "nrc-tiles");
        tiles.appendChild(tile("Races started", num(t.attempts), "every start and restart"));
        tiles.appendChild(tile("Finishes", num(t.finishes), pct(t.finishes, t.attempts) + " finish rate"));
        tiles.appendChild(tile("Runs uploaded", num(t.uploads), "to the leaderboards"));
        tiles.appendChild(tile("Replays watched", num(t.replays), "Watch view opened"));
        tiles.appendChild(tile("Clips saved", num(t.clips), "with the clip key"));
        tiles.appendChild(tile("Editor opens", num(t.editor), "track editor"));
        tiles.appendChild(tile("Garage visits", num(t.garage), "car customising"));
        tiles.appendChild(tile("Standings checks", num(t.standings), "weekly standings"));
        body.appendChild(tiles);

        const c = card("Most played tracks", "checkpoint", "By races started, " + rangeLabel());
        if (!s.tracks.length) c.appendChild(el("div", "nrc-empty", "No races in this range yet."));
        else {
            c.appendChild(table(
                [["#", "rank"], ["Track", "name"], ["Races", "num"], ["Finishes", "num"], ["Finish rate", "num"], ["Uploads", "num"]],
                s.tracks.map((x, i) => [String(i + 1), trackName(x.track), num(x.attempts), num(x.finishes), pct(x.finishes, x.attempts), num(x.uploads)])));
        }
        body.appendChild(c);
    }

    function renderAudience(body, s) {
        const grid = el("div", "nrc-grid2");
        const countries = card("Countries", "blank_flag", "Where visitors are, by opens, " + rangeLabel());
        countries.appendChild(barList(s.countries, (row, lab) => lab.appendChild(withFlag(row.key, countryName(row.key))), (r) => r.opens));
        grid.appendChild(countries);

        const right = el("div");
        right.style.cssText = "display:flex;flex-direction:column;gap:14px;min-width:0;";
        const devices = card("Devices", "fullscreen");
        devices.appendChild(barList(s.devices, (row, lab) => (lab.textContent = row.key), (r) => r.opens));
        right.appendChild(devices);
        const oses = card("Systems", "settings");
        oses.appendChild(barList(s.oses, (row, lab) => (lab.textContent = row.key), (r) => r.opens));
        right.appendChild(oses);
        grid.appendChild(right);
        body.appendChild(grid);

        const grid2 = el("div", "nrc-grid2");
        const browsers = card("Browsers", "search");
        browsers.appendChild(barList(s.browsers, (row, lab) => (lab.textContent = row.key), (r) => r.opens));
        grid2.appendChild(browsers);
        const refs = card("Came from", "share", "The site that linked them here");
        refs.appendChild(barList(s.referrers, (row, lab) => (lab.textContent = row.key === "direct" ? "Direct / bookmark" : row.key), (r) => r.opens));
        grid2.appendChild(refs);
        const sites = card("Site copies", "load", "Which address they played on");
        sites.appendChild(barList(s.sites, (row, lab) => (lab.textContent = row.key), (r) => r.opens));
        grid2.appendChild(sites);
        body.appendChild(grid2);
    }

    function raceTime(frames) {
        const ms = Math.max(0, Math.round(frames || 0));
        const m = Math.floor(ms / 60000);
        return m + ":" + String(Math.floor(ms / 1000) % 60).padStart(2, "0") + "." + String(ms % 1000).padStart(3, "0");
    }

    function allTrackIds() {
        const ids = new Set();
        for (const w of window.__nswsWeeks || []) {
            for (const t of window.__nswsTracksForWeek ? window.__nswsTracksForWeek(w.week) : []) ids.add(t.id);
        }
        return ids;
    }

    async function syncTracks(force) {
        ui.antiBusy = force ? "Re-sending every track…" : "Sending missing tracks…";
        render();
        try {
            const { synced, total } = await window.__nswsOwner.syncTracks(force);
            ui.antiBusy = total ? `Sent ${synced} of ${total} tracks.` : "Every track is already synced.";
        } catch {
            ui.antiBusy = "Sync failed. Try again in a moment.";
        }
        await loadAnti();
    }

    function renderAntiCheat(body) {
        if (ui.antiError && !ui.anti) {
            body.appendChild(el("div", "nrc-status", "Couldn't load the anti-cheat status."));
            return;
        }
        const a = ui.anti;
        if (!a) {
            body.appendChild(el("div", "nrc-status", "Loading anti-cheat…"));
            return;
        }
        const count = (pred) => a.counts.filter(pred).reduce((n, r) => n + r.n, 0);
        const passed = count((r) => r.state === "valid");
        const hidden = count((r) => r.state === "invalid");
        const outside = count((r) => r.state === "invalid" && r.source === "outside");
        const ids = allTrackIds();
        const synced = a.tracks.filter((t) => ids.has(t.id)).length;

        const rules = card("How runs are checked", "verified");
        const list = el("div", "nrc-keys");
        list.style.cssText = "flex-direction:column;gap:8px;font-size:14px;";
        for (const text of [
            "Every run is replayed with the game's own physics. It must pass every checkpoint and cross the finish on exactly the time it claims.",
            "Runs must be uploaded through this site. Runs sent to Kodub any other way are hidden.",
            "Your owner key skips every check: your runs always show, and your uploads are never replayed.",
            "The proxy only answers the game on brinleyww.github.io and notweeklyshorts.github.io.",
            "Runs already on a board when anti-cheat started stay up while they're replayed once in the background.",
        ]) {
            const row = el("span");
            row.style.alignItems = "flex-start";
            const tick = el("i");
            tick.style.cssText = "background:" + GOOD + ";flex-shrink:0;margin-top:2px;";
            row.appendChild(tick);
            row.appendChild(document.createTextNode(text));
            list.appendChild(row);
        }
        rules.appendChild(list);
        body.appendChild(rules);

        const tiles = el("div", "nrc-tiles");
        tiles.style.marginTop = "14px";
        tiles.appendChild(tile("Runs passed", num(passed), "shown on the boards"));
        tiles.appendChild(tile("Hidden runs", num(hidden), num(outside) + " uploaded elsewhere"));
        tiles.appendChild(tile("Rejected uploads", num(a.rejectTotals.runs), num(a.rejectTotals.attempts) + " attempts blocked"));
        tiles.appendChild(tile("Waiting for replay", num(a.queue.n), a.queue.waiting ? num(a.queue.waiting) + " need a track sync" : "background check"));
        tiles.appendChild(tile("Tracks synced", num(synced) + " / " + num(ids.size), num(a.boards) + " boards watched"));
        body.appendChild(tiles);

        const sync = card("Track sync", "refresh", "The Worker can't read the encrypted tracks, so your game sends each track's physics data. That happens by itself when you open the site; use these after changing a track.");
        const buttons = el("div", "nrc-toggle");
        const missing = el("button", "button", "Send missing tracks");
        missing.addEventListener("click", () => syncTracks(false));
        const all = el("button", "button", "Re-send all tracks");
        all.addEventListener("click", () => syncTracks(true));
        buttons.appendChild(missing);
        buttons.appendChild(all);
        sync.appendChild(buttons);
        if (ui.antiBusy) {
            const note = el("p", "nrc-sub", ui.antiBusy);
            note.style.margin = "10px 0 0";
            sync.appendChild(note);
        }
        const unsynced = [...ids].filter((id) => !a.tracks.some((t) => t.id === id));
        if (unsynced.length) {
            const note = el("p", "nrc-sub", "Not synced yet: " + unsynced.map(trackName).join(", "));
            note.style.margin = "10px 0 0";
            sync.appendChild(note);
        }
        sync.style.marginBottom = "14px";
        body.appendChild(sync);

        const rej = card("Rejected uploads", "cancel", "Runs refused at upload because the replay didn't match. They never reached Kodub.");
        if (!a.rejects.length) rej.appendChild(el("div", "nrc-empty", "No rejected uploads."));
        else {
            rej.appendChild(table(
                [["Last try", "num"], ["Player", "name"], ["Track", "name"], ["Claimed", "num"], ["Why"], ["Tries", "num"]],
                a.rejects.map((r) => [fmt.dateTime(r.last), r.nickname || "Unnamed", trackName(r.track), raceTime(r.frames), REASONS[r.reason] || r.reason, num(r.attempts)])));
        }
        rej.style.marginBottom = "14px";
        body.appendChild(rej);

        const blocked = card("Hidden from the boards", "state_invalid", "Runs on Kodub that the boards no longer show. Allow one if you're sure it's fine.");
        if (!a.blocked.length) blocked.appendChild(el("div", "nrc-empty", "Nothing hidden."));
        else {
            blocked.appendChild(table(
                [["Player", "name"], ["Track", "name"], ["Time", "num"], ["Why"], ["Found", "num"], [""]],
                a.blocked.map((r) => {
                    const allow = el("button", "button", "Allow");
                    allow.style.cssText = "font-size:13px;padding:4px 12px;";
                    allow.addEventListener("click", async () => {
                        allow.disabled = true;
                        try {
                            await post("anticheat/approve", { id: r.id });
                        } catch {}
                        loadAnti();
                    });
                    return [r.nickname || "Unnamed", trackName(r.track), raceTime(r.frames), REASONS[r.reason] || r.reason || "", fmt.dateTime(r.at), allow];
                })));
        }
        body.appendChild(blocked);
        body.appendChild(el("div", "nrc-foot", "Owner only. Refreshes every minute while this tab is open."));
    }

    function render() {
        if (!ui.overlay) return;
        const body = ui.body;
        const scroll = body.scrollTop;
        body.textContent = "";
        hideTip();
        ui.charts = [];
        for (const b of ui.overlay.querySelectorAll("[data-range]")) b.classList.toggle("on", b.dataset.range === ui.range);
        for (const b of ui.overlay.querySelectorAll("[data-tab]")) b.classList.toggle("on", b.dataset.tab === ui.tab);

        if (ui.error && !ui.stats) {
            const box = el("div", "nrc-status", ui.error.status === 403
                ? "This profile isn't the owner, so Race Control stays closed."
                : "Couldn't reach Race Control.");
            if (ui.error.status !== 403) {
                box.appendChild(document.createElement("br"));
                const retry = el("button", "button", "Retry");
                retry.addEventListener("click", () => {
                    ui.error = null;
                    render();
                    loadStats();
                });
                box.appendChild(retry);
            }
            body.appendChild(box);
            return;
        }
        if (ui.tab === "anticheat") {
            renderAntiCheat(body);
            return;
        }
        if (!ui.stats || !ui.live) {
            body.appendChild(el("div", "nrc-status", "Loading telemetry…"));
            return;
        }

        const s = ui.stats;
        if (ui.tab === "overview") renderOverview(body, s);
        else if (ui.tab === "live") renderLive(body);
        else if (ui.tab === "drivers") renderDrivers(body, s);
        else if (ui.tab === "tracks") renderTracks(body, s);
        else renderAudience(body, s);

        const foot = el("div", "nrc-foot",
            "Owner only. Times are in your time zone. Visitors are anonymous ids kept in each browser, so one person on two devices counts twice. " +
            (ui.error ? "Last refresh failed; showing the previous numbers." : "Refreshes every minute."));
        body.appendChild(foot);
        for (const draw of ui.charts) draw();
        body.scrollTop = scroll;
    }

    function onResize() {
        for (const draw of ui.charts) draw();
    }

    function onKey(e) {
        if (e.code === "Escape" || e.key === "Escape") {
            e.preventDefault();
            e.stopImmediatePropagation();
            close();
        }
    }

    function close() {
        if (!ui.overlay) return;
        ui.overlay.remove();
        tip.remove();
        ui.overlay = null;
        ui.stats = null;
        ui.charts = [];
        for (const t of ui.timers) clearInterval(t);
        ui.timers = [];
        cancelAnimationFrame(ui.raf);
        window.removeEventListener("keydown", onKey, true);
        window.removeEventListener("resize", onResize);
    }

    function open() {
        if (ui.overlay) return;
        if (!document.getElementById("nrc-style")) {
            const style = el("style");
            style.id = "nrc-style";
            style.textContent = CSS;
            document.head.appendChild(style);
        }
        const overlay = el("div");
        overlay.id = "nrc-overlay";
        const panel = el("div", "nrc-panel");
        panel.appendChild(el("div", "nrc-checker"));

        const head = el("div", "nrc-head");
        const title = el("div", "nrc-title");
        title.appendChild(el("h1", null, "Race Control"));
        title.appendChild(el("span", "nrc-tag", "OWNER ONLY"));
        head.appendChild(title);
        const live = el("div", "nrc-live");
        ui.liveDot = el("span", "nrc-dot off");
        ui.liveText = el("span", null, "…");
        live.appendChild(ui.liveDot);
        live.appendChild(ui.liveText);
        head.appendChild(live);
        const chips = el("div", "nrc-chips");
        for (const [key, label] of RANGES) {
            const b = el("button", "button nrc-chip", label);
            b.dataset.range = key;
            b.addEventListener("click", () => {
                if (ui.range === key) return;
                ui.range = key;
                ui.stats = null;
                render();
                loadStats();
            });
            chips.appendChild(b);
        }
        head.appendChild(chips);
        const closeBtn = el("button", "button nrc-close", "✕");
        closeBtn.setAttribute("aria-label", "Close");
        closeBtn.addEventListener("click", close);
        head.appendChild(closeBtn);
        panel.appendChild(head);

        const tabs = el("div", "nrc-tabs");
        for (const [key, label] of TABS) {
            const b = el("button", "button nrc-tab", label);
            b.dataset.tab = key;
            b.addEventListener("click", () => {
                ui.tab = key;
                ui.body.scrollTop = 0;
                render();
                if (key === "anticheat") loadAnti();
            });
            tabs.appendChild(b);
        }
        panel.appendChild(tabs);
        ui.body = el("div", "nrc-body");
        ui.body.addEventListener("scroll", hideTip, { passive: true });
        panel.appendChild(ui.body);
        overlay.appendChild(panel);
        overlay.addEventListener("pointerdown", (e) => {
            if (e.target === overlay) close();
        });
        document.body.appendChild(overlay);
        document.body.appendChild(tip);
        ui.overlay = overlay;

        window.addEventListener("keydown", onKey, true);
        window.addEventListener("resize", onResize);
        ui.timers.push(setInterval(loadLive, LIVE_REFRESH_MS));
        ui.timers.push(setInterval(loadStats, STATS_REFRESH_MS));
        ui.timers.push(setInterval(() => ui.tab === "anticheat" && loadAnti(), STATS_REFRESH_MS));
        ui.raf = requestAnimationFrame(tick);
        render();
        loadStats();
    }

    window.__nswsOwnerPanel = { open, close };
})();
