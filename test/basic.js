var nisp = require("../src");

module.exports = function (it) {
    function add (args, env, eval) {
        return eval(args[1], env) + eval(args[2], env);
    }

    function def (args, env, eval) {
        return env[eval(args[1], env)] = eval(args[2], env);
    }

    function ifExp (args, env, eval) {
        return eval(args[1], env) ?
            eval(args[2], env) :
            eval(args[3], env);
    }

    function plain (args) {
        return args[1];
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
                '`': plain
            }), [1, "ok"]);
        });

        it("custom def", function () {
            var env = {
                "+": add,
                def: def
            };

            var ast = [
                ["def", "a", ["+", 1, 1]]
            ]

            return it.eq(nisp(ast, env), 2);
        });

        it("custom if", function () {
            var env = {
                "+": add,
                if: ifExp
            };

            var ast = [
                ["if", ["+", 0, ["+", 1, 0]], 1, 2]
            ]

            return it.eq(nisp(ast, env), 1);
        });

        // it("@", function () {
        //     var env = { inc: function (a) { return ++a; } };

        //     var ast = [
        //         ["$", "foo",
        //             ["@", ["v"], ["inc", "v"]]
        //         ],
        //         ["foo", 1]
        //     ]

        //     return it.eq(nisp(ast, env), 2);
        // });

        // it("?", function () {
        //     var env = { list: function () { return [].slice.call(arguments); } };

        //     var ast = [
        //         ["list",
        //             ["?", true, 1, 2],
        //             ["?", false, 1, 2]
        //         ]
        //     ]

        //     return it.eq(nisp(ast, env), [1, 2]);
        // });
    });
};
