/*eslint-disable */

var nisp = require('../core');
var plain = require('../fn/plain');

var sandbox = {
    "+": plain(function (args) {
        return args.reduce(function (s, n) { return s + n; });
    })
};

var expresses = ["+", 1, 2, 3];

console.log(nisp(expresses, sandbox)); // => 20
