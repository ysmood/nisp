import nisp from '../core'
import encode from '../lib/encode'
import $do from '../lib/do'
import def from '../lib/def'
import $ from '../lib/$'

let add = function (...args) {
    return args.reduce(function (s, v) {
        return s += v;
    });
}

var sandbox = {
    do: $do,
    "+": add,
    $,
    atob: (v) => Buffer.from(v, 'base64'),
    "get" (a, b) {
        return a[b];
    },
    def
};

console.log(
    nisp(
        encode`(+ 1 2 ${new Buffer([97])})`,
        sandbox
    )
)