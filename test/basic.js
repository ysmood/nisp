var nisp = require("../lib");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");
var plainFn = require("../lib/plainFn");
var plainAsyncFn = require("../lib/plainAsyncFn");
var lazyFn = require("../lib/lazyFn");

var stdFns = {
    do: require("../lib/do"),
    if: require("../lib/if"),
    plain: require("../lib/plain"),
    set: require("../lib/set"),
    get: require("../lib/get"),
    fn: require("../lib/fn")
};

var extraFns = {
    encode: require("../lib/encode")
};

module.exports = function (it) {
    var add = plainFn(function () {
        return [].slice.call(arguments).reduce(function (s, v) {
            return s += v;
        });
    });

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
                "`": stdFns.plain
            }), [1, "ok"]);
        });

        it("plain data", function () {
            var ast = [1, 2];

            return it.eq(nisp(ast, {}), [1, 2]);
        });

        it("set get", function () {
            var env = {
                do: stdFns.do,
                "+": add,
                "@": stdFns.fn,
                set: stdFns.set,
                get: stdFns.get
            };

            var ast = ["do",
                ["set", "foo",
                    ["@", ["a", "b"],
                        ["+", "a", "b"]
                    ]
                ],
                [["get", "foo"], 1, 2]
            ];

            return it.eq(nisp(ast, env), 3);
        });

        it("multiple level without do", function () {
            var env = {
                "+": add
            };

            var ast = [["+", 1, ["+", 1, 1]]];

            return it.eq(nisp(ast, env), [3]);
        });

        it("custom if", function () {
            var env = {
                "+": add,
                "?": stdFns.if
            };

            var ast = ["?", ["+", 0, ["+", 1, 0]], 1, 2];

            return it.eq(nisp(ast, env), 1);
        });

        it("custom fn", function () {
            var env = {
                "do": stdFns.do,
                "+": add,
                "get": stdFns.get,
                "set": stdFns.set,
                "@": stdFns.fn
            };

            var ast = ["do",
                ["set", "foo",
                    ["@", ["a", "b"],
                        ["set", "c", 1],
                        ["+", "a", "b", ["get", "c"]]
                    ]
                ],
                [["get", "foo"], 1, ["+", 1, 1]]
            ];

            return it.eq(nisp(ast, env), 4);
        });

        it("lazyFn", function () {
            var env = {
                "+": lazyFn(function (args) {
                    return args(0) + args(1);
                })
            };

            var ast = ["+", 1, 1];

            return it.eq(nisp(ast, env), 2);
        });

        it("fn as arg", function () {
            var env = {
                "foo": function () {
                    return 1;
                },

                "map": plainFn(function (a, b) {
                    return a() + b();
                })
            };

            var ast = ["map", "foo", "foo"];

            return it.eq(nisp(ast, env), 2);
        });

        it("plainAsyncFn", function () {
            var env = {
                "get": plainAsyncFn(function (val) {
                    return yutils.sleep(13, val);
                }, Promise),
                "+": plainAsyncFn(function (a, b) {
                    return yutils.sleep(13).then(function () {
                        return a + b;
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, env), 3);
        });
    });

    it.describe("extra", function (it) {
        it("encode object", function () {
            it.eq(
                extraFns.encode(["test", 10]),
                {
                    tag: "__test__10_",
                    json: "[\"test\",10]"
                }
            );
        });
        it("encode string", function () {
            it.eq(
                extraFns.encode("[\"test\", 10]"),
                {
                    tag: "__test___10_",
                    json: "[\"test\", 10]"
                }
            );
        });
    });
};
