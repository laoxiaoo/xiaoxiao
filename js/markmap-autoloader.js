/*! markmap-autoloader v0.2.0 | MIT License */
this.markmap = this.markmap || {},
    function(t) {
        "use strict";
        /*! markmap-common v0.1.6 | MIT License */
        function n() {
            return n = Object.assign || function(t) {
                for (var n = 1; n < arguments.length; n++) {
                    var r = arguments[n];
                    for (var a in r) Object.prototype.hasOwnProperty.call(r, a) && (t[a] = r[a])
                }
                return t
            }, n.apply(this, arguments)
        }

        function r(t, n, r) {
            const a = document.createElement(t);
            return n && Object.entries(n).forEach((([t, n]) => {
                a[t] = n
            })), r && Object.entries(r).forEach((([t, n]) => {
                a.setAttribute(t, n)
            })), a
        }
        Math.random().toString(36).slice(2, 8);
        const a = function(t) {
            const n = {};
            return function(...r) {
                const a = `${r[0]}`;
                let e = n[a];
                return e || (e = {
                    value: t(...r)
                }, n[a] = e), e.value
            }
        }((t => {
            document.head.append(r("link", {
                rel: "preload",
                as: "script",
                href: t
            }))
        }));

        function e(t, a) {
            if ("script" === t.type) return new Promise(((a, e) => {
                var o;
                document.head.append(r("script", n({}, t.data, {
                    onload: a,
                    onerror: e
                }))), null != (o = t.data) && o.src || a()
            }));
            if ("iife" === t.type) {
                const {
                    fn: n,
                    getParams: r
                } = t.data;
                n(...(null == r ? void 0 : r(a)) || [])
            }
        }
        var o, s;
        const c = {},
            i = async function(t, r) {
                const o = t.filter((t => {
                    var n;
                    return "script" === t.type && (null == (n = t.data) ? void 0 : n.src)
                }));
                o.length > 1 && o.forEach((t => a(t.data.src))), r = n({
                    getMarkmap: () => window.markmap
                }, r);
                for (const n of t) await e(n, r)
            }([{
                type: "script",
                data: {
                    src: "js/d3@6.7.0"
                }
            }, {
                type: "script",
                data: {
                    src: "js/markmap-view@0.2.7"
                }
            }]).then((() => {
                var t, n;
                null == (t = window.markmap) || null == (n = t.autoLoader) || null == n.onReady || n.onReady()
            }));

        function l(t) {
            const {
                Transformer: n,
                Markmap: r,
                autoLoader: a
            } = window.markmap, e = t.textContent.split("\n");
            let o = 1 / 0;
            e.forEach((t => {
                const n = t.match(/^\s*/)[0].length;
                n < t.length && (o = Math.min(o, n))
            }));
            const s = e.map((t => t.slice(o))).join("\n"),
                i = new n(null == a ? void 0 : a.transformPlugins);
            t.innerHTML = "<svg></svg>";
            const l = t.firstChild,
                d = r.create(l),
                u = () => {
                    const t = function(t, n) {
                        const {
                            root: r,
                            features: a
                        } = t.transform(n), e = Object.keys(a).filter((t => !c[t]));
                        e.forEach((t => {
                            c[t] = !0
                        }));
                        const {
                            styles: o,
                            scripts: s
                        } = t.getAssets(e), {
                            markmap: i
                        } = window;
                        return o && i.loadCSS(o), s && i.loadJS(s), r
                    }(i, s);
                    d.setData(t), d.fit()
                };
            i.hooks.retransform.tap(u), u()
        }
        async function d(t) {
            await i, t.querySelectorAll(".markmap").forEach(l)
        }

        function u() {
            return d(document)
        }
        null != (o = window.markmap) && null != (s = o.autoLoader) && s.manual || ("loading" === document.readyState ? document.addEventListener("DOMContentLoaded", (() => {
            u()
        })) : u()), t.ready = i, t.render = l, t.renderAll = u, t.renderAllUnder = d
    }(this.markmap.autoLoader = this.markmap.autoLoader || {});