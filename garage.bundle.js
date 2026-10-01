"use strict";
(self.webpackChunk = self.webpackChunk || []).push([['garage'], {
    35: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".profile-selection-ui {\n\tdisplay: flex;\n\talign-items: center;\n\tjustify-content: center;\n\twidth: 100%;\n\theight: 100%;\n}\n\n.profile-selection-ui > .background {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 1;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: rgba(20, 20, 30, 0.5);\n\tpointer-events: auto;\n}\n\n.profile-selection-ui > .container {\n\tposition: relative;\n\tz-index: 2;\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 500px;\n\tbox-sizing: border-box;\n\tbackground-color: var(--surface-secondary-color);\n}\n\n.profile-selection-ui > .container > .top-bar {\n\tmargin: 0;\n\tpadding: 10px;\n\tbackground-color: var(--surface-color);\n}\n\n.profile-selection-ui > .container > .top-bar > h2 {\n\tmargin: 0;\n\tpadding: 0;\n\tfont-weight: normal;\n\tfont-size: 38px;\n\ttext-align: center;\n\tcolor: var(--text-color);\n}\n\n.profile-selection-ui > .container > .slot {\n\tposition: relative;\n\tmargin: 10px 10px 0 10px;\n\tpadding: 0;\n}\n\n.profile-selection-ui > .container > .slot > button.main {\n\tdisplay: flex;\n\tmargin: 0;\n\tpadding: 0;\n\tvertical-align: top;\n\twidth: 100%;\n\theight: 100px;\n\tclip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);\n\ttext-align: left;\n\twhite-space: nowrap;\n}\n\n.profile-selection-ui > .container > .slot > button.main.selected {\n\tbackground-color: var(--button-hover-color);\n}\n\n.profile-selection-ui > .container > .slot > button.main > .image-container {\n\tdisplay: inline-block;\n\tposition: relative;\n\tbackground-color: rgba(0, 0, 0, 0.1);\n\twidth: 100px;\n\theight: 100px;\n}\n\n.profile-selection-ui > .container > .slot > button.main > .image-container > img {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\twidth: 100%;\n\theight: 100%;\n\tpointer-events: none;\n\topacity: 0;\n\ttransition: opacity 0.5s ease-out;\n}\n.profile-selection-ui > .container > .slot > button.main > .image-container > img.show {\n\topacity: 1;\n}\n\n.profile-selection-ui > .container > .slot > button.main > .name-container {\n\tmargin: 0;\n\tpadding: 0;\n\tfont-size: 28px;\n\tdisplay: flex;\n\twidth: 360px;\n}\n\n.profile-selection-ui > .container > .slot > button.main > .name-container > .name {\n\tmargin: 0;\n\tpadding: 12px;\n\tcolor: var(--text-color);\n\ttext-overflow: ellipsis;\n\toverflow: hidden;\n}\n.profile-selection-ui > .container > .slot > button.main > .name-container > .name.empty {\n\tcolor: #000;\n\topacity: 0.2;\n}\n.profile-selection-ui > .container > .slot > button.main:focus-visible > .name-container > .name > .name {\n\ttext-decoration: underline;\n}\n\n.profile-selection-ui > .container > .slot > button.main > .name-container > .country-flag {\n\tmargin: 12px 0 12px 12px;\n\t/* Flag aspect ratio is 4:3. */\n\twidth: 32px;\n\theight: 24px;\n\tfilter: drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5)); /* box-shadow cannot be used because of Nepal. */\n}\n\n\n.profile-selection-ui > .container > .bottom-bar {\n\tmargin: 10px 0 0 0;\n\tpadding: 10px;\n\tbackground-color: var(--surface-color);\n}\n\n.profile-selection-ui > .container > .bottom-bar > .button.right {\n\tfloat: right;\n}\n", ""]);
        const l = a
    }
    ,
    2561: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, '.profile-settings-ui.hidden {\n\tdisplay: none;\n}\n\n.profile-settings-ui > .background {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 1;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: rgba(20, 20, 30, 0.5);\n\tpointer-events: auto;\n}\n\n.profile-settings-ui > .container {\n\tposition: absolute;\n\tleft: calc(50% - 700px / 2);\n\ttop: 0;\n\tz-index: 2;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: 700px;\n\theight: 100%;\n\tbackground-color: var(--surface-color);\n}\n\n.profile-settings-ui > .container > h1 {\n\tmargin: 10px;\n\tpadding: 0;\n\tfont-weight: normal;\n\tfont-size: 38px;\n\ttext-align: center;\n\tcolor: var(--text-color);\n}\n\n.profile-settings-ui > .container > .content {\n\tdisplay: flex;\n\tflex-direction: column;\n\tflex-grow: 1;\n\tbackground-color: var(--surface-secondary-color);\n\toverflow-y: auto;\n\tpointer-events: auto;\n}\n\n.profile-settings-ui > .container > .content > .double-box-container {\n\tmargin-top: auto;\n\tdisplay: flex;\n\tflex-direction: row;\n\talign-items: stretch;\n\tjustify-content: space-between;\n}\n.profile-settings-ui > .container > .content > .double-box-container > .box {\n\tmargin: 20px;\n}\n.profile-settings-ui > .container > .content > .double-box-container > .box:first-of-type {\n\tmargin-right: 10px;\n}\n.profile-settings-ui > .container > .content > .double-box-container > .box:last-of-type {\n\tmargin-left: 10px;\n}\n\n.profile-settings-ui > .container > .content .box {\n\tmargin: 20px 20px 0 20px;\n\tpadding: 20px;\n\tbackground-color: var(--surface-color);\n\toutline: 2px solid transparent;\n\ttransition: outline 0.25s ease-in-out;\n}\n.profile-settings-ui > .container > .content .box:last-of-type {\n\tmargin-bottom: 20px;\n}\n\n.profile-settings-ui > .container > .content .box > .title {\n\tdisplay: block;\n\tmargin: 0;\n\tpadding: 0;\n\tfont-size: 30px;\n\tcolor: var(--text-color);\n}\n.profile-settings-ui > .container > .content .box > input[type="text"] {\n\twidth: calc(100% - 20px);\n\tfont-weight: normal;\n\tfont-size: 38px;\n}\n.profile-settings-ui > .container > .content .box > .description {\n\tmargin: 10px 0 0 0;\n\tpadding: 0;\n\tfont-size: 16px;\n\tcolor: var(--text-color);\n}\n\n.profile-settings-ui > .container > .content .box > .country-button {\n\tdisplay: flex;\n\tpadding: 10px;\n\twidth: calc(100% - 2 * 10px);\n\theight: 100px;\n\tclip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);\n\ttext-align: left;\n\twhite-space: nowrap;\n}\n\n.profile-settings-ui > .container > .content .box > .country-button > .name {\n\tmargin: 0 20px;\n\talign-self: center;\n\tdisplay: -webkit-box;\n\t-webkit-line-clamp: 2;\n\tline-clamp: 2;\n\t-webkit-box-orient: vertical;\n\twhite-space: wrap;\n\tfont-size: 38px;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n\n.profile-settings-ui > .container > .content .box > .country-button > img {\n\tvertical-align: middle;\n\taspect-ratio: 4 / 3;\n\theight: 100%;\n\tfilter: drop-shadow(4px 4px 1px rgba(0, 0, 0, 0.25)); /* box-shadow cannot be used because of Nepal. */\n}\n\n.profile-settings-ui > .container > .content > .user-token-hash {\n\tmargin: 10px 20px;\n\tfont-size: 17px;\n\topacity: 0.5;\n\tcolor: var(--text-color);\n\tpointer-events: all;\n\t-webkit-user-select: all;\n\t-moz-user-select: all;\n\t-ms-user-select: all;\n\tuser-select: all;\n}\n\n.profile-settings-ui > .container > .button-wrapper > button {\n\tmargin: 10px;\n}\n\n.profile-settings-ui > .container > .button-wrapper > button:not(:first-child) {\n\tfloat: right;\n}\n', ""]);
        const l = a
    }
    ,
    3257: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".user-export-ui > .background {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 1;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: rgba(20, 20, 30, 0.5);\n\tpointer-events: auto;\n}\n\n.user-export-ui > .container {\n\tposition: absolute;\n\tleft: calc(50% - 500px / 2);\n\ttop: 35%;\n\tz-index: 2;\n\tmargin: 0;\n\tpadding: 10px;\n\tbox-sizing: border-box;\n\twidth: 500px;\n\theight: 150px;\n\tbackground-color: var(--surface-color);\n}\n\n.user-export-ui > .container > textarea {\n\tmargin: 0;\n\tpadding: 10px;\n\tbox-sizing: border-box;\n\tmin-width: 100%;\n\tmax-width: 100%;\n\tmin-height: calc(100% - 52px - 10px);\n\tmax-height: calc(100% - 52px - 10px);\n\tpointer-events: auto;\n\tbackground-color: var(--surface-tertiary-color);\n\tborder: none;\n\tresize: none;\n\tcolor: var(--text-color);\n\tword-break: break-all;\n\tfont-size: 20px;\n}\n.user-export-ui > .container > textarea:focus-visible {\n\toutline: none;\n}\n\n.user-export-ui > .container > .bar {\n\tmargin: 8px 0 0 0;\n}\n\n.user-export-ui > .container > .bar > .button.right {\n\tfloat: right;\n}\n", ""]);
        const l = a
    }
    ,
    3280: (t, n, e) => {
        e.d(n, {
            default: () => Ae
        });
        var i = e(1635)
          , THREE = e(4922)
          , DRACOLoader = e(1728).Z
          , a = e(7888)
          , VisualCar = e(4078).A
          , c = e(5072)
          , r = e.n(c)
          , h = e(7825)
          , d = e.n(h)
          , g = e(7659)
          , f = e.n(g)
          , p = e(5056)
          , u = e.n(p)
          , m = e(540)
          , v = e.n(m)
          , w = e(1113)
          , b = e.n(w)
          , x = e(8026)
          , k = {};
        k.styleTagTransform = b(),
        k.setAttributes = u(),
        k.insert = f().bind(null, "head"),
        k.domAPI = d(),
        k.insertStyleElement = v();
        r()(x.A, k);
        x.A && x.A.locals && x.A.locals;
        var OrbitControls = e(7024).N
          , y = e(765)
          , RenderManager = e(2825).A
          , E = e(2951)
          , M = e(2561)
          , N = {};
        N.styleTagTransform = b(),
        N.setAttributes = u(),
        N.insert = f().bind(null, "head"),
        N.domAPI = d(),
        N.insertStyleElement = v();
        r()(M.A, N);
        M.A && M.A.locals && M.A.locals;
        var L = e(2970)
          , A = e(5408)
          , W = e(9e3)
          , S = {};
        S.styleTagTransform = b(),
        S.setAttributes = u(),
        S.insert = f().bind(null, "head"),
        S.domAPI = d(),
        S.insertStyleElement = v();
        r()(W.A, S);
        W.A && W.A.locals && W.A.locals;
        var T, z, P, I, U, H, O, D, R, B, F, q, V;
        z = new WeakMap,
        P = new WeakMap,
        I = new WeakMap,
        U = new WeakMap,
        H = new WeakMap,
        O = new WeakMap,
        D = new WeakMap,
        R = new WeakMap,
        B = new WeakMap,
        F = new WeakMap,
        T = new WeakSet,
        q = function(t) {
            let n, e;
            null == t ? (n = "images/blank_flag.svg",
            e = i.get(this, z, "f").get("None")) : (n = "images/countries/" + t.code + ".svg",
            e = t.name);
            const s = document.createElement("button");
            s.className = "button country-button",
            s.addEventListener("click", ( () => {
                i.get(this, P, "f").playUIClick(),
                i.get(this, I, "f").call(this, t?.code ?? null)
            }
            )),
            i.get(this, D, "f").appendChild(s);
            const o = document.createElement("img");
            o.className = "loading",
            o.addEventListener("load", ( () => {
                o.classList.remove("loading")
            }
            )),
            o.loading = "lazy",
            o.src = n,
            s.appendChild(o);
            const a = document.createElement("div");
            a.className = "name",
            a.textContent = e,
            s.appendChild(a);
            const l = [e.toLowerCase()];
            if (null != t)
                switch (l.push(t.code),
                t.code) {
                case "ae":
                    l.push("uae");
                    break;
                case "cd":
                    l.push("dr congo", "drc", "congo-kinshasa");
                    break;
                case "cz":
                    l.push("czech republic");
                    break;
                case "gb":
                    l.push("uk", "great britain");
                    break;
                case "kp":
                    l.push("north korea");
                    break;
                case "kr":
                    l.push("south korea");
                    break;
                case "nl":
                    l.push("holland");
                    break;
                case "la":
                    l.push("laos");
                    break;
                case "tr":
                    l.push("turkey", "turkiye");
                    break;
                case "us":
                    l.push("usa");
                    break;
                case "vn":
                    l.push("vietnam")
                }
            return {
                searchNames: l,
                button: s
            }
        }
        ,
        V = function() {
            const t = i.get(this, O, "f").value.trim().toLowerCase().split(" ");
            let n = !1;
            for (const {searchNames: e, button: s} of i.get(this, R, "f")) {
                const i = e.flatMap((t => t.split(" ")));
                t.every((t => i.some((n => n.startsWith(t))))) ? (n = !0,
                s.style.display = "") : s.style.display = "none"
            }
            i.get(this, B, "f").style.display = n ? "none" : ""
        }
        ;
        const X = class {
            constructor(t, n, e, s, o) {
                T.add(this),
                z.set(this, void 0),
                P.set(this, void 0),
                I.set(this, void 0),
                U.set(this, void 0),
                H.set(this, void 0),
                O.set(this, void 0),
                D.set(this, void 0),
                R.set(this, []),
                B.set(this, void 0),
                F.set(this, void 0),
                i.set(this, z, t, "f"),
                i.set(this, P, n, "f"),
                i.set(this, I, o, "f");
                const a = document.getElementById("ui");
                if (null == a)
                    throw new Error("UI element not found");
                i.set(this, U, a, "f"),
                i.set(this, H, document.createElement("div"), "f"),
                i.get(this, H, "f").className = "country-selection-ui",
                i.get(this, U, "f").appendChild(i.get(this, H, "f"));
                const l = document.createElement("div");
                l.className = "background",
                i.get(this, H, "f").appendChild(l);
                const c = document.createElement("div");
                c.className = "container",
                i.get(this, H, "f").appendChild(c);
                const r = document.createElement("h1");
                r.textContent = t.get("Select country"),
                c.appendChild(r);
                const h = document.createElement("div");
                h.className = "search-bar-container",
                c.appendChild(h),
                i.set(this, O, document.createElement("input"), "f"),
                i.get(this, O, "f").type = "text",
                i.get(this, O, "f").spellcheck = !1,
                i.get(this, O, "f").autocomplete = "off",
                i.get(this, O, "f").enterKeyHint = "search",
                i.get(this, O, "f").placeholder = i.get(this, z, "f").get("Search country..."),
                i.get(this, O, "f").addEventListener("input", ( () => {
                    i.get(this, T, "m", V).call(this)
                }
                )),
                h.appendChild(i.get(this, O, "f")),
                i.get(this, O, "f").focus();
                const d = document.createElement("img");
                d.src = "images/search.svg",
                h.appendChild(d),
                i.set(this, D, document.createElement("div"), "f"),
                i.get(this, D, "f").className = "content",
                c.appendChild(i.get(this, D, "f")),
                i.set(this, B, document.createElement("div"), "f"),
                i.get(this, B, "f").className = "nothing-found-message",
                i.get(this, B, "f").style.display = "none",
                i.get(this, B, "f").textContent = i.get(this, z, "f").get("No countries found"),
                i.get(this, D, "f").appendChild(i.get(this, B, "f"));
                let g = null;
                const f = [null].concat((0,
                L.O)());
                for (const t of f) {
                    const {searchNames: n, button: s} = i.get(this, T, "m", q).call(this, t);
                    t?.code == e && (g = s),
                    i.get(this, R, "f").push({
                        searchNames: n,
                        button: s
                    })
                }
                const p = document.createElement("div");
                p.className = "button-wrapper",
                c.appendChild(p);
                const u = document.createElement("button");
                u.className = "button",
                u.innerHTML = '<img class="button-icon" src="images/cancel.svg"> ',
                u.appendChild(document.createTextNode(t.get("Cancel"))),
                u.addEventListener("click", ( () => {
                    n.playUIClick(),
                    s()
                }
                )),
                p.appendChild(u),
                null != g && (g.classList.add("selected"),
                i.get(this, D, "f").scrollTop = Math.max(0, g.offsetTop - i.get(this, D, "f").offsetTop - i.get(this, D, "f").clientHeight / 2 + g.clientHeight / 2)),
                window.addEventListener("keydown", i.set(this, F, (t => {
                    "Escape" == t.code && (s(),
                    t.preventDefault())
                }
                ), "f"))
            }
            dispose() {
                i.get(this, U, "f").removeChild(i.get(this, H, "f")),
                window.removeEventListener("keydown", i.get(this, F, "f"))
            }
        }
        ;
        var Q, Y, _, j, Z, J, K, $;
        Y = new WeakMap,
        _ = new WeakMap,
        j = new WeakMap,
        Z = new WeakMap,
        J = new WeakMap,
        K = new WeakMap,
        Q = new WeakSet,
        $ = function() {
            let t = i.get(this, j, "f").value;
            return /\S/.test(t) || (t = "Anonymous"),
            {
                nickname: t,
                countryCode: i.get(this, J, "f")
            }
        }
        ;
        const tt = class {
            constructor(t, n, e, s, o, a, l, c, r) {
                Q.add(this),
                Y.set(this, void 0),
                _.set(this, void 0),
                j.set(this, void 0),
                Z.set(this, void 0),
                J.set(this, void 0),
                K.set(this, null),
                i.set(this, J, s, "f");
                const h = document.getElementById("ui");
                if (null == h)
                    throw new Error("UI element not found");
                i.set(this, Y, h, "f"),
                i.set(this, _, document.createElement("div"), "f"),
                i.get(this, _, "f").className = "profile-settings-ui",
                i.get(this, Y, "f").appendChild(i.get(this, _, "f"));
                const d = document.createElement("div");
                d.className = "background",
                i.get(this, _, "f").appendChild(d);
                const g = document.createElement("div");
                g.className = "container",
                i.get(this, _, "f").appendChild(g);
                const f = document.createElement("h1");
                f.textContent = t.get("Profile"),
                g.appendChild(f);
                const p = document.createElement("div");
                p.className = "content",
                g.appendChild(p);
                const u = document.createElement("div");
                u.className = "box",
                p.appendChild(u);
                const m = document.createElement("label");
                m.className = "title",
                m.append(document.createTextNode(t.get("Nickname"))),
                u.appendChild(m),
                i.set(this, j, document.createElement("input"), "f"),
                i.get(this, j, "f").type = "text",
                i.get(this, j, "f").placeholder = E.A.defaultNickname,
                i.get(this, j, "f").spellcheck = !1,
                e != i.get(this, j, "f").placeholder && (i.get(this, j, "f").value = e),
                u.appendChild(i.get(this, j, "f")),
                i.get(this, j, "f").focus(),
                i.get(this, j, "f").addEventListener("input", ( () => {
                    let t = i.get(this, j, "f").value;
                    for (; (0,
                    A.k)(t) >= 50; )
                        t = t.substring(0, t.length - 1);
                    i.get(this, j, "f").value = t
                }
                ));
                const __nswsNicknameBanned = typeof window.__nswsIsNicknameBanned === "function" && window.__nswsIsNicknameBanned(o?.nickname ?? e);
                __nswsNicknameBanned && (i.get(this, j, "f").disabled = !0);
                const v = document.createElement("div");
                v.className = "description",
                v.textContent = __nswsNicknameBanned ? t.get("Your profile has been banned. You cannot change your nickname.") : t.get("Choose a nickname to be shown in the leaderboard. Your nickname can be changed at any time."),
                u.appendChild(v);
                const w = document.createElement("div");
                w.className = "box",
                p.appendChild(w);
                const b = document.createElement("label");
                b.className = "title",
                b.append(document.createTextNode(t.get("Country"))),
                w.appendChild(b);
                const x = (0,
                L.O)()
                  , k = x.find((t => t.code == i.get(this, J, "f")))
                  , G = k?.name ?? t.get("None");
                let y;
                y = null == k ? "images/blank_flag.svg" : "images/countries/" + k.code + ".svg";
                const C = document.createElement("button");
                C.className = "button country-button";
                const M = document.createElement("img");
                M.src = y,
                C.appendChild(M);
                const N = document.createElement("div");
                N.className = "name",
                N.textContent = G,
                C.append(N),
                C.addEventListener("click", ( () => {
                    if (n.playUIClick(),
                    null == i.get(this, K, "f")) {
                        i.get(this, _, "f").classList.add("hidden");
                        const e = i.get(this, J, "f");
                        i.set(this, K, new X(t,n,e,( () => {
                            i.get(this, _, "f").classList.remove("hidden"),
                            i.get(this, K, "f")?.dispose(),
                            i.set(this, K, null, "f")
                        }
                        ),(n => {
                            i.get(this, _, "f").classList.remove("hidden"),
                            i.set(this, J, n, "f");
                            const e = x.find((t => t.code == i.get(this, J, "f")))
                              , s = e?.name ?? t.get("None");
                            let o;
                            o = null == e ? "images/blank_flag.svg" : "images/countries/" + e.code + ".svg",
                            M.src = o,
                            N.textContent = s,
                            i.get(this, K, "f")?.dispose(),
                            i.set(this, K, null, "f")
                        }
                        )), "f")
                    }
                }
                )),
                w.appendChild(C);
                const W = document.createElement("div");
                W.className = "description",
                W.textContent = t.get("Select your country to be shown in the leaderboard. This is optional and can be changed at any time. Only UN member states are listed."),
                w.appendChild(W);
                const S = document.createElement("div");
                S.className = "user-token-hash",
                S.textContent = t.get("User ID") + ": " + o.tokenHash,
                p.appendChild(S);
                const T = document.createElement("div");
                T.className = "double-box-container",
                p.appendChild(T);
                const z = document.createElement("div");
                z.className = "box",
                T.appendChild(z);
                const P = document.createElement("button");
                P.className = "button delete",
                P.innerHTML = ' <img class="button-icon" src="images/delete.svg"> ',
                P.append(t.get("Delete")),
                P.addEventListener("click", ( () => {
                    n.playUIClick(),
                    l(i.get(this, Q, "m", $).call(this))
                }
                )),
                z.appendChild(P);
                const I = document.createElement("div");
                I.className = "description",
                I.textContent = t.get("Delete your profile from this device. The profile will remain on other devices and can be restored using the private token."),
                z.appendChild(I);
                const U = document.createElement("div");
                U.className = "box",
                T.appendChild(U);
                const H = document.createElement("button");
                H.className = "button",
                H.innerHTML = '<img class="button-icon" src="images/export.svg"> ',
                H.append(t.get("Export")),
                H.addEventListener("click", ( () => {
                    n.playUIClick(),
                    c(i.get(this, Q, "m", $).call(this), o.token)
                }
                )),
                U.appendChild(H);
                const O = document.createElement("div");
                O.className = "description",
                O.textContent = t.get("Export your private token. This token can be used to back up your account or restore it on another device."),
                U.appendChild(O);
                const D = document.createElement("div");
                D.className = "button-wrapper",
                g.appendChild(D);
                const R = document.createElement("button");
                if (R.className = "button",
                R.innerHTML = '<img class="button-icon" src="images/cancel.svg"> ',
                R.appendChild(document.createTextNode(t.get("Cancel"))),
                R.addEventListener("click", ( () => {
                    n.playUIClick(),
                    r(null)
                }
                )),
                D.appendChild(R),
                a) {
                    const e = document.createElement("button");
                    e.className = "button",
                    e.innerHTML = ' <img class="button-icon" src="images/save.svg">',
                    e.prepend(document.createTextNode(t.get("Save"))),
                    e.addEventListener("click", ( () => {
                        n.playUIClick(),
                        r(i.get(this, Q, "m", $).call(this))
                    }
                    )),
                    D.appendChild(e)
                } else {
                    const e = document.createElement("button");
                    e.className = "button",
                    e.innerHTML = ' <img class="button-icon" src="images/apply.svg">',
                    e.prepend(document.createTextNode(t.get("Confirm"))),
                    e.addEventListener("click", ( () => {
                        n.playUIClick(),
                        r(i.get(this, Q, "m", $).call(this))
                    }
                    )),
                    D.appendChild(e)
                }
                window.addEventListener("keydown", i.set(this, Z, (t => {
                    null == i.get(this, K, "f") && ("Escape" == t.code ? (r(null),
                    t.preventDefault()) : "Enter" == t.code && (r(i.get(this, Q, "m", $).call(this)),
                    t.preventDefault()))
                }
                ), "f"))
            }
            dispose() {
                i.get(this, Y, "f").removeChild(i.get(this, _, "f")),
                i.get(this, K, "f")?.dispose(),
                i.set(this, K, null, "f"),
                window.removeEventListener("keydown", i.get(this, Z, "f"))
            }
        }
        ;
        var nt = e(3257)
          , et = {};
        et.styleTagTransform = b(),
        et.setAttributes = u(),
        et.insert = f().bind(null, "head"),
        et.domAPI = d(),
        et.insertStyleElement = v();
        r()(nt.A, et);
        nt.A && nt.A.locals && nt.A.locals;
        var it, st, ot, at = e(202);
        it = new WeakMap,
        st = new WeakMap,
        ot = new WeakMap;
        const lt = class {
            constructor(t, n, e, s, o) {
                it.set(this, void 0),
                st.set(this, void 0),
                ot.set(this, void 0);
                const a = document.getElementById("ui");
                if (null == a)
                    throw new Error("UI element not found");
                i.set(this, it, a, "f"),
                i.set(this, st, document.createElement("div"), "f"),
                i.get(this, st, "f").className = "user-export-ui",
                i.get(this, it, "f").appendChild(i.get(this, st, "f"));
                const l = document.createElement("div");
                l.className = "background",
                i.get(this, st, "f").appendChild(l);
                const c = document.createElement("div");
                c.className = "container",
                i.get(this, st, "f").appendChild(c);
                const r = document.createElement("textarea");
                r.value = e,
                r.readOnly = null == o,
                r.placeholder = "Paste user token here...",
                c.appendChild(r);
                const h = document.createElement("div");
                h.className = "bar",
                c.appendChild(h);
                const d = document.createElement("button");
                if (d.className = "button",
                d.innerHTML = '<img class="button-icon" src="images/back.svg"> ',
                d.append(document.createTextNode(n.get("Back"))),
                d.addEventListener("click", ( () => {
                    t.playUIClick(),
                    s()
                }
                )),
                h.appendChild(d),
                null != o) {
                    const e = document.createElement("button");
                    e.className = "button right",
                    e.innerHTML = '<img class="button-icon" src="images/import.svg"> ',
                    e.append(document.createTextNode(n.get("Import"))),
                    e.addEventListener("click", ( () => {
                        t.playUIClick(),
                        o(r.value)
                    }
                    )),
                    h.appendChild(e)
                } else {
                    const e = new at.A(t,n,( () => r.value));
                    e.element.classList.add("right"),
                    h.appendChild(e.element)
                }
                window.addEventListener("keydown", i.set(this, ot, (t => {
                    "Escape" == t.code && (s(),
                    t.preventDefault())
                }
                ), "f"))
            }
            dispose() {
                i.get(this, it, "f").removeChild(i.get(this, st, "f")),
                window.removeEventListener("keydown", i.get(this, ot, "f"))
            }
        }
        ;
        var ct = e(35)
          , rt = {};
        rt.styleTagTransform = b(),
        rt.setAttributes = u(),
        rt.insert = f().bind(null, "head"),
        rt.domAPI = d(),
        rt.insertStyleElement = v();
        r()(ct.A, rt);
        ct.A && ct.A.locals && ct.A.locals;
        var ht, dt, gt, ft, pt, ut, mt, vt, wt, bt, xt = e(1055), kt = e(832);
        dt = new WeakMap,
        gt = new WeakMap,
        ft = new WeakMap,
        pt = new WeakMap,
        ut = new WeakMap,
        mt = new WeakMap,
        vt = new WeakMap,
        wt = new WeakMap,
        ht = new WeakSet,
        bt = function(t, n, e) {
            const s = i.get(this, pt, "f").getUserProfile(n)
              , o = document.createElement("div");
            o.className = "slot";
            const a = document.createElement("button");
            if (a.className = "button main",
            n == i.get(this, pt, "f").profileSlot && a.classList.add("selected"),
            a.addEventListener("click", ( () => {
                i.get(this, ft, "f").playUIClick();
                for (const t of i.get(this, mt, "f"))
                    t.classList.remove("selected");
                a.classList.add("selected"),
                e(n)
            }
            )),
            o.appendChild(a),
            i.get(this, mt, "f").push(a),
            null != s) {
                const t = document.createElement("div");
                t.className = "image-container",
                a.appendChild(t);
                const n = document.createElement("img");
                n.className = "placeholder show",
                n.src = "images/car_thumbnail_placeholder.png",
                t.appendChild(n);
                const e = document.createElement("img");
                kt.F(s.carStyle, i.get(this, wt, "f")).then((t => {
                    e.src = t,
                    n.classList.remove("show"),
                    e.classList.add("show")
                }
                )),
                t.appendChild(e);
                const o = document.createElement("div");
                o.className = "name-container",
                a.appendChild(o);
                const l = (0,
                L.O)()
                  , c = null == s.countryCode ? null : l.find((t => t.code == s.countryCode));
                if (null != c) {
                    const t = document.createElement("img");
                    t.className = "country-flag",
                    t.src = "images/countries/" + c.code + ".svg",
                    t.draggable = !1,
                    t.title = c.name,
                    o.appendChild(t)
                }
                const r = document.createElement("span");
                r.className = "name",
                r.textContent = s.nickname,
                o.appendChild(r)
            } else {
                const t = document.createElement("div");
                t.className = "image-container",
                a.appendChild(t);
                const n = document.createElement("img");
                n.className = "show",
                n.src = "images/car_thumbnail_placeholder.png",
                t.appendChild(n);
                const e = document.createElement("div");
                e.className = "name-container",
                a.appendChild(e);
                const s = document.createElement("span");
                s.className = "name empty",
                s.textContent = i.get(this, gt, "f").get("Empty"),
                e.appendChild(s)
            }
            t.appendChild(o)
        }
        ;
        const Gt = class {
            constructor(t, n, e, s, o, a) {
                ht.add(this),
                dt.set(this, void 0),
                gt.set(this, void 0),
                ft.set(this, void 0),
                pt.set(this, void 0),
                ut.set(this, void 0),
                mt.set(this, []),
                vt.set(this, void 0),
                wt.set(this, new xt.A);
                const l = document.getElementById("ui");
                if (null == l)
                    throw new Error("UI element not found");
                i.set(this, dt, l, "f"),
                i.set(this, gt, t, "f"),
                i.set(this, ft, n, "f"),
                i.set(this, pt, e, "f"),
                i.set(this, ut, document.createElement("div"), "f"),
                i.get(this, ut, "f").className = "profile-selection-ui",
                i.get(this, dt, "f").appendChild(i.get(this, ut, "f"));
                const c = document.createElement("div");
                c.className = "background",
                i.get(this, ut, "f").appendChild(c);
                const r = document.createElement("div");
                r.className = "container",
                i.get(this, ut, "f").appendChild(r);
                const h = document.createElement("div");
                h.className = "top-bar",
                r.appendChild(h);
                const d = document.createElement("h2");
                d.textContent = t.get("Profiles"),
                h.appendChild(d);
                for (let t = 0; t < E.A.maxNumberOfProfiles; t++)
                    i.get(this, ht, "m", bt).call(this, r, t, a);
                const g = document.createElement("div");
                g.className = "bottom-bar",
                r.appendChild(g);
                const f = document.createElement("button");
                f.className = "button",
                f.innerHTML = '<img class="button-icon" src="images/cancel.svg"> ',
                f.append(document.createTextNode(t.get("Close"))),
                f.addEventListener("click", ( () => {
                    n.playUIClick(),
                    s()
                }
                )),
                g.appendChild(f);
                const __nswsCurrentNickname = e.getCurrentUserProfile()?.nickname;
                const __nswsIsBanned = typeof window.__nswsIsNicknameBanned === "function" && window.__nswsIsNicknameBanned(__nswsCurrentNickname);
                if (!__nswsIsBanned) {
                    const p = document.createElement("button");
                    p.className = "button right",
                    p.innerHTML = '<img class="button-icon" src="images/import.svg"> ',
                    p.append(document.createTextNode(t.get("Import"))),
                    p.addEventListener("click", ( () => {
                        n.playUIClick(),
                        o()
                    }
                    )),
                    g.appendChild(p)
                }
                window.addEventListener("keydown", i.set(this, vt, (t => {
                    "Escape" == t.code && (s(),
                    t.preventDefault())
                }
                ), "f"))
            }
            dispose() {
                i.get(this, wt, "f").cancel(),
                i.get(this, dt, "f").removeChild(i.get(this, ut, "f")),
                window.removeEventListener("keydown", i.get(this, vt, "f"))
            }
        }
        ;
        var yt = e(4975)
          , Ct = {};
        Ct.styleTagTransform = b(),
        Ct.setAttributes = u(),
        Ct.insert = f().bind(null, "head"),
        Ct.domAPI = d(),
        Ct.insertStyleElement = v();
        r()(yt.A, Ct);
        yt.A && yt.A.locals && yt.A.locals;
        var Et = e(4191)
          , Mt = {};
        Mt.styleTagTransform = b(),
        Mt.setAttributes = u(),
        Mt.insert = f().bind(null, "head"),
        Mt.domAPI = d(),
        Mt.insertStyleElement = v();
        r()(Et.A, Mt);
        Et.A && Et.A.locals && Et.A.locals;
        var Nt, Lt, At, Wt, St, Tt, zt, Pt, It, Ut, Ht, Ot, Dt, Rt, Bt, Ft, qt, Vt, Xt;
        Lt = new WeakMap,
        At = new WeakMap,
        Wt = new WeakMap,
        St = new WeakMap,
        Tt = new WeakMap,
        zt = new WeakMap,
        Pt = new WeakMap,
        It = new WeakMap,
        Ut = new WeakMap,
        Ht = new WeakMap,
        Ot = new WeakMap,
        Dt = new WeakMap,
        Rt = new WeakMap,
        Bt = new WeakMap,
        Ft = new WeakMap,
        qt = new WeakMap,
        Nt = new WeakSet,
        Vt = function() {
            i.get(this, It, "f").style.left = "calc(" + (100 * i.get(this, Dt, "f") / 360).toString() + "% - 1px)",
            i.get(this, St, "f").style.backgroundImage = "linear-gradient(transparent, #000), linear-gradient(to right, transparent, hsla(" + i.get(this, Dt, "f").toString() + ", 100%, 50%, 1))"
        }
        ,
        Xt = function() {
            i.get(this, Tt, "f").style.left = "calc(" + i.get(this, Ot, "f").toString() + "% - 6px)",
            i.get(this, Tt, "f").style.top = "calc(" + (100 - i.get(this, Ht, "f")).toString() + "% - 6px)"
        }
        ;
        const Qt = class {
            constructor(t, n) {
                Nt.add(this),
                Lt.set(this, void 0),
                At.set(this, void 0),
                Wt.set(this, void 0),
                St.set(this, void 0),
                Tt.set(this, void 0),
                zt.set(this, !1),
                Pt.set(this, void 0),
                It.set(this, void 0),
                Ut.set(this, !1),
                Ht.set(this, 0),
                Ot.set(this, 0),
                Dt.set(this, 0),
                Rt.set(this, void 0),
                Bt.set(this, void 0),
                Ft.set(this, void 0),
                qt.set(this, void 0),
                i.set(this, Lt, t, "f"),
                i.set(this, At, n, "f"),
                i.set(this, Wt, document.createElement("div"), "f"),
                i.get(this, Wt, "f").className = "color-picker-ui",
                i.set(this, St, document.createElement("div"), "f"),
                i.get(this, St, "f").className = "value-saturation-picker",
                i.get(this, Wt, "f").appendChild(i.get(this, St, "f")),
                i.set(this, Tt, document.createElement("div"), "f"),
                i.get(this, Tt, "f").className = "marker",
                i.get(this, St, "f").appendChild(i.get(this, Tt, "f")),
                i.set(this, Pt, document.createElement("div"), "f"),
                i.get(this, Pt, "f").className = "hue-picker",
                i.get(this, Wt, "f").appendChild(i.get(this, Pt, "f")),
                i.set(this, It, document.createElement("div"), "f"),
                i.get(this, It, "f").className = "marker",
                i.get(this, Pt, "f").appendChild(i.get(this, It, "f")),
                i.get(this, Lt, "f").appendChild(i.get(this, Wt, "f"));
                i.set(this, Rt, (t => {
                    let e = null;
                    if (t instanceof MouseEvent ? i.get(this, zt, "f") && (e = t) : t instanceof TouchEvent && t.targetTouches.length > 0 && (e = t.targetTouches[t.targetTouches.length - 1]),
                    null != e) {
                        const t = i.get(this, St, "f").getBoundingClientRect()
                          , s = Math.max(0, Math.min(1, (e.clientX - t.left) / t.width))
                          , o = Math.max(0, Math.min(1, (e.clientY - t.top) / t.height));
                        i.set(this, Ot, 100 * s, "f"),
                        i.set(this, Ht, 100 * (1 - o), "f"),
                        i.get(this, Nt, "m", Xt).call(this),
                        n(this.color)
                    }
                }
                ), "f"),
                i.set(this, Bt, (t => {
                    0 == t.button && i.set(this, zt, !1, "f")
                }
                ), "f"),
                i.get(this, St, "f").addEventListener("mousedown", (t => {
                    0 == t.button && i.set(this, zt, !0, "f"),
                    i.get(this, Rt, "f").call(this, t)
                }
                )),
                window.addEventListener("mouseup", i.get(this, Bt, "f")),
                window.addEventListener("mousemove", i.get(this, Rt, "f")),
                i.get(this, St, "f").addEventListener("touchstart", i.get(this, Rt, "f")),
                i.get(this, St, "f").addEventListener("touchmove", i.get(this, Rt, "f")),
                i.set(this, Ft, (t => {
                    let e = null;
                    if (t instanceof MouseEvent ? i.get(this, Ut, "f") && (e = t) : t instanceof TouchEvent && t.targetTouches.length > 0 && (e = t.targetTouches[t.targetTouches.length - 1]),
                    null != e) {
                        const t = i.get(this, Pt, "f").getBoundingClientRect()
                          , s = Math.max(0, Math.min(1, (e.clientX - t.left) / t.width));
                        i.set(this, Dt, 360 * s, "f"),
                        i.get(this, Nt, "m", Vt).call(this),
                        n(this.color)
                    }
                }
                ), "f"),
                i.set(this, qt, (t => {
                    0 == t.button && i.set(this, Ut, !1, "f")
                }
                ), "f"),
                i.get(this, Pt, "f").addEventListener("mousedown", (t => {
                    0 == t.button && i.set(this, Ut, !0, "f"),
                    i.get(this, Ft, "f").call(this, t)
                }
                )),
                window.addEventListener("mouseup", i.get(this, qt, "f")),
                window.addEventListener("mousemove", i.get(this, Ft, "f")),
                i.get(this, Pt, "f").addEventListener("touchstart", i.get(this, Ft, "f")),
                i.get(this, Pt, "f").addEventListener("touchmove", i.get(this, Ft, "f")),
                i.get(this, Nt, "m", Vt).call(this),
                i.get(this, Nt, "m", Xt).call(this)
            }
            dispose() {
                window.removeEventListener("mouseup", i.get(this, Bt, "f")),
                window.removeEventListener("mousemove", i.get(this, Rt, "f")),
                window.removeEventListener("mouseup", i.get(this, qt, "f")),
                window.removeEventListener("mousemove", i.get(this, Ft, "f"))
            }
            get color() {
                const t = i.get(this, Ot, "f") / 100
                  , n = i.get(this, Ht, "f") / 100
                  , e = n - n * t / 2
                  , o = Math.min(e, 1 - e)
                  , a = 0 != o ? (n - e) / o : 0;
                return new THREE.Color("hsl(" + i.get(this, Dt, "f").toString() + "," + (100 * a).toString() + "%," + (100 * e).toString() + "%)")
            }
            set color(t) {
                const {h: n, s: e, l: o} = t.getHSL({
                    h: 0,
                    s: 0,
                    l: 0
                }, THREE.SRGBColorSpace)
                  , a = o + e * Math.min(o, 1 - o)
                  , l = 0 == a ? 0 : 2 * (1 - o / a);
                i.set(this, Dt, 360 * n, "f"),
                i.set(this, Ot, 100 * l, "f"),
                i.set(this, Ht, 100 * a, "f"),
                i.get(this, Nt, "m", Vt).call(this),
                i.get(this, Nt, "m", Xt).call(this),
                i.get(this, At, "f").call(this, this.color)
            }
        }
        ;
        var Yt, _t, jt, Zt, Jt, Kt, $t, tn, nn, en, sn, on, an, ln, cn, rn, hn, dn, gn, fn, pn, un, mn, vn, wn, bn, bodyIdx, bodyPanel, bodyButtons, bodyUpdate, bodyScroll, xn = e(5387);
        class kn {
            constructor(t, n, e, o, a, l, c) {
                Yt.add(this),
                jt.set(this, void 0),
                Zt.set(this, void 0),
                Jt.set(this, void 0),
                Kt.set(this, y.A.defaultPattern),
                $t.set(this, y.A.defaultRims),
                tn.set(this, y.A.defaultExhaust),
                bodyIdx.set(this, y.A.defaultBody),
                nn.set(this, void 0),
                en.set(this, new Map),
                sn.set(this, void 0),
                on.set(this, new Map),
                an.set(this, void 0),
                ln.set(this, new Map),
                bodyPanel.set(this, void 0),
                bodyButtons.set(this, new Map),
                cn.set(this, []),
                rn.set(this, void 0),
                hn.set(this, new xt.A),
                i.set(this, jt, o, "f"),
                i.set(this, Zt, a, "f"),
                i.set(this, rn, l, "f"),
                i.set(this, Jt, document.createElement("div"), "f"),
                i.get(this, Jt, "f").className = "customization-panel-ui",
                i.get(this, Zt, "f").appendChild(i.get(this, Jt, "f"));
                const r = document.createElement("div");
                r.className = "tab-bar",
                i.get(this, Jt, "f").appendChild(r);
                const h = document.createElement("div");
                h.className = "panel color-panel",
                i.get(this, Jt, "f").appendChild(h);
                const d = document.createElement("div");
                d.className = "left",
                h.appendChild(d);
                const g = document.createElement("div");
                g.className = "right",
                h.appendChild(g),
                i.get(this, Yt, "m", bn).call(this, n.get("Primary"), d),
                i.get(this, Yt, "m", bn).call(this, n.get("Secondary"), d),
                i.get(this, Yt, "m", bn).call(this, n.get("Frame"), g),
                i.get(this, Yt, "m", bn).call(this, n.get("Rims"), g),
                i.set(this, nn, document.createElement("div"), "f"),
                i.get(this, nn, "f").className = "panel options-panel hidden",
                i.get(this, Jt, "f").appendChild(i.get(this, nn, "f"));
                for (let s = 0; s < y.A.patterns.length; s++) {
                    if (!y.A.isValidPattern(s))
                        throw new Error("Invalid car style pattern");
                    let o = null;
                    const a = document.createElement("button");
                    a.addEventListener("click", ( () => {
                        t.playUIClick(),
                        i.get(this, jt, "f").isPatternUnlocked(s) ? (i.set(this, Kt, s, "f"),
                        i.get(this, Yt, "m", gn).call(this),
                        i.get(this, Yt, "m", dn).call(this)) : e.showConfirm(n.get("Would you like to watch an ad to unlock this item?"), n.get("Cancel"), n.get("Watch"), null, ( () => {
                            xn.$L("unlock-pattern").then((t => {
                                t.success ? (i.set(this, Kt, s, "f"),
                                i.get(this, Yt, "m", gn).call(this),
                                i.get(this, Yt, "m", dn).call(this),
                                null != o && (a.removeChild(o),
                                o = null),
                                i.get(this, jt, "f").unlockPattern(s)) : e.show(n.get("Ad not completed"), n.get("Ok"), null)
                            }
                            ))
                        }
                        ))
                    }
                    )),
                    s == i.get(this, Kt, "f") && a.classList.add("selected"),
                    i.get(this, nn, "f").appendChild(a);
                    const l = new y.A(s,y.A.defaultRims,y.A.defaultExhaust,2236962,9868950,1250067,6710886)
                      , c = document.createElement("img");
                    c.className = "loading",
                    kt.F(l, i.get(this, hn, "f")).then((t => {
                        c.src = t,
                        c.classList.remove("loading")
                    }
                    )),
                    a.appendChild(c),
                    i.get(this, jt, "f").isPatternUnlocked(s) || (o = document.createElement("img"),
                    o.className = "video-icon",
                    o.src = "images/video.svg",
                    a.appendChild(o)),
                    i.get(this, en, "f").set(s, a)
                }
                i.set(this, sn, document.createElement("div"), "f"),
                i.get(this, sn, "f").className = "panel options-panel hidden",
                i.get(this, Jt, "f").appendChild(i.get(this, sn, "f"));
                for (let o = 0; o < y.A.rims.length; o++) {
                    if (!y.A.isValidRims(o))
                        throw new Error("Invalid car style rims");
                    let a = null;
                    const l = document.createElement("button");
                    l.addEventListener("click", ( () => {
                        t.playUIClick(),
                        i.get(this, jt, "f").isRimsUnlocked(o) ? (i.set(this, $t, o, "f"),
                        i.get(this, Yt, "m", fn).call(this),
                        i.get(this, Yt, "m", dn).call(this)) : e.showConfirm(n.get("Would you like to watch an ad to unlock this item?"), n.get("Cancel"), n.get("Watch"), null, ( () => {
                            xn.$L("unlock-rims").then((t => {
                                t.success ? (i.set(this, $t, o, "f"),
                                i.get(this, Yt, "m", fn).call(this),
                                i.get(this, Yt, "m", dn).call(this),
                                null != a && (l.removeChild(a),
                                a = null),
                                i.get(this, jt, "f").unlockRims(o)) : e.show(n.get("Ad not completed"), n.get("Ok"), null)
                            }
                            )).catch((t => {
                                console.error(t)
                            }
                            ))
                        }
                        ))
                    }
                    )),
                    o == i.get(this, $t, "f") && l.classList.add("selected"),
                    i.get(this, sn, "f").appendChild(l);
                    const c = new y.A(y.A.defaultPattern,o,y.A.defaultExhaust,9868950,9868950,1250067,6710886)
                      , r = document.createElement("img");
                    r.className = "loading",
                    kt.F(c, i.get(this, hn, "f"), {
                        position: new THREE.Vector3(1e3,.19190498995780947,1.3478),
                        look: new THREE.Vector3(0,.19190498995780947,1.3478),
                        zoom: 2.5
                    }).then((t => {
                        r.src = t,
                        r.classList.remove("loading")
                    }
                    )),
                    l.appendChild(r),
                    i.get(this, jt, "f").isRimsUnlocked(o) || (a = document.createElement("img"),
                    a.className = "video-icon",
                    a.src = "images/video.svg",
                    l.appendChild(a)),
                    i.get(this, on, "f").set(o, l)
                }
                i.set(this, an, document.createElement("div"), "f"),
                i.get(this, an, "f").className = "panel options-panel hidden",
                i.get(this, Jt, "f").appendChild(i.get(this, an, "f"));
                for (let o = 0; o < y.A.exhausts.length; o++) {
                    if (!y.A.isValidExhaust(o))
                        throw new Error("Invalid car style exhaust");
                    let a = null;
                    const l = document.createElement("button");
                    l.addEventListener("click", ( () => {
                        t.playUIClick(),
                        i.get(this, jt, "f").isExhaustUnlocked(o) ? (i.set(this, tn, o, "f"),
                        i.get(this, Yt, "m", pn).call(this),
                        i.get(this, Yt, "m", dn).call(this)) : e.showConfirm(n.get("Would you like to watch an ad to unlock this item?"), n.get("Cancel"), n.get("Watch"), null, ( () => {
                            xn.$L("unlock-exhaust").then((t => {
                                t.success ? (i.set(this, tn, o, "f"),
                                i.get(this, Yt, "m", pn).call(this),
                                i.get(this, Yt, "m", dn).call(this),
                                null != a && (l.removeChild(a),
                                a = null),
                                i.get(this, jt, "f").unlockExhaust(o)) : e.show(n.get("Ad not completed"), n.get("Ok"), null)
                            }
                            )).catch((t => {
                                console.error(t)
                            }
                            ))
                        }
                        ))
                    }
                    )),
                    o == i.get(this, tn, "f") && l.classList.add("selected"),
                    i.get(this, an, "f").appendChild(l);
                    const c = new y.A(y.A.defaultPattern,y.A.defaultRims,o,9868950,9868950,1250067,6710886)
                      , r = document.createElement("img");
                    r.className = "loading",
                    kt.F(c, i.get(this, hn, "f"), {
                        position: new THREE.Vector3(1100,-800.5,-1001.7),
                        look: new THREE.Vector3(0,.5,-1.7),
                        zoom: 2
                    }).then((t => {
                        r.src = t,
                        r.classList.remove("loading")
                    }
                    )),
                    l.appendChild(r),
                    i.get(this, jt, "f").isExhaustUnlocked(o) || (a = document.createElement("img"),
                    a.className = "video-icon",
                    a.src = "images/video.svg",
                    l.appendChild(a)),
                    i.get(this, ln, "f").set(o, l)
                }
                i.set(this, bodyPanel, document.createElement("div"), "f"),
                i.get(this, bodyPanel, "f").className = "panel options-panel hidden",
                i.get(this, Jt, "f").appendChild(i.get(this, bodyPanel, "f"));
                for (let o = 0; o < y.A.bodies.length; o++) {
                    if (!y.A.isValidBody(o))
                        throw new Error("Invalid car style body");
                    const l = document.createElement("button");
                    l.title = y.A.bodies[o].name,
                    l.addEventListener("click", ( () => {
                        t.playUIClick(),
                        i.set(this, bodyIdx, o, "f"),
                        i.get(this, Yt, "m", bodyUpdate).call(this),
                        i.get(this, Yt, "m", dn).call(this)
                    }
                    )),
                    o == i.get(this, bodyIdx, "f") && l.classList.add("selected"),
                    i.get(this, bodyPanel, "f").appendChild(l);
                    const c = new y.A(y.A.defaultPattern,y.A.defaultRims,y.A.defaultExhaust,9868950,9868950,1250067,6710886,o)
                      , r = document.createElement("img");
                    r.className = "loading",
                    kt.F(c, i.get(this, hn, "f"), {
                        position: new THREE.Vector3(1000.1,1000.3,1e3),
                        look: new THREE.Vector3(.1,.3,0),
                        zoom: .4
                    }).then((t => {
                        r.src = t,
                        r.classList.remove("loading")
                    }
                    )),
                    l.appendChild(r),
                    i.get(this, bodyButtons, "f").set(o, l)
                }
                const f = [{
                    title: n.get("Paint"),
                    icon: "images/paint.svg",
                    panel: h
                }, {
                    title: n.get("Pattern"),
                    icon: "images/pattern.svg",
                    panel: i.get(this, nn, "f")
                }, {
                    title: n.get("Rims"),
                    icon: "images/rims.svg",
                    panel: i.get(this, sn, "f")
                }, {
                    title: n.get("Exhaust"),
                    icon: "images/exhaust.svg",
                    panel: i.get(this, an, "f")
                }, {
                    title: n.get("Car"),
                    icon: "images/car_body.svg",
                    panel: i.get(this, bodyPanel, "f")
                }];
                let p = f[0];
                const u = [];
                for (const n of f) {
                    const e = document.createElement("button");
                    e.className = "button",
                    e.textContent = n.title,
                    e.addEventListener("click", ( () => {
                        t.playUIClick();
                        for (const t of u)
                            t.classList.remove("selected");
                        h.classList.add("hidden"),
                        i.get(this, nn, "f").classList.add("hidden"),
                        i.get(this, sn, "f").classList.add("hidden"),
                        i.get(this, an, "f").classList.add("hidden"),
                        i.get(this, bodyPanel, "f").classList.add("hidden"),
                        e.classList.add("selected"),
                        n.panel.classList.remove("hidden"),
                        p != n && (n.panel == h ? c(new THREE.Vector3(0,2,6)) : n.panel == i.get(this, nn, "f") ? (i.get(this, Yt, "m", un).call(this),
                        c(new THREE.Vector3(0,2,6))) : n.panel == i.get(this, sn, "f") ? (i.get(this, Yt, "m", mn).call(this),
                        c(new THREE.Vector3(-.5155052947032,.74948865866975,3.8370986018837385))) : n.panel == i.get(this, an, "f") ? (i.get(this, Yt, "m", vn).call(this),
                        c(new THREE.Vector3(2.874291197536667,.9837316369014955,-.7283975369068978))) : n.panel == i.get(this, bodyPanel, "f") && (i.get(this, Yt, "m", bodyScroll).call(this),
                        c(new THREE.Vector3(3.5,1.8,5.2)))),
                        p = n
                    }
                    )),
                    0 == u.length && e.classList.add("selected"),
                    e.appendChild(document.createTextNode(" "));
                    const o = document.createElement("img");
                    o.className = "button-icon",
                    o.src = n.icon,
                    e.appendChild(o),
                    r.appendChild(e),
                    u.push(e)
                }
            }
            dispose() {
                i.get(this, hn, "f").cancel(),
                i.get(this, Zt, "f").removeChild(i.get(this, Jt, "f"));
                for (const t of i.get(this, cn, "f"))
                    t.dispose()
            }
            setCarStyle(t) {
                i.set(this, Kt, t.pattern, "f"),
                i.set(this, $t, t.rims, "f"),
                i.set(this, tn, t.exhaust, "f"),
                i.set(this, bodyIdx, y.A.isValidBody(t.body) ? t.body : y.A.defaultBody, "f"),
                i.get(this, jt, "f").isPatternUnlocked(i.get(this, Kt, "f")) || i.get(this, jt, "f").unlockPattern(i.get(this, Kt, "f")),
                i.get(this, jt, "f").isRimsUnlocked(i.get(this, $t, "f")) || i.get(this, jt, "f").unlockRims(i.get(this, $t, "f")),
                i.get(this, jt, "f").isExhaustUnlocked(i.get(this, tn, "f")) || i.get(this, jt, "f").unlockExhaust(i.get(this, tn, "f")),
                i.get(this, Yt, "m", gn).call(this),
                i.get(this, Yt, "m", fn).call(this),
                i.get(this, Yt, "m", pn).call(this),
                i.get(this, Yt, "m", un).call(this),
                i.get(this, Yt, "m", mn).call(this),
                i.get(this, Yt, "m", vn).call(this),
                i.get(this, Yt, "m", bodyUpdate).call(this),
                i.get(this, Yt, "m", bodyScroll).call(this),
                i.get(this, cn, "f")[0].color = t.primaryColor,
                i.get(this, cn, "f")[1].color = t.secondaryColor,
                i.get(this, cn, "f")[2].color = t.frameColor,
                i.get(this, cn, "f")[3].color = t.rimsColor
            }
        }
        _t = kn,
        jt = new WeakMap,
        Zt = new WeakMap,
        Jt = new WeakMap,
        Kt = new WeakMap,
        $t = new WeakMap,
        tn = new WeakMap,
        nn = new WeakMap,
        en = new WeakMap,
        sn = new WeakMap,
        on = new WeakMap,
        an = new WeakMap,
        ln = new WeakMap,
        cn = new WeakMap,
        rn = new WeakMap,
        hn = new WeakMap,
        bodyIdx = new WeakMap,
        bodyPanel = new WeakMap,
        bodyButtons = new WeakMap,
        Yt = new WeakSet,
        dn = function() {
            const t = new y.A(i.get(this, Kt, "f"),i.get(this, $t, "f"),i.get(this, tn, "f"),i.get(this, cn, "f")[0].color.getHex(),i.get(this, cn, "f")[1].color.getHex(),i.get(this, cn, "f")[2].color.getHex(),i.get(this, cn, "f")[3].color.getHex(),i.get(this, bodyIdx, "f"));
            i.get(this, rn, "f").call(this, t)
        }
        ,
        gn = function() {
            for (const [t,n] of i.get(this, en, "f"))
                t == i.get(this, Kt, "f") ? n.classList.add("selected") : n.classList.remove("selected")
        }
        ,
        fn = function() {
            for (const [t,n] of i.get(this, on, "f"))
                t == i.get(this, $t, "f") ? n.classList.add("selected") : n.classList.remove("selected")
        }
        ,
        pn = function() {
            for (const [t,n] of i.get(this, ln, "f"))
                t == i.get(this, tn, "f") ? n.classList.add("selected") : n.classList.remove("selected")
        }
        ,
        un = function() {
            const t = i.get(this, en, "f").get(i.get(this, Kt, "f"));
            null != t && i.get(_t, _t, "m", wn).call(_t, i.get(this, nn, "f"), t)
        }
        ,
        mn = function() {
            const t = i.get(this, on, "f").get(i.get(this, $t, "f"));
            null != t && i.get(_t, _t, "m", wn).call(_t, i.get(this, sn, "f"), t)
        }
        ,
        vn = function() {
            const t = i.get(this, ln, "f").get(i.get(this, tn, "f"));
            null != t && i.get(_t, _t, "m", wn).call(_t, i.get(this, an, "f"), t)
        }
        ,
        bodyUpdate = function() {
            for (const [t,n] of i.get(this, bodyButtons, "f"))
                t == i.get(this, bodyIdx, "f") ? n.classList.add("selected") : n.classList.remove("selected")
        }
        ,
        bodyScroll = function() {
            const t = i.get(this, bodyButtons, "f").get(i.get(this, bodyIdx, "f"));
            null != t && i.get(_t, _t, "m", wn).call(_t, i.get(this, bodyPanel, "f"), t)
        }
        ,
        wn = function(t, n) {
            if (t.scrollTo) {
                const e = t.clientHeight
                  , i = n.offsetTop - t.offsetTop - e / 2 + n.offsetHeight / 2;
                t.scrollTo({
                    top: i,
                    behavior: "instant"
                })
            } else
                n.scrollIntoView({
                    behavior: "instant",
                    block: "nearest",
                    inline: "start"
                })
        }
        ,
        bn = function(t, n) {
            const e = document.createElement("div");
            e.className = "color",
            n.appendChild(e);
            const o = document.createElement("h2");
            o.textContent = t,
            e.appendChild(o);
            const a = document.createElement("div");
            a.className = "input-container",
            e.appendChild(a);
            const l = document.createElement("input");
            l.type = "text",
            l.addEventListener("input", ( () => {
                let t = l.value;
                /^[0-9A-F]{6}$/i.test(t) && (t = "#" + t),
                r.color = new THREE.Color(t),
                i.get(this, Yt, "m", dn).call(this)
            }
            )),
            l.addEventListener("blur", ( () => {
                l.value = "#" + r.color.getHexString()
            }
            )),
            a.appendChild(l);
            const c = document.createElement("div");
            c.className = "color-preview",
            a.appendChild(c);
            const r = new Qt(e,(t => {
                document.activeElement != l && (l.value = "#" + t.getHexString()),
                c.style.backgroundColor = "#" + t.getHexString(),
                i.get(this, Yt, "m", dn).call(this)
            }
            ));
            l.value = "#" + r.color.getHexString(),
            i.get(this, cn, "f").push(r)
        }
        ;
        const Gn = kn;
        var yn, Cn, En, Mn, Nn, Ln;
        Cn = new WeakMap,
        En = new WeakMap,
        Mn = new WeakMap,
        Nn = new WeakMap,
        yn = new WeakSet,
        Ln = function() {
            i.get(this, Cn, "f").saveUnlockedCarStyles(Array.from(i.get(this, En, "f")), Array.from(i.get(this, Mn, "f")), Array.from(i.get(this, Nn, "f")))
        }
        ;
        const An = class {
            constructor(t) {
                if (yn.add(this),
                Cn.set(this, void 0),
                En.set(this, new Set),
                Mn.set(this, new Set),
                Nn.set(this, new Set),
                i.set(this, Cn, t, "f"),
                xn.XZ()) {
                    const {patterns: t, rims: n, exhausts: e} = i.get(this, Cn, "f").loadUnlockedCarStyles();
                    for (const n of t)
                        i.get(this, En, "f").add(n);
                    for (const t of n)
                        i.get(this, Mn, "f").add(t);
                    for (const t of e)
                        i.get(this, Nn, "f").add(t);
                    for (let t = 0; t < 4; t++) {
                        if (!y.A.isValidPattern(t))
                            throw new Error("Invalid car style pattern");
                        i.get(this, En, "f").add(t)
                    }
                    for (let t = 0; t < 3; t++) {
                        if (!y.A.isValidRims(t))
                            throw new Error("Invalid car style rims");
                        i.get(this, Mn, "f").add(t)
                    }
                    for (let t = 0; t < 2; t++) {
                        if (!y.A.isValidExhaust(t))
                            throw new Error("Invalid car style exhaust");
                        i.get(this, Nn, "f").add(t)
                    }
                }
            }
            isPatternUnlocked(t) {
                return !xn.XZ() || i.get(this, En, "f").has(t)
            }
            unlockPattern(t) {
                this.isPatternUnlocked(t) || (i.get(this, En, "f").add(t),
                i.get(this, yn, "m", Ln).call(this))
            }
            isRimsUnlocked(t) {
                return !xn.XZ() || i.get(this, Mn, "f").has(t)
            }
            unlockRims(t) {
                this.isRimsUnlocked(t) || (i.get(this, Mn, "f").add(t),
                i.get(this, yn, "m", Ln).call(this))
            }
            isExhaustUnlocked(t) {
                return !xn.XZ() || i.get(this, Nn, "f").has(t)
            }
            unlockExhaust(t) {
                this.isExhaustUnlocked(t) || (i.get(this, Nn, "f").add(t),
                i.get(this, yn, "m", Ln).call(this))
            }
        }
        ;
        var Wn, Sn, Tn, zn, Pn, In, Un, Hn, On, Dn, Rn, Bn, Fn, qn, Vn, Xn, Qn, Yn, _n, jn, Zn, Jn, Kn, $n, te, ne, ee, ie, se, oe, ae, le, ce, re, he, de, ge, fe, pe;
        Sn = new WeakMap,
        Tn = new WeakMap,
        zn = new WeakMap,
        Pn = new WeakMap,
        In = new WeakMap,
        Un = new WeakMap,
        Hn = new WeakMap,
        On = new WeakMap,
        Dn = new WeakMap,
        Rn = new WeakMap,
        Bn = new WeakMap,
        Fn = new WeakMap,
        qn = new WeakMap,
        Vn = new WeakMap,
        Xn = new WeakMap,
        Qn = new WeakMap,
        Yn = new WeakMap,
        _n = new WeakMap,
        jn = new WeakMap,
        Zn = new WeakMap,
        Jn = new WeakMap,
        Kn = new WeakMap,
        $n = new WeakMap,
        te = new WeakMap,
        ne = new WeakMap,
        ee = new WeakMap,
        ie = new WeakMap,
        se = new WeakMap,
        oe = new WeakMap,
        Wn = new WeakSet,
        ae = function() {
            const t = y.A.default();
            i.get(this, $n, "f").setCarStyle(t),
            i.get(this, Sn, "f").setCarStyle(t),
            i.set(this, se, !0, "f")
        }
        ,
        le = function() {
            const t = y.A.patterns.map(( (t, n) => {
                if (!y.A.isValidPattern(n))
                    throw new Error("Invalid car style pattern");
                return n
            }
            )).filter((t => i.get(this, Vn, "f").isPatternUnlocked(t)))
              , n = y.A.rims.map(( (t, n) => {
                if (!y.A.isValidRims(n))
                    throw new Error("Invalid car style rims");
                return n
            }
            )).filter((t => i.get(this, Vn, "f").isRimsUnlocked(t)))
              , e = y.A.exhausts.map(( (t, n) => {
                if (!y.A.isValidExhaust(n))
                    throw new Error("Invalid car style exhaust");
                return n
            }
            )).filter((t => i.get(this, Vn, "f").isExhaustUnlocked(t)))
              , o = t[Math.floor(Math.random() * t.length)]
              , a = n[Math.floor(Math.random() * n.length)]
              , l = e[Math.floor(Math.random() * e.length)]
              , c = 360 * Math.random();
            let r, h;
            Math.random() < .9 ? (r = 100 * (1 - Math.pow(Math.random(), 2)),
            h = 100 * (.05 + .25 * (1 - Math.pow(Math.random(), 2)))) : (r = 0,
            h = 100 * Math.random());
            const d = new THREE.Color("hsl(" + c.toString() + "," + r.toString() + "%," + h.toString() + "%)").getHex();
            let g, f, p;
            g = Math.random() < .5 ? (c + 180) % 360 : Math.random() < .5 ? (c + 120) % 360 : (c - 120) % 360,
            Math.random() < .9 ? (f = r,
            p = 100 * (.05 + .25 * (1 - Math.pow(Math.random(), 2)))) : (f = 0,
            p = 100 * Math.random());
            const u = new THREE.Color("hsl(" + g.toString() + "," + f.toString() + "%," + p.toString() + "%)").getHex();
            let m, v;
            m = Math.random() < .5 ? 1250067 : Math.random() < .4 ? d : u,
            v = Math.random() < .5 ? 6710886 : m == d ? u : m == u || Math.random() < .4 ? d : u;
            const w = new y.A(o,a,l,d,u,m,v);
            i.get(this, $n, "f").setCarStyle(w),
            i.get(this, Sn, "f").setCarStyle(w),
            i.set(this, se, !0, "f")
        }
        ,
        ce = function() {
            for (let t = 0; t < i.get(this, Tn, "f").length; t++) {
                const n = i.get(this, Tn, "f")[t]
                  , e = i.get(this, Hn, "f").getUserProfile(t);
                if (null != e && t != i.get(this, te, "f"))
                    n.setCarStyle(e.carStyle),
                    n.setVisible(!0);
                else {
                    const p = Math.floor(Math.random() * y.A.patterns.length)
                      , r = Math.floor(Math.random() * y.A.rims.length)
                      , x = Math.floor(Math.random() * y.A.exhausts.length)
                      , h = 360 * Math.random();
                    let s, l;
                    Math.random() < .9 ? (s = 100 * (1 - Math.pow(Math.random(), 2)),
                    l = 100 * (.05 + .25 * (1 - Math.pow(Math.random(), 2)))) : (s = 0,
                    l = 100 * Math.random());
                    const pc = new THREE.Color("hsl(" + h.toString() + "," + s.toString() + "%," + l.toString() + "%)").getHex();
                    let h2, s2, l2;
                    h2 = Math.random() < .5 ? (h + 180) % 360 : Math.random() < .5 ? (h + 120) % 360 : (h - 120) % 360,
                    Math.random() < .9 ? (s2 = s,
                    l2 = 100 * (.05 + .25 * (1 - Math.pow(Math.random(), 2)))) : (s2 = 0,
                    l2 = 100 * Math.random());
                    const sc = new THREE.Color("hsl(" + h2.toString() + "," + s2.toString() + "%," + l2.toString() + "%)").getHex();
                    let fc, rc;
                    fc = Math.random() < .5 ? 1250067 : Math.random() < .4 ? pc : sc,
                    rc = Math.random() < .5 ? 6710886 : fc == pc ? sc : fc == sc || Math.random() < .4 ? pc : sc,
                    n.setCarStyle(new y.A(p,r,x,pc,sc,fc,rc)),
                    n.setVisible(!0)
                }
            }
        }
        ,
        re = function t(n, e, s, o) {
            const a = null != o;
            i.set(this, Bn, new tt(i.get(this, zn, "f"),i.get(this, In, "f"),e,s,i.get(this, ne, "f"),a,(e => {
                i.get(this, Bn, "f")?.dispose(),
                i.set(this, Bn, null, "f"),
                i.get(this, On, "f").showConfirm(i.get(this, zn, "f").get('Are you sure you would like to delete "{0}"?', [e.nickname]), i.get(this, zn, "f").get("Cancel"), i.get(this, zn, "f").get("Confirm"), ( () => {
                    i.get(this, Wn, "m", t).call(this, n, e.nickname, e.countryCode, o)
                }
                ), ( () => {
                    if (i.get(this, Hn, "f").deleteProfileSlot(n),
                    n == i.get(this, Hn, "f").profileSlot) {
                        i.get(this, Hn, "f").setProfileSlot(i.get(this, Hn, "f").firstOccupiedProfileSlot() ?? 0),
                        i.set(this, te, i.get(this, Hn, "f").profileSlot, "f"),
                        i.set(this, ne, i.get(this, Hn, "f").getCurrentUserProfile(), "f"),
                        i.set(this, ee, i.get(this, ne, "f").nickname, "f"),
                        i.set(this, ie, i.get(this, ne, "f").countryCode, "f"),
                        i.get(this, Zn, "f").textContent = i.get(this, ee, "f");
                        const t = (0,
                        L.O)()
                          , n = null == i.get(this, ie, "f") ? null : t.find((t => t.code == i.get(this, ie, "f")));
                        null != n ? (i.get(this, jn, "f").classList.add("loading"),
                        i.get(this, jn, "f").src = "images/countries/" + n.code + ".svg",
                        i.get(this, jn, "f").title = n.name,
                        i.get(this, jn, "f").classList.remove("hidden")) : i.get(this, jn, "f").classList.add("hidden"),
                        i.get(this, $n, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                        i.get(this, Sn, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                        i.set(this, se, !1, "f"),
                        i.get(this, Wn, "m", ce).call(this)
                    }
                    i.get(this, _n, "f").classList.remove("hidden")
                }
                ))
            }
            ),( (e, s) => {
                i.get(this, Bn, "f")?.dispose(),
                i.set(this, Bn, null, "f"),
                i.get(this, On, "f").showConfirm(i.get(this, zn, "f").get("Are you sure you want to display your private key?") + "\n\n" + i.get(this, zn, "f").get("DO NOT SHARE THIS KEY WITH ANYONE."), i.get(this, zn, "f").get("Cancel"), i.get(this, zn, "f").get("Confirm"), ( () => {
                    i.get(this, Wn, "m", t).call(this, n, e.nickname, e.countryCode, o)
                }
                ), ( () => {
                    i.set(this, Fn, new lt(i.get(this, In, "f"),i.get(this, zn, "f"),s,( () => {
                        i.get(this, Fn, "f")?.dispose(),
                        i.set(this, Fn, null, "f"),
                        i.get(this, Wn, "m", t).call(this, n, e.nickname, e.countryCode, o)
                    }
                    ),null), "f")
                }
                ))
            }
            ),(t => {
                if (i.get(this, Bn, "f")?.dispose(),
                i.set(this, Bn, null, "f"),
                null != t) {
                    if (t.nickname != i.get(this, ee, "f") && (i.set(this, ee, t.nickname, "f"),
                    i.get(this, Zn, "f").textContent = i.get(this, ee, "f"),
                    i.set(this, se, !0, "f")),
                    t.countryCode != i.get(this, ie, "f")) {
                        i.set(this, ie, t.countryCode, "f");
                        const n = (0,
                        L.O)()
                          , e = null == i.get(this, ie, "f") ? null : n.find((t => t.code == i.get(this, ie, "f")));
                        null != e ? (i.get(this, jn, "f").classList.add("loading"),
                        i.get(this, jn, "f").src = "images/countries/" + e.code + ".svg",
                        i.get(this, jn, "f").title = e.name,
                        i.get(this, jn, "f").classList.remove("hidden")) : i.get(this, jn, "f").classList.add("hidden"),
                        i.set(this, se, !0, "f")
                    }
                    a && i.get(this, Wn, "m", fe).call(this)
                }
                i.get(this, _n, "f").classList.remove("hidden")
            }
            )), "f")
        }
        ,
        he = function t(n, e) {
            i.set(this, Fn, new lt(i.get(this, In, "f"),i.get(this, zn, "f"),e,( () => {
                i.get(this, Fn, "f")?.dispose(),
                i.set(this, Fn, null, "f"),
                i.get(this, Wn, "m", de).call(this)
            }
            ),(e => {
                i.get(this, Fn, "f")?.dispose(),
                i.set(this, Fn, null, "f"),
                i.get(this, Hn, "f").hasDuplicateToken(e) ? i.get(this, On, "f").show(i.get(this, zn, "f").get("You cannot have duplicate user profiles"), i.get(this, zn, "f").get("Ok"), ( () => {
                    i.get(this, Wn, "m", t).call(this, n, e)
                }
                )) : i.get(this, Hn, "f").isValidToken(e) ? i.get(this, Un, "f").getUser(e).then((s => {
                    if (null != s)
                        if (i.get(this, Hn, "f").createProfile(n, e, s.nickname, s.countryCode, s.carStyle)) {
                            i.set(this, te, n, "f"),
                            i.get(this, Hn, "f").setProfileSlot(n),
                            i.set(this, ne, i.get(this, Hn, "f").getCurrentUserProfile(), "f"),
                            i.set(this, ee, i.get(this, ne, "f").nickname, "f"),
                            i.set(this, ie, i.get(this, ne, "f").countryCode, "f"),
                            i.get(this, Zn, "f").textContent = i.get(this, ee, "f");
                            const t = (0,
                            L.O)()
                              , e = null == i.get(this, ie, "f") ? null : t.find((t => t.code == i.get(this, ie, "f")));
                            null != e ? (i.get(this, jn, "f").classList.add("loading"),
                            i.get(this, jn, "f").src = "images/countries/" + e.code + ".svg",
                            i.get(this, jn, "f").title = e.name,
                            i.get(this, jn, "f").classList.remove("hidden")) : i.get(this, jn, "f").classList.add("hidden"),
                            i.get(this, $n, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                            i.get(this, Sn, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                            i.set(this, se, !1, "f"),
                            i.get(this, Wn, "m", ce).call(this),
                            i.get(this, _n, "f").classList.remove("hidden")
                        } else
                            i.get(this, On, "f").show(i.get(this, zn, "f").get("Failed to create user profile"), i.get(this, zn, "f").get("Ok"), ( () => {
                                i.get(this, Wn, "m", t).call(this, n, e)
                            }
                            ));
                    else
                        i.get(this, On, "f").show(i.get(this, zn, "f").get("This user profile does not exist on the server"), i.get(this, zn, "f").get("Ok"), ( () => {
                            i.get(this, Wn, "m", t).call(this, n, e)
                        }
                        ))
                }
                )).catch((s => {
                    console.error(s),
                    i.get(this, On, "f").show(i.get(this, zn, "f").get("Failed to download user profile from the server"), i.get(this, zn, "f").get("Ok"), ( () => {
                        i.get(this, Wn, "m", t).call(this, n, e)
                    }
                    ))
                }
                )) : i.get(this, On, "f").show(i.get(this, zn, "f").get("User token is invalid"), i.get(this, zn, "f").get("Ok"), ( () => {
                    i.get(this, Wn, "m", t).call(this, n, e)
                }
                ))
            }
            )), "f")
        }
        ,
        de = function t() {
            i.get(this, _n, "f").classList.add("hidden"),
            i.set(this, qn, new Gt(i.get(this, zn, "f"),i.get(this, In, "f"),i.get(this, Hn, "f"),( () => {
                i.get(this, qn, "f")?.dispose(),
                i.set(this, qn, null, "f"),
                i.get(this, _n, "f").classList.remove("hidden")
            }
            ),( () => {
                i.get(this, qn, "f")?.dispose(),
                i.set(this, qn, null, "f");
                const n = i.get(this, Hn, "f").firstFreeProfileSlot();
                if (null != n) {
                    i.get(this, Wn, "m", he).call(this, n, "");
                    return
                }
                const __nswsReplaceSlot = i.get(this, Hn, "f").firstOccupiedProfileSlot() ?? 0;
                i.get(this, On, "f").showConfirm(i.get(this, zn, "f").get("Importing a user token will replace your current profile.") + "\n\n" + i.get(this, zn, "f").get("Make sure you have exported your current private token first if you want to keep it."), i.get(this, zn, "f").get("Cancel"), i.get(this, zn, "f").get("Confirm"), ( () => {
                    i.get(this, Wn, "m", t).call(this)
                }
                ), ( () => {
                    i.get(this, Hn, "f").deleteProfileSlot(__nswsReplaceSlot),
                    i.get(this, Wn, "m", he).call(this, __nswsReplaceSlot, "")
                }
                ))
            }
            ),(t => {
                i.get(this, qn, "f")?.dispose(),
                i.set(this, qn, null, "f"),
                i.set(this, te, t, "f"),
                i.get(this, Hn, "f").setProfileSlot(t),
                i.set(this, ne, i.get(this, Hn, "f").getCurrentUserProfile(), "f"),
                i.set(this, ee, i.get(this, ne, "f").nickname, "f"),
                i.set(this, ie, i.get(this, ne, "f").countryCode, "f"),
                i.get(this, Zn, "f").textContent = i.get(this, ee, "f");
                const n = (0,
                L.O)()
                  , e = null == i.get(this, ie, "f") ? null : n.find((t => t.code == i.get(this, ie, "f")));
                null != e ? (i.get(this, jn, "f").classList.add("loading"),
                i.get(this, jn, "f").src = "images/countries/" + e.code + ".svg",
                i.get(this, jn, "f").title = e.name,
                i.get(this, jn, "f").classList.remove("hidden")) : i.get(this, jn, "f").classList.add("hidden"),
                i.get(this, $n, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                i.get(this, Sn, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                i.set(this, se, !1, "f"),
                i.get(this, Wn, "m", ce).call(this),
                i.get(this, _n, "f").classList.remove("hidden")
            }
            )), "f")
        }
        ,
        ge = function(t) {
            i.get(this, se, "f") ? i.get(this, On, "f").showConfirm(i.get(this, zn, "f").get("Are you sure you want to exit without saving?") + "\n\n" + i.get(this, zn, "f").get("All changes will be lost!"), i.get(this, zn, "f").get("Cancel"), i.get(this, zn, "f").get("Confirm"), null, ( () => {
                t()
            }
            )) : t()
        }
        ,
        fe = function() {
            i.get(this, se, "f") && (i.get(this, Hn, "f").setNickname(i.get(this, ee, "f")),
            i.get(this, Hn, "f").setCountryCode(i.get(this, ie, "f")),
            i.get(this, Hn, "f").setCarStyle(i.get(this, Sn, "f").getCarStyle()),
            i.set(this, te, i.get(this, Hn, "f").profileSlot, "f"),
            i.set(this, ne, i.get(this, Hn, "f").getCurrentUserProfile(), "f"),
            i.set(this, se, !1, "f"),
            i.set(this, oe, !0, "f")),
            i.get(this, Wn, "m", pe).call(this)
        }
        ,
        pe = function() {
            null != i.get(this, Kn, "f") && (clearTimeout(i.get(this, Kn, "f")),
            i.set(this, Kn, null, "f")),
            i.get(this, Jn, "f").classList.remove("show"),
            i.get(this, Jn, "f").classList.remove("hide"),
            i.set(this, Kn, window.setTimeout(( () => {
                i.get(this, Jn, "f").textContent = i.get(this, zn, "f").get("Car saved!"),
                i.get(this, Jn, "f").classList.add("show"),
                i.set(this, Kn, window.setTimeout(( () => {
                    i.get(this, Jn, "f").classList.remove("show"),
                    i.get(this, Jn, "f").classList.add("hide")
                }
                ), 3e3), "f")
            }
            ), 0), "f")
        }
        ;
        const ue = class {
            constructor(t, n, e, o, a, l, c, r, h, d) {
                Wn.add(this),
                Sn.set(this, void 0),
                Tn.set(this, void 0),
                zn.set(this, void 0),
                Pn.set(this, void 0),
                In.set(this, void 0),
                Un.set(this, void 0),
                Hn.set(this, void 0),
                On.set(this, void 0),
                Dn.set(this, void 0),
                Rn.set(this, void 0),
                Bn.set(this, null),
                Fn.set(this, null),
                qn.set(this, null),
                Vn.set(this, void 0),
                Xn.set(this, void 0),
                Qn.set(this, null),
                Yn.set(this, void 0),
                _n.set(this, void 0),
                jn.set(this, void 0),
                Zn.set(this, void 0),
                Jn.set(this, void 0),
                Kn.set(this, null),
                $n.set(this, void 0),
                te.set(this, void 0),
                ne.set(this, void 0),
                ee.set(this, void 0),
                ie.set(this, void 0),
                se.set(this, !1),
                oe.set(this, !1),
                i.set(this, Sn, t, "f"),
                i.set(this, Tn, n, "f"),
                i.set(this, Pn, o, "f"),
                i.set(this, In, a, "f"),
                i.set(this, Un, l, "f"),
                i.set(this, Hn, c, "f"),
                i.set(this, On, r, "f"),
                i.set(this, zn, e, "f"),
                i.set(this, Vn, new An(h), "f"),
                i.set(this, te, i.get(this, Hn, "f").profileSlot, "f"),
                i.set(this, ne, i.get(this, Hn, "f").getCurrentUserProfile(), "f"),
                i.set(this, ee, i.get(this, ne, "f").nickname, "f"),
                i.set(this, ie, i.get(this, ne, "f").countryCode, "f"),
                i.set(this, Xn, new THREE.PerspectiveCamera(70,1,.1,RenderManager.maxViewDistance), "f"),window.__polyfxInGarage = true,
                i.get(this, Xn, "f").position.set(0, 2, 6),
                o.scene.add(i.get(this, Xn, "f")),
                i.set(this, Yn, new OrbitControls(i.get(this, Xn, "f"),o.canvas), "f"),
                i.get(this, Yn, "f").addEventListener("start", ( () => {
                    i.set(this, Qn, null, "f")
                }
                )),
                i.get(this, Yn, "f").target.set(0, 0, 1.2),
                i.get(this, Yn, "f").update(),
                i.get(this, Yn, "f").mouseButtons = {
                    LEFT: THREE.MOUSE.ROTATE,
                    MIDDLE: THREE.MOUSE.ROTATE,
                    RIGHT: THREE.MOUSE.ROTATE
                },
                i.get(this, Yn, "f").enablePan = !1,
                i.get(this, Yn, "f").minDistance = 2.5,
                i.get(this, Yn, "f").maxDistance = 7,
                i.get(this, Yn, "f").maxPolarAngle = Math.PI / 2 - .15;
                const g = document.getElementById("ui");
                if (null == g)
                    throw new Error("UI element not found");
                i.set(this, Dn, g, "f"),
                i.set(this, _n, document.createElement("div"), "f"),
                i.get(this, _n, "f").className = "customization-ui";
                const f = document.createElement("div");
                f.className = "safe-area-left",
                i.get(this, _n, "f").appendChild(f);
                const p = document.createElement("div");
                p.className = "safe-area-right",
                i.get(this, _n, "f").appendChild(p);
                const u = document.createElement("div");
                u.className = "top",
                i.get(this, _n, "f").appendChild(u);
                const m = document.createElement("button");
                m.className = "button",
                m.innerHTML = '<img class="button-icon" src="images/quit.svg"> ',
                m.append(document.createTextNode(e.get("Exit"))),
                m.addEventListener("click", ( () => {
                    a.playUIClick(),
                    xn.Xx() || i.get(this, Wn, "m", ge).call(this, d)
                }
                )),
                u.appendChild(m),
                window.addEventListener("keydown", i.set(this, Rn, (t => {
                    "Escape" != t.code || xn.Xx() || null != i.get(this, Bn, "f") || null != i.get(this, Fn, "f") || null != i.get(this, qn, "f") || i.get(this, On, "f").isOpen || (i.get(this, Wn, "m", ge).call(this, d),
                    t.preventDefault())
                }
                ), "f"));
                const v = document.createElement("button");
                v.className = "button",
                v.innerHTML = '<img class="button-icon" src="images/save.svg"> ',
                v.append(document.createTextNode(e.get("Save"))),
                v.addEventListener("click", ( () => {
                    a.playUIClick(),
                    i.get(this, se, "f") && i.get(this, ee, "f") == E.A.defaultNickname ? (i.get(this, _n, "f").classList.add("hidden"),
                    i.get(this, Wn, "m", re).call(this, i.get(this, te, "f"), i.get(this, ee, "f"), i.get(this, ie, "f"), ( () => {
                        i.get(this, _n, "f").classList.remove("hidden"),
                        i.get(this, Wn, "m", fe).call(this)
                    }
                    ))) : i.get(this, Wn, "m", fe).call(this)
                }
                )),
                u.appendChild(v);
                const w = document.createElement("button");
                w.className = "button",
                w.innerHTML = '<img class="button-icon" src="images/reset.svg"> ',
                w.append(document.createTextNode(e.get("Default"))),
                w.addEventListener("click", ( () => {
                    a.playUIClick(),
                    i.get(this, Wn, "m", ae).call(this)
                }
                )),
                u.appendChild(w);
                const b = document.createElement("button");
                b.className = "button",
                b.innerHTML = '<img class="button-icon" src="images/random.svg"> ',
                b.append(document.createTextNode(e.get("Random"))),
                b.addEventListener("click", ( () => {
                    a.playUIClick(),
                    i.get(this, Wn, "m", le).call(this)
                }
                )),
                u.appendChild(b);
                const x = document.createElement("button");
                x.className = "button right",
                x.innerHTML = '<img class="button-icon" src="images/list.svg"> ',
                x.append(document.createTextNode(e.get("Switch Profile"))),
                x.addEventListener("click", ( () => {
                    a.playUIClick(),
                    xn.Xx() || (i.get(this, se, "f") ? i.get(this, On, "f").showConfirm(e.get("Are you sure you want to switch profile without saving?") + "\n\n" + e.get("All changes will be lost!"), e.get("Cancel"), e.get("Confirm"), null, ( () => {
                        i.get(this, Wn, "m", de).call(this)
                    }
                    )) : i.get(this, Wn, "m", de).call(this))
                }
                )),
                u.appendChild(x);
                const k = document.createElement("div");
                k.className = "profile-button-container",
                i.get(this, _n, "f").appendChild(k);
                const y = document.createElement("button");
                y.className = "button",
                i.set(this, jn, document.createElement("img"), "f"),
                i.get(this, jn, "f").className = "country-flag loading",
                i.get(this, jn, "f").addEventListener("load", ( () => {
                    i.get(this, jn, "f").classList.remove("loading")
                }
                )),
                i.get(this, jn, "f").draggable = !1,
                y.appendChild(i.get(this, jn, "f"));
                const M = (0,
                L.O)()
                  , N = null == i.get(this, ie, "f") ? null : M.find((t => t.code == i.get(this, ie, "f")));
                null != N ? (i.get(this, jn, "f").src = "images/countries/" + N.code + ".svg",
                i.get(this, jn, "f").title = N.name) : i.get(this, jn, "f").classList.add("hidden"),
                i.set(this, Zn, document.createTextNode(i.get(this, ee, "f")), "f"),
                y.append(i.get(this, Zn, "f")),
                y.addEventListener("click", ( () => {
                    a.playUIClick(),
                    i.get(this, _n, "f").classList.add("hidden"),
                    i.get(this, Wn, "m", re).call(this, i.get(this, te, "f"), i.get(this, ee, "f"), i.get(this, ie, "f"), null)
                }
                )),
                k.appendChild(y),
                i.set(this, Jn, document.createElement("div"), "f"),
                i.get(this, Jn, "f").className = "save-message",
                i.get(this, _n, "f").appendChild(i.get(this, Jn, "f")),
                i.set(this, $n, new Gn(i.get(this, In, "f"),i.get(this, zn, "f"),i.get(this, On, "f"),i.get(this, Vn, "f"),i.get(this, _n, "f"),(t => {
                    i.get(this, Sn, "f").setCarStyle(t),
                    i.set(this, se, !0, "f")
                }
                ),(t => {
                    i.set(this, Qn, t, "f")
                }
                )), "f"),
                i.get(this, Dn, "f").appendChild(i.get(this, _n, "f")),
                i.get(this, $n, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                i.get(this, Sn, "f").setCarStyle(i.get(this, ne, "f").carStyle),
                i.get(this, Wn, "m", ce).call(this),
                i.set(this, se, !1, "f")
            }
            dispose() {
                if (i.get(this, oe, "f")) {
                    const {token: t, nickname: n, countryCode: e, carStyle: s} = i.get(this, Hn, "f").getCurrentUserProfile();
                    i.get(this, Un, "f").submitUserProfile(t, n, e, s).catch((t => {
                        console.warn(t)
                    }
                    ))
                }
                i.get(this, Pn, "f").scene.remove(i.get(this, Xn, "f")),window.__polyfxInGarage = false,
                window.removeEventListener("keydown", i.get(this, Rn, "f")),
                i.get(this, $n, "f").dispose(),
                i.get(this, Dn, "f").removeChild(i.get(this, _n, "f")),
                i.get(this, Yn, "f").dispose(),
                i.get(this, Pn, "f").canvas.style.touchAction = ""
            }
            update(t) {
                null != i.get(this, Qn, "f") && (i.get(this, Xn, "f").position.lerp(i.get(this, Qn, "f"), Math.min(1, 10 * t)),
                i.get(this, Yn, "f").update())
            }
            get camera() {
                return i.get(this, Xn, "f")
            }
        }
        ;
        var me, ve, we, be, xe, ke, Ge, ye, Ce, Ee, Me, TrackDataImporterV5 = e(9681);
        class Le {
            constructor(t, n, e, o, a, c, r, h, d, g, f, p) {
                ve.set(this, void 0),
                we.set(this, void 0),
                be.set(this, void 0),
                xe.set(this, void 0),
                ke.set(this, void 0),
                Ge.set(this, void 0),
                ye.set(this, void 0),
                Ce.set(this, void 0),
                Ee.set(this, void 0),
                i.set(this, ve, c, "f"),
                i.set(this, we, n, "f"),
                i.set(this, be, e, "f"),
                i.set(this, xe, o, "f"),
                i.set(this, ke, a, "f");
                const u = TrackDataImporterV5.withMetadata("PolyTrack24pdBBHsYCCCAAA9XK12cdEBcBplkDN42ExQNdSWh5Xf9eEp1009dQICjjB7eqqlx7YH8BnFJzsokZScpwEDHaBDwkHFLDPYfxQPqFblOkZfJVS5YWIfXDZru01TebKuEiCCvXfpfxuTe0adAH1wf51aX4OmtpXr6XJPfHfSPO3CemUiRGceD0OBJGnIjkU5RJaqf8t5u5RFgcOawuRoIeAp088v3gpv4u2fe6kqKyyFaX5HQk17dqpwUldfSAL32crBslQfPAQfwSaC");
                if (null == u)
                    throw new Error("Failed to load track data");
                if (n.loadTrackData(u.trackData),
                n.generateMeshes(),
                e.generateMountains(n.getBounds()),
                null == i.get(me, me, "f", Me))
                    throw new Error("CustomizationState resources not initialized");
                i.set(this, ye, i.get(me, me, "f", Me).clone(), "f"),
                i.get(this, ye, "f").traverse((t => {
                    if (t instanceof THREE.Mesh) {
                        let n;
                        i.get(this, ke, "f").isTrackShadowsEnabled() && (t.castShadow = !0,
                        t.receiveShadow = !0),
                        n = Array.isArray(t.material) ? t.material : [t.material];
                        for (const t of n)
                            t.side = THREE.FrontSide,
                            i.get(this, ke, "f").addMaterial(t)
                    }
                }
                )),
                a.scene.add(i.get(this, ye, "f"));
                const m = {
                    position: new THREE.Vector3(0,.35,1.35),
                    quaternion: (new THREE.Quaternion).setFromEuler(new THREE.Euler(0,-.24 * Math.PI,0))
                };
                i.set(this, Ce, new VisualCar(null,m,null,null,a,c,e,n,n.getTrackData(),h,null), "f"),
                i.get(this, Ce, "f").audioVolume = 0;
                const v = i.get(this, Ce, "f").getCarState();
                i.get(this, Ce, "f").setCarState({
                    ...v,
                    steering: -.2
                }, !0),
                i.get(this, Ce, "f").update(0),
                i.set(this, Ee, [], "f");
                for (let t = 0; t < 3; t++) {
                    const o = {
                        position: new THREE.Vector3(10.5 * t - 22,.35,-34),
                        quaternion: (new THREE.Quaternion).setFromEuler(new THREE.Euler(0,0,0))
                    }
                      , r = new VisualCar(null,o,null,null,a,c,e,n,n.getTrackData(),h,null);
                    r.audioVolume = 0,
                    r.update(0),
                    i.get(this, Ee, "f").push(r)
                }
                i.set(this, Ge, new ue(i.get(this, Ce, "f"),i.get(this, Ee, "f"),t,a,c,d,r,g,f,p), "f"),
                a.setCamera(i.get(this, Ge, "f").camera)
            }
            dispose() {
                i.get(this, we, "f").clear(),
                i.get(this, be, "f").clearMountains(),
                i.get(this, Ge, "f").dispose(),
                i.get(this, ke, "f").scene.remove(i.get(this, ye, "f")),
                i.get(this, ye, "f").traverse((t => {
                    if (t instanceof THREE.Mesh) {
                        let n;
                        t.geometry.dispose(),
                        n = Array.isArray(t.material) ? t.material : [t.material];
                        for (const t of n)
                            t.dispose(),
                            i.get(this, ke, "f").removeMaterial(t)
                    }
                }
                )),
                i.get(this, Ce, "f").dispose();
                for (const t of i.get(this, Ee, "f"))
                    t.dispose();
                i.set(this, Ee, [], "f")
            }
            update(t) {
                i.get(this, Ge, "f").update(t),
                i.get(this, be, "f").update(i.get(this, we, "f")),
                i.get(this, xe, "f").update(t, i.get(this, ke, "f").camera, i.get(this, we, "f").sunDirection),
                i.get(this, ve, "f").update(t, !1, i.get(this, ke, "f")),
                i.get(this, ke, "f").update(i.get(this, we, "f").sunDirection)
            }
            static async initResources() {
                if (null != i.get(me, me, "f", Me))
                    return;
                const t = new a.B
                  , n = new DRACOLoader;
                try {
                    n.setDecoderPath("lib/draco/"),
                    t.setDRACOLoader(n),
                    await new Promise(( (n, e) => {
                        t.load("models/garage.glb", (t => {
                            i.set(me, me, t.scene, "f", Me),
                            i.get(me, me, "f", Me).traverse((t => {
                                if (t instanceof THREE.Mesh) {
                                    if (Array.isArray(t.material))
                                        for (let n = 0; n < t.material.length; n++) {
                                            const e = t.material[n];
                                            if (!(e instanceof THREE.MeshStandardMaterial))
                                                throw new Error("Material is not a MeshStandardMaterial");
                                            t.material[n] = new THREE.MeshLambertMaterial({
                                                color: e.color
                                            })
                                        }
                                    else
                                        t.material = new THREE.MeshLambertMaterial({
                                            color: t.material.color
                                        });
                                    t.geometry = t.geometry.toNonIndexed(),
                                    t.geometry.computeVertexNormals(!1)
                                }
                            }
                            )),
                            n()
                        }
                        ), void 0, e)
                    }
                    ))
                } finally {
                    n.dispose()
                }
            }
        }
        me = Le,
        ve = new WeakMap,
        we = new WeakMap,
        be = new WeakMap,
        xe = new WeakMap,
        ke = new WeakMap,
        Ge = new WeakMap,
        ye = new WeakMap,
        Ce = new WeakMap,
        Ee = new WeakMap,
        Me = {
            value: null
        };
        const Ae = Le
    }
    ,
    4191: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".color-picker-ui {\n\tmargin: 8px;\n}\n\n.color-picker-ui > .value-saturation-picker {\n\tposition: relative;\n\tmargin: 0 0 8px 0;\n\twidth: 220px;\n\theight: 160px;\n\tbackground-color: #fff;\n\toverflow: hidden;\n}\n\n.color-picker-ui > .value-saturation-picker > .marker {\n\tposition: absolute;\n\twidth: 12px;\n\theight: 12px;\n\tbackground-image: radial-gradient(closest-side, transparent, #000, #fff, #000, transparent);\n}\n\n.color-picker-ui > .hue-picker {\n\tposition: relative;\n\twidth: 220px;\n\theight: 40px;\n\tbackground-image: linear-gradient(to right, \n\t\thsl(0, 100%, 50%),\n\t\thsl(60, 100%, 50%),\n\t\thsl(120, 100%, 50%),\n\t\thsl(180, 100%, 50%),\n\t\thsl(240, 100%, 50%),\n\t\thsl(300, 100%, 50%),\n\t\thsl(0, 100%, 50%)\n\t);\n\toverflow: hidden;\n}\n\n.color-picker-ui > .hue-picker > .marker {\n\tposition: absolute;\n\ttop: 0;\n\theight: 100%;\n\twidth: 3px;\n\tbackground-image: linear-gradient(to right, #000, #fff, #000);\n}\n", ""]);
        const l = a
    }
    ,
    4975: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".customization-panel-ui {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\twidth: 100%;\n\theight: 100%;\n}\n\n.customization-panel-ui > .tab-bar {\n\tposition: absolute;\n\tleft: 0;\n\tbottom: 0;\n\tpadding: 0 var(--safe-area-right) 0 var(--safe-area-left);\n\tbox-sizing: border-box;\n\twidth: 100%;\n\tbackground-color: var(--surface-color);\n}\n\n.customization-panel-ui > .tab-bar > .button {\n\tmargin: 8px 0;\n\tcolor: rgba(255, 255, 255, 0.25);\n}\n.customization-panel-ui > .tab-bar > .button:first-of-type {\n\tmargin-left: 8px;\n}\n.customization-panel-ui > .tab-bar > .button.selected {\n\tbackground-color: var(--button-hover-color);\n\tcolor: var(--text-color);\n}\n.customization-panel-ui > .tab-bar > .button > img {\n\topacity: 0.25;\n}\n.customization-panel-ui > .tab-bar > .button.selected > img {\n\topacity: 1;\n}\n\n.customization-panel-ui > .panel.hidden {\n\tdisplay: none;\n}\n\n.customization-panel-ui > .color-panel {\n\tdisplay: flex;\n\tpadding: 0 var(--safe-area-right) 0 var(--safe-area-left);\n\tbox-sizing: border-box;\n\tposition: absolute;\n\tleft: 0;\n\tbottom: 64px;\n\twidth: 100%;\n}\n\n.customization-panel-ui > .color-panel > div {\n\tdisplay: flex;\n\tflex-grow: 1;\n\tflex-basis: 0;\n}\n.customization-panel-ui > .color-panel > div.left {\n\tjustify-content: flex-start;\n}\n.customization-panel-ui > .color-panel > div.right {\n\tjustify-content: flex-end;\n}\n\n.customization-panel-ui > .color-panel > div > .color {\n\tmargin: 0 10px;\n\tpadding: 0;\n\ttext-align: center;\n\tbackground-color: var(--surface-secondary-color);\n\tpointer-events: auto;\n}\n.customization-panel-ui > .color-panel > div > .color > h2 {\n\tmargin: 0;\n\tpadding: 2px;\n\tfont-size: 26px;\n\tfont-weight: normal;\n\tbackground-color: var(--surface-color);\n\tcolor: var(--text-color);\n}\n.customization-panel-ui > .color-panel > div > .color > .input-container {\n\tdisplay: flex;\n\tmargin: 8px;\n\twidth: 220px;\n}\n.customization-panel-ui > .color-panel > div > .color > .input-container > input {\n\tmargin: 0;\n\tmin-width: 0;\n\tfont-weight: normal;\n\tclip-path: none;\n\ttext-align: center;\n}\n.customization-panel-ui > .color-panel > div > .color > .input-container > .color-preview {\n\tmargin: 0 0 0 8px;\n\twidth: 48px;\n\tborder: 2px solid var(--surface-tertiary-color);\n\tbackground-color: #f0f;\n}\n\n\n.customization-panel-ui > .options-panel {\n\tdisplay: flex;\n\tflex-direction: column;\n\tpadding: 2px;\n\tbox-sizing: border-box;\n\tposition: absolute;\n\tright: var(--safe-area-right);\n\tbottom: 64px;\n\theight: calc(100% - 64px - 64px);\n\tbackground-color: var(--surface-secondary-color);\n\toverflow-y: auto;\n\tpointer-events: auto;\n}\n\n.customization-panel-ui > .options-panel > button {\n\tposition: relative;\n\tdisplay: block;\n\tmargin: 0 0 2px 0;\n\tpadding: 5px;\n\tbackground-color: var(--button-color);\n\tborder: 2px solid rgb(38, 31, 88);\n\tcursor: pointer;\n}\n.customization-panel-ui > .options-panel > button:hover {\n\tbackground-color: var(--button-hover-color);\n}\n@media (hover: none) {\n\t.customization-panel-ui > .options-panel > button:hover {\n\t\tbackground-color: var(--button-color);\n\t}\n}\n.customization-panel-ui > .options-panel > button:active {\n\tbackground-color: var(--button-active-color);\n}\n.customization-panel-ui > .options-panel > button.selected {\n\tbackground-color: var(--button-hover-color);\n\tbox-shadow: inset 0 0 5px #fff;\n\tborder: 2px solid #fff;\n}\n.customization-panel-ui > .options-panel > button > img:first-of-type {\n\tdisplay: block;\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 128px;\n\theight: 128px;\n\t-webkit-filter: drop-shadow(0 0 2px #000);\n\tfilter: drop-shadow(0 0 2px #000);\n\tpointer-events: none;\n\ttransition: opacity 0.25s ease-out;\n}\n.customization-panel-ui > .options-panel > button > img:first-of-type.loading {\n\topacity: 0;\n\ttransition: none;\n}\n\n.customization-panel-ui > .options-panel > button > img.video-icon {\n\tposition: absolute;\n\tbottom: 8px;\n\tright: 8px;\n\twidth: 24px;\n\theight: 24px;\n\tpointer-events: none;\n\t-webkit-filter: drop-shadow(2px 2px 1px #000);\n\tfilter: drop-shadow(2px 2px 1px #000);\n}\n", ""]);
        const l = a
    }
    ,
    8026: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".customization-ui {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 100%;\n\theight: 100%;\n}\n\n.customization-ui > .safe-area-left {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\twidth: var(--safe-area-left);\n\theight: 100%;\n\tbackground-color: var(--surface-color);\n}\n\n.customization-ui > .safe-area-right {\n\tposition: absolute;\n\tright: 0;\n\ttop: 0;\n\twidth: var(--safe-area-right);\n\theight: 100%;\n\tbackground-color: var(--surface-color);\n}\n\n.customization-ui > .top {\n\tdisplay: block;\n\tmargin: 0;\n\tpadding: 0 var(--safe-area-right) 0 var(--safe-area-left);\n\tbackground-color: var(--surface-color);\n}\n.customization-ui > .top > .button {\n\tdisplay: inline-block;\n\tmargin: 8px 0;\n}\n.customization-ui > .top > .button:first-of-type {\n\tmargin-left: 8px;\n}\n.customization-ui > .top > .button:last-of-type {\n\tmargin-right: 8px;\n}\n.customization-ui > .top > .button.right {\n\tfloat: right;\n}\n\n.customization-ui > .profile-button-container {\n\tdisplay: inline-block;\n\tmargin: 0 0 0 var(--safe-area-left);\n\tpadding: 6px 7px;\n\tclip-path: polygon(0 0, 100% 0, calc(100% - 10px) 100%, 0 100%);\n\tfont-size: 30px;\n\tcolor: var(--text-color);\n\tbackground: var(--surface-secondary-color);\n}\n.customization-ui > .profile-button-container > button {\n\tmin-width: 150px;\n\tmax-width: 450px;\n\twhite-space: nowrap;\n\ttext-overflow: ellipsis;\n\toverflow: hidden;\n}\n\n.customization-ui > .profile-button-container > button > .country-flag {\n\tvertical-align: top;\n\tmargin-right: 10px;\n\t/* Flag aspect ratio is 4:3. */\n\twidth: 40px;\n\theight: 30px;\n\tfilter: drop-shadow(2px 2px 1px rgba(0, 0, 0, 0.5)); /* box-shadow cannot be used because of Nepal. */\n\ttransition: opacity 0.25s ease-out;\n}\n.customization-ui > .profile-button-container > button > .country-flag.loading {\n\topacity: 0;\n}\n\n.customization-ui > .save-message {\n\tmargin: 10px 10px 10px calc(10px + var(--safe-area-left));\n\tpadding: 0;\n\tposition: absolute;\n\tfont-size: 30px;\n\tcolor: #96ff96;\n\ttext-shadow: 0 0 5px #000;\n\tpointer-events: none;\n\n\tleft: -10px;\n\topacity: 0;\n}\n.customization-ui > .save-message.show {\n\tleft: 0;\n\topacity: 1;\n\ttransition: opacity 0.25s ease-in-out, left 0.25s ease-in-out;\n}\n.customization-ui > .save-message.hide {\n\tleft: 0;\n\topacity: 0;\n\ttransition: opacity 0.25s ease-in-out, left 0.25s ease-in-out;\n}\n", ""]);
        const l = a
    }
    ,
    9e3: (t, n, e) => {
        e.d(n, {
            A: () => l
        });
        var i = e(1601)
          , s = e.n(i)
          , o = e(6314)
          , a = e.n(o)()(s());
        a.push([t.id, ".country-selection-ui > .background {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 1;\n\twidth: 100%;\n\theight: 100%;\n\tbackground-color: rgba(20, 20, 30, 0.5);\n\tpointer-events: auto;\n}\n\n.country-selection-ui > .container {\n\tposition: absolute;\n\tleft: calc(50% - 600px / 2);\n\ttop: 0;\n\tz-index: 2;\n\tdisplay: flex;\n\tflex-direction: column;\n\tbox-sizing: border-box;\n\twidth: 600px;\n\theight: 100%;\n\tbackground-color: var(--surface-color);\n}\n\n.country-selection-ui > .container > h1 {\n\tmargin: 10px;\n\tpadding: 0;\n\tfont-weight: normal;\n\tfont-size: 38px;\n\ttext-align: center;\n\tcolor: var(--text-color);\n}\n\n.country-selection-ui > .container > .search-bar-container {\n\tposition: relative;\n\tdisplay: flex;\n\tmargin: 0 20px;\n\tflex-grow: 1;\n}\n.country-selection-ui > .container > .search-bar-container > input {\n\tmargin: 8px -10px;\n\tpadding: 0 20px;\n\theight: 44px;\n\tflex-grow: 1;\n\tclip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);\n\tcolor: var(--text-color);\n\ttext-indent: 2px; /* Without this the italic text will be cut off on the left side. */\n}\n.country-selection-ui > .container > .search-bar-container > img {\n\tmargin: 8px -10px 8px 0;\n\tpadding: 0 16px;\n\twidth: 24px;\n\tbackground-color: var(--button-hover-color);\n\tclip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);\n}\n\n.country-selection-ui > .container > .content {\n\theight: 100%;\n\tbackground-color: var(--surface-secondary-color);\n\toverflow-y: auto;\n\tpointer-events: auto;\n}\n\n.country-selection-ui > .container > .content > .country-button {\n\tdisplay: flex;\n\tmargin: 10px 10px 0 10px;\n\tpadding: 10px;\n\twidth: calc(100% - 2 * 10px);\n\theight: 100px;\n\tclip-path: polygon(0 0, 100% 0, calc(100% - 8px) 100%, 0 100%);\n\ttext-align: left;\n\twhite-space: nowrap;\n}\n.country-selection-ui > .container > .content > .country-button:last-of-type {\n\tmargin-bottom: 10px;\n}\n.country-selection-ui > .container > .content > .country-button.selected {\n\tbackground-color: var(--button-hover-color);\n}\n\n.country-selection-ui > .container > .content > .country-button > .name {\n\tmargin: 0 20px;\n\talign-self: center;\n\tdisplay: -webkit-box;\n\t-webkit-line-clamp: 2;\n\tline-clamp: 2;\n\t-webkit-box-orient: vertical;\n\twhite-space: wrap;\n\tfont-size: 38px;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n\n.country-selection-ui > .container > .content > .country-button > img {\n\tvertical-align: middle;\n\taspect-ratio: 4 / 3;\n\theight: 100%;\n\tfilter: drop-shadow(4px 4px 1px rgba(0, 0, 0, 0.25)); /* box-shadow cannot be used because of Nepal. */\n\ttransition: opacity 0.25s ease-out;\n}\n.country-selection-ui > .container > .content > .country-button > img.loading {\n\topacity: 0;\n}\n\n.country-selection-ui > .container > .content > .nothing-found-message {\n\tmargin: 0;\n\tpadding: 20px;\n\tfont-size: 20px;\n\ttext-align: center;\n\tcolor: var(--text-color);\n\topacity: 0.5;\n}\n\n.country-selection-ui > .container > .button-wrapper > button {\n\tmargin: 10px;\n}\n", ""]);
        const l = a
    }
}]);
