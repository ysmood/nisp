import nisp, { encode, exec } from "../core"
import Promise from "yaku"
import yutils from "yaku/lib/utils"
import $ from "../fn/$"

import plain from "../fn/plain"
import plainSpread from "../fn/plainSpread"
import plainAsync from "../fn/plainAsync"
import plainAsyncSpread from "../fn/plainAsyncSpread"
import args from "../fn/args"
import $do from "../lang/do"
import $if from "../lang/if"
import def from "../lang/def"
import fn from "../lang/fn"
import list from "../lang/list"
import dict from "../lang/dict"


let add = plain(function (args) {
    return args.reduce(function (s, v) {
        return s += v;
    });
})

export default function (it) {

    it.describe("basic", function (it) {
        it("number", function () {
            return it.eq(nisp(1, {}), 1);
        });

        it("string", function () {
            return it.eq(nisp("ok", {}), "ok");
        });

        it("object", function () {
            return it.eq(nisp({ a: "ok" }, {}), { a: "ok" });
        });

        it("null", function () {
            return it.eq(nisp(null, {}), null);
        });

        it("symbol undefined", function () {
            try {
                nisp([1, 2], {});
                throw new Error("should throw error");
            } catch (err) {
                return it.eq(err.message, "nisp '1' is undefined, ast: [1,2]");
            }
        });

        it("plain", function () {
            return it.eq(nisp($([1, "ok"]), {
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
                do: $do,
                "+": add,
                "@": fn,
                def: def
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
                "list": list,
                "+": add
            };

            var ast = ["list", 1, ["+", 1, 1], 3];

            return it.eq(nisp(ast, sandbox), [1, 2, 3]);
        });

        it("dict", function () {
            var sandbox = {
                "dict": dict,
                "+": add
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
                "+": add,
                "?": $if
            };

            var ast = ["?", ["+", 0, ["+", 1, 0]], 1, 2];

            return it.eq(nisp(ast, sandbox), 1);
        });

        it("custom fn", function () {
            var sandbox = {
                "do": $do,
                "+": add,
                "def": def,
                "@": fn
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

        it("plainSpread", function () {
            var sandbox = {
                "+": plainSpread(function (a, b) {
                    return a + b;
                })
            };

            var ast = ["+", 1, 1];

            return it.eq(nisp(ast, sandbox), 2);
        });

        it("args", function () {
            var sandbox = {
                "+": args(function (args) {
                    return args(0) + args(1);
                })
            };

            var ast = ["+", 1, 1];

            return it.eq(nisp(ast, sandbox), 2);
        });

        it("fn as arg", function () {
            var sandbox = {
                foo: plain(function (args) {
                    return args[0] + 1;
                }),

                add: args(function (args) {
                    return args(0, "fn", 1) + args(1, "fn", 1);
                })
            };

            var ast = ["add", "foo", "foo"];

            return it.eq(nisp(ast, sandbox), 4);
        });

        it("anonymous fn", function () {
            var sandbox = {
                fn: fn
            };

            var ast = [["fn", ["a"], ["a"]], "ok"];

            return it.eq(nisp(ast, sandbox), "ok");
        });

        it("plainAsync", function () {
            var sandbox = {
                "get": plainAsync(function (args, env) {
                    return yutils.sleep(13, args[0] + env);
                }, Promise),
                "+": plainAsync(function (args) {
                    return yutils.sleep(13).then(function () {
                        return args[0] + args[1];
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, sandbox, 1), 5);
        });

        it("plainAsyncSpread", function () {
            var sandbox = {
                "get": plainAsyncSpread(function (v) {
                    return yutils.sleep(13, v + this.env);
                }, Promise),
                "+": plainAsyncSpread(function (a, b) {
                    return yutils.sleep(13).then(function () {
                        return a + b;
                    });
                }, Promise)
            };

            var ast = ["+", ["get", 1], ["get", 2]];

            return it.eq(nisp(ast, sandbox, 1), 5);
        });

        it("grammar", function () {
            var sandbox = {
                do: $do,
                def: def,
                "+": plain(function (args) {
                    return args.reduce(function (a, b) { return a + b; }, 0);
                }),
                "get": plainSpread(function (a, b) {
                    return a[b];
                })
            };

            var json = [1];

            var code = encode`(do
                (def "a" ${json})
                (+ (get (a) 0) 2 ${Buffer.from("str")} 0)
            )`;

            return it.eq(exec(code, sandbox), "3str0");
        });

        it("grammar error", function () {
            var sandbox = {
                "+": plain(function (args) {
                    return args.reduce(function (a, b) { return a + b; }, 0);
                }),
                "get": plainSpread(function (a, b) {
                    return a[b];
                })
            };

            var json = { a : 1 };

            var code = encode`
                (+ (get ${json} "a") 2
            `

            try {
                it.eq(exec(code, sandbox), 3);
            } catch (err) {
                return it.eq(err.message, "Expected \"(\", \")\", \"[\", \"false\", \"null\", \"true\", \"{\", binary, number, or string but end of input found.");
            }

            throw new Error();
        });
    });
};