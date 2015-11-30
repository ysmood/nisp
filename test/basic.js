var nisp = require("../src");
var toPlainFn = require("../src/toPlainFn");

var stdFns = {
    def: require("../src/def"),
    if: require("../src/if"),
    plain: require("../src/plain"),
    fn: require("../src/fn")
};

module.exports = function (it) {
    var add = toPlainFn(function () {
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

        it("plain", function () {
            return it.eq(nisp([["`", [1, "ok"]]], {
                "`": stdFns.plain
            }), [1, "ok"]);
        });

        it("custom def", function () {
            var env = {
                "+": add,
                $: stdFns.def
            };

            var ast = [
                ["$", "a", ["+", 1, 1]],
                "a"
            ];

            return it.eq(nisp(ast, env), 2);
        });

        it("custom if", function () {
            var env = {
                "+": add,
                "?": stdFns.if
            };

            var ast = [
                ["?", ["+", 0, ["+", 1, 0]], 1, 2]
            ];

            return it.eq(nisp(ast, env), 1);
        });

        it("custom fn", function () {
            var env = {
                "+": add,
                $: stdFns.def,
                "@": stdFns.fn
            };

            var ast = [
                ["$", "foo",
                    ["@", ["a", "b"],
                        ["$", "c", 1],
                        ["+", "a", "b", "c"]
                    ]
                ],
                ["foo", 1, ["+", 1, 1]]
            ];

            return it.eq(nisp(ast, env), 4);
        });
    });
};
