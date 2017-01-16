import encode from '../lib/encode'
import exec from '../lib/exec'
import $do from '../lib/do'
import def from '../lib/def'

let add = function (...args) {
    return args.reduce(function (s, v) {
        return s += v;
    });
}

var sandbox = {
    do: $do,
    "+": add,
    "get" (a, b) {
        return a[b];
    },
    def
};

var json = [1];

var code = encode`(do
    (def a ${json})
    (+ (get (a) 0) 2 ${Buffer.from("str")} 0)
)`;

console.log(exec(code, sandbox))
