import nisp from "../core"
import Promise from "yaku"
import * as sleep from "yaku/lib/sleep"
import $ from "../lib/$"

import $do from "../lib/do"
import list from "../lib/list"
import dict from "../lib/dict"
import async from '../lib/async'
import args from '../lib/args'
import $if from "../lib/if"
import def from "../lib/def"
import fn from "../lib/fn"
import exec from "../lib/exec"
import encode from "../lib/encode"


let add = function (...args) {
    return args.reduce(function (s, v) {
        return s += v;
    });
}

export default function (it) {
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
            return it.eq(err.message, `[nisp] function "1" is undefined\nstack: [1]`);
        }
    });

    it("plain", function () {
        return it.eq(nisp($([1, "ok"]), {
        }), [1, "ok"]);
    });

    it("env", function () {
        var sandbox = {
            env: function () {
                return this;
            }
        };

        var env = "ok";

        return it.eq(nisp(["env"], sandbox, env), "ok");
    });

    it("args", function () {
        var sandbox = {
            '+': args((arg) => {
                return arg(0) + arg(1);
            })
        };

        return it.eq(nisp(['+', 1, 2], sandbox), 3);
    });

    it("def", function () {
        var sandbox = {
            do: $do,
            "+": add,
            "@": fn,
            def
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
            def,
            "@": fn
        };

        var ast = ["do",
            ["def", "c", 10],
            ["def", "foo",
                ["@", ["a", "b"], ['do',
                    ["def", "c", 1],
                    ["+", ["a"], ["b"], ["c"]]
                ]]
            ],
            ["foo", 1, ["+", 1, 1]]
        ];

        return it.eq(nisp(ast, sandbox), 4);
    });

    it("anonymous fn", function () {
        var sandbox = {
            fn
        };

        var ast = [["fn", ["a"], ["a"]], "ok"];

        return it.eq(nisp(ast, sandbox), "ok");
    });

    it("async", function () {
        var sandbox = {
            "get": async(function (v) {
                return sleep(13, v + this);
            }, Promise),
            "+": async(function (a, b) {
                return sleep(13).then(() => {
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
            "+": add,
            "get": function (a, b) {
                return a[b];
            },
            def
        };

        var json = [1];

        var code = encode`(do
            (def a ${json})
            (+ (get (a) 0) 2 ${Buffer.from("str")} 0)
        )`;

        return it.eq(exec(code, sandbox), "3str0");
    });

    it("grammar error", function () {
        var sandbox = {
            "+": add,
            "get": function (a, b) {
                return a[b];
            }
        };

        var json = { a : 1 };

        var code = encode`
            (+ (get ${json} "a") 2
        `

        try {
            it.eq(exec(code, sandbox), 3);
        } catch (err) {
            return it.eq(err.message, `Expected ")" but end of input found.`);
        }

        throw new Error();
    });
};