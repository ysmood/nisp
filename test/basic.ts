import nisp, { Context, error, NispError } from "../core"
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
import encode from '../lib/encode'
import decode from '../lib/decode'
import format from '../lib/format'


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

    it("empty", function () {
        return it.eq(nisp([], {}), undefined);
    });

    it("symbol undefined", function () {
        try {
            nisp([1, 2], {});
            throw new Error("should throw error");
        } catch (err) {
            return it.eq(err.message, `function "1" is undefined`);
        }
    });

    it("plain", function () {
        return it.eq(nisp(['$', [1, "ok"]], { $ }), [1, "ok"]);
    });

    it("env", function () {
        var sandbox = {
            env: function (this: Context) {
                return this.env;
            }
        };

        var env = "ok";

        return it.eq(nisp(["env"], sandbox, env), "ok");
    });

    it("throw error", function () {
        var sandbox = {
            foo: function (this: Context) {
                return error(this, 'err');
            }
        };

        try {
            nisp(["foo"], sandbox)
        } catch (e) {
            let err = e as NispError
            return it.eq(
                err + '',
                `nisp error: err\nstack: [\n    \"foo\",\n    0\n]`
            )
        }

        throw new Error()
    });

    it("args", function () {
        var sandbox = {
            '+': args((arg) => {
                return arg(0) + arg(1);
            })
        };

        return it.eq(nisp(['+', 1, 2], sandbox), 3);
    });

    it("err stack", function () {
        var sandbox = {
            '+': args((arg) => {
                return arg(0) + arg(1);
            })
        };

        let ast = ['+', 1, ['+', 1, ['foo']]]

        try {
            nisp(ast, sandbox)
        } catch (err) {
            return it.eq(
                [err instanceof NispError, err.stack],
                [true, [ 'foo', 2, '+', 2, '+', 0 ]]
            )
        }

        throw Error('err')
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
            "|": list,
            "+": add
        };

        var ast = ["|", 1, ["+", 1, 1], 3];

        return it.eq(nisp(ast, sandbox), [1, 2, 3]);
    });

    it("dict", function () {
        var sandbox = {
            ":": dict,
            "+": add
        };

        var ast = [":",
            "a", 1,
            "b", ["+", 1, 1],
            "c", 3
        ];

        return it.eq(nisp(ast, sandbox), { a: 1, b: 2, c: 3 });
    });

    it("dict odd", function () {
        var sandbox = {
            ":": dict,
            "+": add
        };

        var ast = [":",
            "a", 1,
            "b", 2,
            "c"
        ];
        try {
            nisp(ast, sandbox)
            
        } catch (err) {
            return it.eq(err.message, `the amount keys and values should be same`);
        }

        throw new Error();    
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
            ["def", "a", 10],
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

    it("custom fn call stack overflow", function () {
        var sandbox = {
            "do": $do,
            def,
            "@": fn
        };

        var ast = ["do",
            ["def", "foo",
                ["@", [], ["foo"]]
            ],
            ["foo"]
        ];

        try {
            nisp(ast, sandbox)
        } catch (err) {
            return it.eq(
                err.message,
                'call stack overflow'
            );
        }

        throw new Error('should throw error')
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
            "get": async(function (this: Context, v) {
                this.env.c = Math.pow(this.env.c, v)
                return sleep(v, this.env.c)
            }),
            "+": async(function (a, b) {
                return sleep(13).then(() => {
                    return a + b;
                });
            }, Promise)
        };

        var ast = ["+", ["get", 3], ["get", 2]];

        return it.eq(nisp(ast, sandbox, { c: 2 }), 72);
    });

    it('decode', function () {
        let obj = {
            a: 10,
            b: 20,
            c: -3.101,
            d: [1,
                true,
                'true',
                false,
                'false',
                null,
                'null',
                `'\r\n"`,
                2,
                { s: 1 }
            ]
        }
        let ast = encode([decode(obj)] as any)

        var sandbox = {
            ':': dict,
            '|': list
        }

        return it.eq(nisp(ast, sandbox), obj)
    })

    it('format', function () {
        let obj = {
            a: 10,
            b: 20,
            c: -3.101,
            d: [1,
                true,
                'true',
                false,
                'false',
                null,
                'null',
                `'\r\n"`,
                2,
                { s: 1 }
            ]
        }
        let ast = encode([format(decode(obj))] as any)

        var sandbox = {
            ':': dict,
            '|': list
        }

        return it.eq(nisp(ast, sandbox), obj)
    })

    it("grammar", function () {
        var sandbox = {
            do: $do,
            "+": add,
            $,
            "get": function (a, b) {
                return a[b];
            },
            def
        };

        var json = [1];

        var code = encode`(do
            (def a ${json})
            (def b ())
            (+ (get (a) 0) 2 ${Buffer.from("str")} 0 (b))
        )`;

        return it.eq(nisp(code, sandbox), "3str0undefined");
    });

    it("grammar data type", function () {
        var json = encode`(1 test 'a\\'a' true false null)`;

        return it.eq(json, [1, 'test', `a'a`, true, false, null]);
    });

    it("grammar error", function () {
        try {
            encode`(+ (get 123 "a") 2`
        } catch (err) {
            return it.eq(err.message, `Expected ")" or value but end of input found.`);
        }

        throw new Error();
    });
};
