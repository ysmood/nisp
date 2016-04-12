var nisp = require("../src");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");
var plainFn = require("../src/plainFn");
var plainAsyncFn = require("../src/plainAsyncFn");

var stdFns = {
    do: require("../src/do"),
    if: require("../src/if"),
    plain: require("../src/plain"),
    set: require("../src/set"),
    get: require("../src/get"),
    fn: require("../src/fn")
};

var extraFns = {
    encode: require("../src/encode")
};

module.exports = function (it) {
    var add = plainFn(function () {
        return [].slice.call(arguments).reduce(function (s, v) {
            return s += v;
        });
    });

    it.describe("basic", function (it) {
        it("number", function () {
            return it.eq(nisp([1]), 1);
        });

        it("string", function () {
            return it.eq(nisp(["ok"]), "ok");
        });

        it("object", function () {
            return it.eq(nisp([{ a: "ok" }]), { a: "ok" });
        });

        it("null", function () {
            return it.eq(nisp([null]), null);
        });

        it("plain", function () {
            return it.eq(nisp(["`", [1, "ok"]], {
                "`": stdFns.plain
            }), [1, "ok"]);
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

            return it.eq(nisp(ast, env), 3);
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
