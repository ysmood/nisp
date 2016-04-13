var nisp = require("../core");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");

var fns = {
    plain: require("../fn/plain"),
    plainAsync: require("../fn/plainAsync"),
    args: require("../fn/args")
};

var langs = {
    do: require("../lang/do"),
    if: require("../lang/if"),
    plain: require("../lang/plain"),
    def: require("../lang/def"),
    fn: require("../lang/fn"),

    add: fns.plain(function () {
        return [].slice.call(arguments).reduce(function (s, v) {
            return s += v;
        });
    })
};

module.exports = function (it) {

    it.describe("basic", function (it) {
        it("number", function () {
            return it.eq(nisp(1), 1);
        });

        it("string", function () {
            return it.eq(nisp("ok"), "ok");
        });

        it("object", function () {
            return it.eq(nisp({ a: "ok" }), { a: "ok" });
        });

        it("null", function () {
            return it.eq(nisp(null), null);
        });

        it("null array", function () {
            return it.eq(nisp([null]), [null]);
        });

        it("plain fn", function () {
            return it.eq(nisp(["`", [1, "ok"]], {
                "`": langs.plain
            }), [1, "ok"]);
        });

        it("plain data", function () {
            var ast = [1, 2];

            return it.eq(nisp(ast), [1, 2]);
        });

        it("def", function () {
            var sandbox = {
                do: langs.do,
                "+": langs.add,
                "@": langs.fn,
                def: langs.def
            };

            var ast = ["do",
                ["def", "foo",
                    ["@", ["a", "b"],
                        ["+", "a", "b"]
                    ]
                ],
                ["foo", 1, 2]
            ];

            return it.eq(nisp(ast, sandbox), 3);
        });

        it("multiple level without do", function () {
            var sandbox = {
                "+": langs.add
            };

            var ast = [["+", 1, ["+", 1, 1]]];

            return it.eq(nisp(ast, sandbox), [3]);
        });

        it("custom if", function () {
            var sandbox = {
                "+": langs.add,
                "?": langs.if
            };

            var ast = ["?", ["+", 0, ["+", 1, 0]], 1, 2];

            return it.eq(nisp(ast, sandbox), 1);
        });

        it("custom fn", function () {
            var sandbox = {
                "do": langs.do,
                "+": langs.add,
                "def": langs.def,
                "@": langs.fn
            };

            var ast = ["do",
                ["def", "foo",
                    ["@", ["a", "b"],
                        ["def", "c", 1],
                        ["+", "a", "b", "c"]
                    ]
                ],
                ["foo", 1, ["+", 1, 1]]
            ];

            return it.eq(nisp(ast, sandbox), 4);
        });

        it("fns.args", function () {
            var sandbox = {
                "+": fns.args(function (args) {
                    return args(0) + args(1);
                })
            };

            var ast = ["+", 1, 1];

            return it.eq(nisp(ast, sandbox), 2);
        });

        it("fn as arg", function () {
            var sandbox = {
                foo: function () {
                    return 1;
                },

                map: fns.plain(function (a, b) {
                    return a() + b();
                })
            };

            var ast = ["map", "foo", "foo"];

            return it.eq(nisp(ast, sandbox), 2);
        });

        it("fns.plainAsync", function () {
            var sandbox = {
                "get": fns.plainAsync(function (val) {
                    return yutils.sleep(13, val);
                }, Promise),
                "+": fns.plainAsync(function (a, b) {
                    return yutils.sleep(13).then(function () {
                        return a + b;
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, sandbox), 3);
        });
    });
};
