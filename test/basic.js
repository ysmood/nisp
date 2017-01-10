var nisp = require("../core");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");

var fns = {
    plain: require("../fn/plain"),
    plainSpread: require("../fn/plainSpread"),
    plainAsync: require("../fn/plainAsync"),
    plainAsyncSpread: require("../fn/plainAsyncSpread"),
    args: require("../fn/args")
};

var langs = {
    do: require("../lang/do"),
    if: require("../lang/if"),
    plain: require("../lang/plain"),
    def: require("../lang/def"),
    fn: require("../lang/fn"),
    list: require("../lang/list"),
    dict: require("../lang/dict"),

    add: fns.plain(function (args) {
        return args.reduce(function (s, v) {
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

        it("symbol undefined", function () {
            try {
                nisp([1, 2]);
                throw new Error("should throw error");
            } catch (err) {
                return it.eq(err.message, "nisp '1' is undefined, ast: [1,2]");
            }
        });

        it("plain", function () {
            return it.eq(nisp(["p", [1, "ok"]], {
                "p": langs.plain
            }), [1, "ok"]);
        });

        it("env", function () {
            var sandbox = {
                "env": function (run, ast, sandbox, env) {
                    return env;
                }
            };

            var env = "ok";

            return it.eq(nisp(["env"], sandbox, env), "ok");
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
                        ["+", ["a"], ["b"]]
                    ]
                ],
                ["foo", 1, 2]
            ];

            return it.eq(nisp(ast, sandbox), 3);
        });

        it("list", function () {
            var sandbox = {
                "list": langs.list,
                "+": langs.add
            };

            var ast = ["list", 1, ["+", 1, 1], 3];

            return it.eq(nisp(ast, sandbox), [1, 2, 3]);
        });

        it("dict", function () {
            var sandbox = {
                "dict": langs.dict,
                "+": langs.add
            };

            var ast = ["dict",
                "a", 1,
                "b", ["+", 1, 1],
                "c", 3
            ];

            return it.eq(nisp(ast, sandbox), { a: 1, b: 2, c: 3 });
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
                ["def", "c", 10],
                ["def", "foo",
                    ["@", ["a", "b"],
                        ["def", "c", 1],
                        ["+", ["a"], ["b"], ["c"]]
                    ]
                ],
                ["foo", 1, ["+", 1, 1]]
            ];

            return it.eq(nisp(ast, sandbox), 4);
        });

        it("fns.plainSpread", function () {
            var sandbox = {
                "+": fns.plainSpread(function (a, b) {
                    return a + b;
                })
            };

            var ast = ["+", 1, 1];

            return it.eq(nisp(ast, sandbox), 2);
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
                foo: fns.plain(function (args) {
                    return args[0] + 1;
                }),

                add: fns.args(function (args) {
                    return args(0, "fn", 1) + args(1, "fn", 1);
                })
            };

            var ast = ["add", "foo", "foo"];

            return it.eq(nisp(ast, sandbox), 4);
        });

        it("anonymous fn", function () {
            var sandbox = {
                fn: langs.fn
            };

            var ast = [["fn", ["a"], ["a"]], "ok"];

            return it.eq(nisp(ast, sandbox), "ok");
        });

        it("fns.plainAsync", function () {
            var sandbox = {
                "get": fns.plainAsync(function (args, env) {
                    return yutils.sleep(13, args[0] + env);
                }, Promise),
                "+": fns.plainAsync(function (args) {
                    return yutils.sleep(13).then(function () {
                        return args[0] + args[1];
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, sandbox, 1), 5);
        });

        it("fns.plainAsyncSpread", function () {
            var sandbox = {
                "get": fns.plainAsyncSpread(function (v) {
                    return yutils.sleep(13, v + this.env);
                }, Promise),
                "+": fns.plainAsyncSpread(function (a, b) {
                    return yutils.sleep(13).then(function () {
                        return a + b;
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, sandbox, 1), 5);
        });


        it("new", function () {
            var sandbox = {
                "+": fns.plain(function (args) {
                    return args.reduce((a, b) => a + b, 0);
                }),
                "get": fns.plainSpread(function (a, b) {
                    return a[b];
                })
            };

            var json = { a : 1 };

            var tpl = nisp.new`
            (
                +
                (
                    get ${json} ${'a'}
                )
                2
            )
            `;

            return it.eq(tpl(sandbox), 3);
        });

        it("new error", function () {
            var sandbox = {
                "+": fns.plain(function (args) {
                    return args.reduce((a, b) => a + b, 0);
                }),
                "get": fns.plainSpread(function (a, b) {
                    return a[b];
                })
            };

            var json = { a : 1 };

            var tpl = nisp.new`
            (
                +
                (
                    get ${json} ${'a'}
                
                2
            )
            `;

            try {
                it.eq(tpl(sandbox), 3);
            } catch (err) {
                return it.eq(err.message, `
                    Expected "(", ")", "[", "false", "null", "true", "{", number, or string but end of input found.
                `.trim());
            }

            throw new Error()
        });
    });
};