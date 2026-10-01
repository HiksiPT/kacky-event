"use strict";
(self.webpackChunk = self.webpackChunk || []).push([['verifier'], {
    5142: (e, t, n) => {
        n.d(t, {
            default: () => ce
        });
        var i = n(1635)
          , s = n(927)
          , a = n(6633)
          , r = n(1223)
          , TrackDataModule = n(8438)
          , d = n(5072)
          , l = n.n(d)
          , h = n(7825)
          , g = n.n(h)
          , f = n(7659)
          , c = n.n(f)
          , m = n(5056)
          , u = n.n(m)
          , p = n(540)
          , w = n.n(p)
          , v = n(1113)
          , x = n.n(v)
          , G = n(5467)
          , k = {};
        k.styleTagTransform = x(),
        k.setAttributes = u(),
        k.insert = c().bind(null, "head"),
        k.domAPI = g(),
        k.insertStyleElement = w();
        l()(G.A, k);
        G.A && G.A.locals && G.A.locals;
        var M, R, C, W, S, y, b;
        M = new WeakMap,
        R = new WeakMap,
        C = new WeakMap,
        W = new WeakMap,
        S = new WeakMap,
        y = new WeakMap,
        b = new WeakMap;
        const E = class {
            constructor(e, t, n, a, r, o) {
                M.set(this, void 0),
                R.set(this, void 0),
                C.set(this, void 0),
                W.set(this, void 0),
                S.set(this, void 0),
                y.set(this, void 0),
                b.set(this, new Map);
                const d = document.getElementById("ui");
                if (null == d)
                    throw new Error("UI element not found");
                i.set(this, M, d, "f"),
                i.set(this, R, document.createElement("div"), "f"),
                i.get(this, R, "f").className = "verifier-ui",
                i.get(this, M, "f").appendChild(i.get(this, R, "f")),
                i.set(this, C, document.createElement("p"), "f"),
                i.get(this, R, "f").appendChild(i.get(this, C, "f"));
                const l = document.createElement("p");
                l.textContent = "Number of threads: " + t.toString(),
                i.get(this, R, "f").appendChild(l);
                const h = document.createElement("input");
                h.type = "range",
                h.min = "0",
                h.max = t.toString(),
                h.value = t.toString(),
                h.addEventListener("change", ( () => {
                    const e = parseInt(h.value, 10);
                    l.textContent = "Number of threads: " + e.toString(),
                    r(e)
                }
                )),
                i.get(this, R, "f").appendChild(h);
                const g = document.createElement("p");
                g.textContent = "Max time: " + Math.floor(n / 60 / 1e3).toString() + " minutes",
                i.get(this, R, "f").appendChild(g);
                const f = document.createElement("input");
                f.type = "range",
                f.min = 6e4 .toString(),
                f.max = s.A.maxFrames.toString(),
                f.value = n.toString(),
                f.addEventListener("input", ( () => {
                    const e = parseInt(f.value, 10);
                    g.textContent = "Max time: " + Math.floor(e / 60 / 1e3).toString() + " minutes",
                    o(e)
                }
                )),
                i.get(this, R, "f").appendChild(f);
                const c = document.createElement("table");
                i.get(this, R, "f").appendChild(c),
                i.set(this, W, c.createTHead(), "f"),
                i.set(this, S, c.createTBody(), "f");
                const m = i.get(this, W, "f").insertRow();
                for (const e of ["Track", "State", "Verified", "Invalid", "Estimated remaining"]) {
                    const t = document.createElement("th");
                    t.textContent = e,
                    m.appendChild(t)
                }
                const u = document.createElement("button");
                u.className = "button",
                u.textContent = "Stop",
                u.addEventListener("click", ( () => {
                    e.playUIClick(),
                    a()
                }
                )),
                i.get(this, R, "f").appendChild(u),
                window.addEventListener("keydown", i.set(this, y, (e => {
                    "Escape" == e.code && (a(),
                    e.preventDefault())
                }
                ), "f"))
            }
            dispose() {
                i.get(this, M, "f").removeChild(i.get(this, R, "f")),
                window.removeEventListener("keydown", i.get(this, y, "f"))
            }
            setText(e) {
                i.get(this, C, "f").textContent = e
            }
            setTracks(e) {
                for (const t of e) {
                    let e = i.get(this, b, "f").get(t.id);
                    if (null == e) {
                        e = {
                            element: i.get(this, S, "f").insertRow(),
                            name: t.name,
                            exhausted: t.exhausted,
                            recordingsVerified: t.recordingsVerified,
                            invalidRecordings: t.invalidRecordings,
                            estimatedRemaining: t.estimatedRemaining
                        },
                        i.get(this, b, "f").set(t.id, e);
                        e.element.insertCell().textContent = t.name;
                        e.element.insertCell().textContent = t.exhausted ? "Empty" : "Processing";
                        e.element.insertCell().textContent = t.recordingsVerified.toString();
                        e.element.insertCell().textContent = t.invalidRecordings.toString();
                        const n = e.element.insertCell();
                        null != t.estimatedRemaining ? n.textContent = t.estimatedRemaining.toString() : n.textContent = "?"
                    } else
                        e.name != t.name && (e.element.cells[0].textContent = t.name,
                        e.name = t.name),
                        e.exhausted != t.exhausted && (e.element.cells[1].textContent = t.exhausted ? "Empty" : "Processing",
                        e.exhausted = t.exhausted),
                        e.recordingsVerified != t.recordingsVerified && (e.element.cells[2].textContent = t.recordingsVerified.toString(),
                        e.recordingsVerified = t.recordingsVerified),
                        e.invalidRecordings != t.invalidRecordings && (e.element.cells[3].textContent = t.invalidRecordings.toString(),
                        e.invalidRecordings = t.invalidRecordings),
                        e.estimatedRemaining != t.estimatedRemaining && (null != t.estimatedRemaining ? e.element.cells[4].textContent = t.estimatedRemaining.toString() : e.element.cells[4].textContent = "?",
                        e.estimatedRemaining = t.estimatedRemaining)
                }
            }
        }
        ;
        var T, V, D, I, A, F, B, L, P, N, U, z, Y, O, H, j, q, J, K, Q, X, Z, $, _, ee, te, ne, ie, se, ae, re, oe, de, le, he = n(2951), ge = n(4784);
        class fe {
            constructor(e, t, n, a, o, d, l, h, g) {
                T.add(this),
                D.set(this, void 0),
                I.set(this, void 0),
                A.set(this, void 0),
                F.set(this, void 0),
                B.set(this, void 0),
                L.set(this, void 0),
                P.set(this, void 0),
                N.set(this, []),
                U.set(this, []),
                z.set(this, []),
                Y.set(this, !1),
                O.set(this, new Date),
                H.set(this, []),
                j.set(this, !0),
                q.set(this, void 0),
                J.set(this, new Date),
                K.set(this, 0),
                Q.set(this, 0),
                X.set(this, 0),
                Z.set(this, 0),
                $.set(this, 100),
                _.set(this, 100),
                ee.set(this, 1e3),
                te.set(this, 36e5),
                ne.set(this, s.A.maxFrames),
                ie.set(this, 4),
                se.set(this, void 0),
                i.set(this, D, e, "f"),
                i.set(this, I, t, "f"),
                i.set(this, A, n, "f"),
                i.set(this, F, a, "f"),
                i.set(this, B, l, "f"),
                i.set(this, L, h, "f"),
                "undefined" != typeof navigator && "hardwareConcurrency"in navigator && navigator.hardwareConcurrency > 0 && i.set(this, ie, navigator.hardwareConcurrency, "f"),
                i.set(this, se, i.get(this, ie, "f"), "f"),
                t.clear(),
                i.set(this, P, new E(e,i.get(this, ie, "f"),i.get(this, ne, "f"),g,(e => {
                    for (i.set(this, se, e, "f"); i.get(this, N, "f").length < i.get(this, se, "f"); )
                        i.get(this, N, "f").push({
                            simulation: new r.A(!1,d,l),
                            isBusy: !1,
                            isDisposed: !1
                        });
                    for (; i.get(this, N, "f").length > i.get(this, se, "f"); ) {
                        const e = i.get(this, N, "f").pop();
                        null != e && (e.simulation.dispose(),
                        e.isDisposed = !0)
                    }
                }
                ),(e => {
                    i.set(this, ne, e, "f");
                    for (const e of i.get(this, U, "f"))
                        e.timeout = new Date,
                        e.estimatedRemaining = null
                }
                )), "f");
                for (let e = 0; e < i.get(this, se, "f"); e++)
                    i.get(this, N, "f").push({
                        simulation: new r.A(!1,d,i.get(this, B, "f")),
                        isBusy: !1,
                        isDisposed: !1
                    });
                if (o.forEachTrack(( (e, t, n, s) => {
                    i.get(this, U, "f").push({
                        id: e,
                        name: t.name,
                        trackData: s,
                        timeout: new Date,
                        recordingsVerified: 0,
                        invalidRecordings: 0,
                        estimatedRemaining: null,
                        lastEstimatedRemainingTime: null
                    })
                }
                )),
                i.set(this, q, setInterval(( () => {
                    i.get(this, T, "m", oe).call(this)
                }
                ), 10), "f"),
                window.electron) {
                    const e = () => {
                        if (window.electron) {
                            const e = new Date
                              , t = "--- PolyTrack Verifier ---\n" + i.get(this, T, "m", de).call(this, e);
                            window.electron.log(t)
                        }
                    }
                    ;
                    setInterval(e, 1e4),
                    e()
                }
            }
            dispose() {
                i.get(this, P, "f").dispose();
                for (const e of i.get(this, N, "f"))
                    e.simulation.dispose(),
                    e.isDisposed = !0;
                i.get(this, N, "f").length = 0,
                clearInterval(i.get(this, q, "f"))
            }
            update(e) {
                if (i.get(this, B, "f").hasLoaded()) {
                    const e = new Date;
                    i.get(this, P, "f").setText(i.get(this, T, "m", de).call(this, e)),
                    i.get(this, P, "f").setTracks(i.get(this, U, "f").map(( ({id: t, name: n, timeout: i, recordingsVerified: s, invalidRecordings: a, estimatedRemaining: r}) => ({
                        id: t,
                        name: n,
                        exhausted: i > e,
                        recordingsVerified: s,
                        invalidRecordings: a,
                        estimatedRemaining: r
                    }))))
                }
                i.get(this, D, "f").update(e, !1, i.get(this, I, "f"))
            }
        }
        V = fe,
        D = new WeakMap,
        I = new WeakMap,
        A = new WeakMap,
        F = new WeakMap,
        B = new WeakMap,
        L = new WeakMap,
        P = new WeakMap,
        N = new WeakMap,
        U = new WeakMap,
        z = new WeakMap,
        Y = new WeakMap,
        O = new WeakMap,
        H = new WeakMap,
        j = new WeakMap,
        q = new WeakMap,
        J = new WeakMap,
        K = new WeakMap,
        Q = new WeakMap,
        X = new WeakMap,
        Z = new WeakMap,
        $ = new WeakMap,
        _ = new WeakMap,
        ee = new WeakMap,
        te = new WeakMap,
        ne = new WeakMap,
        ie = new WeakMap,
        se = new WeakMap,
        T = new WeakSet,
        ae = function(e) {
            const t = i.get(this, U, "f").slice();
            do {
                const n = Math.floor(Math.random() * t.length)
                  , i = t.splice(n, 1)[0];
                if (e > i.timeout)
                    return i
            } while (t.length > 0);
            return null
        }
        ,
        re = function() {
            const e = new Date;
            if (!i.get(this, Y, "f") && i.get(this, H, "f").length < i.get(this, _, "f") && Math.abs(e.getTime() - i.get(this, O, "f").getTime()) >= i.get(this, ee, "f")) {
                i.set(this, Y, !0, "f"),
                i.set(this, O, e, "f");
                const t = i.get(this, T, "m", ae).call(this, e);
                if (null != t || i.get(this, z, "f").length > 0 && 0 == i.get(this, H, "f").length || i.get(this, z, "f").length > i.get(this, $, "f")) {
                    const n = i.get(this, z, "f");
                    i.set(this, z, [], "f");
                    const r = null != t && (null == t.lastEstimatedRemainingTime || Math.abs(e.getTime() - t.lastEstimatedRemainingTime.getTime()) >= i.get(this, te, "f"));
                    i.get(this, A, "f").verifyRecordings(i.get(this, L, "f"), t?.id ?? null, i.get(this, ne, "f"), r, n).then(( ({unverifiedRecordings: n, exhaustive: r, estimatedRemaining: o}) => {
                        null != t && (i.set(this, H, i.get(this, H, "f").concat(n.map(( ({id: e, recording: n, frames: i}) => ({
                            track: t,
                            recordingId: e,
                            recording: s.A.deserialize(n),
                            time: new a.A(i)
                        })))), "f"),
                        r ? (t.timeout = new Date(e.getTime() + Math.floor(432e5 + 12 * Math.random() * 60 * 60 * 1e3)),
                        t.estimatedRemaining = n.length,
                        t.lastEstimatedRemainingTime = e) : null != o && (t.estimatedRemaining = o,
                        t.lastEstimatedRemainingTime = e))
                    }
                    )).catch((e => {
                        console.error(e),
                        i.get(this, A, "f").getUser(i.get(this, L, "f")).then((e => {
                            if (!e?.isVerifier) {
                                for (let e = 0; e < he.A.maxNumberOfProfiles; e++) {
                                    const t = i.get(this, F, "f").getUserProfile(e);
                                    if (null != t && t.isVerifier && t.token == i.get(this, L, "f")) {
                                        i.get(this, F, "f").setIsVerifier(!1, e);
                                        break
                                    }
                                }
                                i.set(this, j, !1, "f")
                            }
                        }
                        )).catch((e => {
                            console.warn(e)
                        }
                        ))
                    }
                    )).finally(( () => {
                        i.set(this, Y, !1, "f")
                    }
                    ))
                } else
                    i.set(this, Y, !1, "f")
            }
        }
        ,
        oe = async function() {
            var e, t, n, s, a, r;
            if (i.get(this, B, "f").hasLoaded() && i.get(this, j, "f")) {
                i.get(this, T, "m", re).call(this);
                for (const d of i.get(this, N, "f"))
                    if (!d.isBusy && i.get(this, H, "f").length > 0) {
                        d.isBusy = !0;
                        const {track: l, recordingId: h, recording: g, time: f} = i.get(this, H, "f").splice(0, 1)[0];
                        if (null == g)
                            i.set(this, Q, (e = i.get(this, Q, "f"),
                            ++e), "f"),
                            l.recordingsVerified++,
                            i.set(this, X, (t = i.get(this, X, "f"),
                            ++t), "f"),
                            l.invalidRecordings++,
                            null != l.estimatedRemaining && (l.estimatedRemaining = Math.max(0, l.estimatedRemaining - 1),
                            0 == l.estimatedRemaining && (l.lastEstimatedRemainingTime = null)),
                            i.get(this, z, "f").push({
                                id: h,
                                verifiedState: ge.Y.Invalid
                            }),
                            d.isBusy = !1;
                        else {
                            let e;
                            i.set(this, K, (n = i.get(this, K, "f"),
                            ++n), "f");
                            try {
                                l.trackData instanceof TrackDataModule.A ? e = l.trackData : (e = await l.trackData(),
                                l.trackData = e)
                            } catch (t) {
                                console.error('Failed to load track data for track "' + l.name + '":', t),
                                e = null
                            }
                            try {
                                if (null != e) {
                                    const t = await d.simulation.validate(e, g, f);
                                    i.set(this, Q, (s = i.get(this, Q, "f"),
                                    ++s), "f"),
                                    l.recordingsVerified++,
                                    t || (i.set(this, X, (a = i.get(this, X, "f"),
                                    ++a), "f"),
                                    l.invalidRecordings++),
                                    null != l.estimatedRemaining && (l.estimatedRemaining = Math.max(0, l.estimatedRemaining - 1),
                                    0 == l.estimatedRemaining && (l.lastEstimatedRemainingTime = null)),
                                    i.set(this, Z, i.get(this, Z, "f") + f.numberOfFrames, "f"),
                                    i.get(this, z, "f").push({
                                        id: h,
                                        verifiedState: t ? ge.Y.Verified : ge.Y.Invalid
                                    })
                                }
                            } catch (e) {
                                if (!d.isDisposed)
                                    throw e
                            } finally {
                                d.isBusy = !1,
                                i.set(this, K, (r = i.get(this, K, "f"),
                                --r), "f")
                            }
                        }
                    }
            }
        }
        ,
        de = function(e) {
            const t = (e.getTime() - i.get(this, J, "f").getTime()) / 1e3;
            let n = "";
            i.get(this, j, "f") ? n += "Recordings are being verified...\n" : n += "Error: User is no longer a verifier\n",
            n += "\nBacklog: " + i.get(this, H, "f").length.toString(),
            n += "\nProcessing: " + i.get(this, K, "f").toString(),
            n += "\nRecordings verified: " + i.get(this, Q, "f").toString(),
            n += "\nInvalid recordings found: " + i.get(this, X, "f").toString(),
            n += "\n";
            const s = i.get(this, Q, "f") / t;
            n += "\nVerifications per second: " + s.toFixed(2),
            n += "\nSimulated frames per second: " + Math.floor(i.get(this, Z, "f") / t).toString(),
            n += "\n";
            const a = i.get(this, U, "f").reduce(( (e, t) => null != t.estimatedRemaining ? e + t.estimatedRemaining : e), 0);
            return n += "\nTotal estimated remaining: " + a.toString(),
            n += "\nTotal estimated remaining time: " + i.get(V, V, "m", le).call(V, a / s),
            n
        }
        ,
        le = function(e) {
            if (e <= 0 || !Number.isFinite(e))
                return "0s";
            if (e < 60)
                return e.toFixed(0) + "s";
            if (e < 3600) {
                const t = e % 60;
                return Math.floor(e / 60).toString() + "m " + t.toFixed(0) + "s"
            }
            if (e < 86400) {
                const t = Math.floor(e / 3600)
                  , n = Math.floor(e % 3600 / 60)
                  , i = e % 60;
                return t.toString() + "h " + n.toString() + "m " + i.toFixed(0) + "s"
            }
            {
                const t = Math.floor(e / 86400)
                  , n = Math.floor(e % 86400 / 3600)
                  , i = Math.floor(e % 3600 / 60)
                  , s = e % 60;
                return t.toString() + "d " + n.toString() + "h " + i.toString() + "m " + s.toFixed(0) + "s"
            }
        }
        ;
        const ce = fe
    }
    ,
    5467: (e, t, n) => {
        n.d(t, {
            A: () => o
        });
        var i = n(1601)
          , s = n.n(i)
          , a = n(6314)
          , r = n.n(a)()(s());
        r.push([e.id, '.verifier-ui {\n\tposition: absolute;\n\tleft: 0;\n\ttop: 0;\n\tz-index: 2;\n\tmargin: 0;\n\tpadding: 16px;\n\twidth: 100%;\n\theight: 100%;\n\toverflow-y: scroll;\n\tbox-sizing: border-box;\n\tbackground-color: var(--surface-color);\n\tpointer-events: auto;\n}\n\n.verifier-ui > p {\n\tmargin: 16px 4px 0 4px;\n\tpadding: 0;\n\tfont-size: 20px;\n\tcolor: var(--text-color);\n\twhite-space: pre-wrap;\n}\n\n.verifier-ui > input[type="range"] {\n\tmargin: 16px 0;\n\twidth: 390px;\n}\n\n.verifier-ui > table {\n\tmargin: 0;\n\tpadding: 0;\n\twidth: 100%;\n\tborder-collapse: collapse;\n\ttable-layout: fixed;\n\tcolor: var(--text-color);\n}\n\n.verifier-ui > table > thead > tr > th {\n\ttext-align: left;\n\tborder-bottom: 2px solid var(--text-color);\n}\n\n.verifier-ui > table > thead > tr > th, .verifier-ui > table > tbody > tr > td {\n\tpadding: 8px 0;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n\twhite-space: nowrap;\n}\n\n.verifier-ui > button {\n\tdisplay: inline-block;\n\tmargin: 16px 0 0 0;\n}\n', ""]);
        const o = r
    }
}]);
