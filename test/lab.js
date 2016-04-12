/*eslint-disable */

var nisp = require("../src");
var plainAsyncFn = require("../src/plainAsyncFn");
var Promise = require('yaku');
function waitNumber (val) {
    return new Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), 1000);
    });
};

var env = {
    "download": plainAsyncFn(function () {
        return waitNumber(1);
    }),

    "+": plainAsyncFn(function (a, b) {
        return a + b;
    })
};

var expresses = ["+", ["download"], ["download"]];

nisp(expresses, env).then(function (out) {
    console.log(out) // => 2
});
