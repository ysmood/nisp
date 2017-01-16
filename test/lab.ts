import nisp from '../core'
import encode from '../lib/encode'
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
    atob: (v) => Buffer.from(v, 'base64'),
    "get" (a, b) {
        return a[b];
    },
    def
};

var json = {a: [1]};

var code = encode`(do
    (def a ${json})
    (+ (get (a) 0) 2 ${Buffer.from("str")} 0)
)`;

console.log(nisp({
    ast: JSON.parse(code), sandbox
}))
