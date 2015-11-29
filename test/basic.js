var nisp = require("../src");

var stdFns = {
    def: require("../src/def"),
    if: require("../src/if"),
    plain: require("../src/plain"),
    fn: require("../src/fn")
}

module.exports = function (it) {
    function add (args, env, eval) {
        return eval(args[1], env) + eval(args[2], env);
    }

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
                '`': stdFns.plain
            }), [1, "ok"]);
        });

        it("custom def", function () {
            var env = {
                "+": add,
                def: stdFns.def
            };

            var ast = [
                ["def", "a", ["+", 1, 1]]
            ]

            return it.eq(nisp(ast, env), 2);
        });

        it("custom if", function () {
            var env = {
                "+": add,
                if: stdFns.if
            };

            var ast = [
                ["if", ["+", 0, ["+", 1, 0]], 1, 2]
            ]

            return it.eq(nisp(ast, env), 1);
        });

        it("custom fn", function () {
            var env = {
                "+": add,
                def: stdFns.def,
                fn: stdFns.fn
            };

            var ast = [
                ["def", "foo", ["fn", ["a", "b"], ["+", "a", "b"]]],
                ["foo", 1, ["+", 1, 1]]
            ]

            return it.eq(nisp(ast, env), 3);
        });
    });
};
