/*eslint-disable */

var nisp = require('../core');
var plain = require('../fn/plain');


var sandbox = {
    "def": require('../lang/def'),
    "do": require('../lang/do'),
    "`": require('../lang/plain'),
    "+": plain(function (args) {
        return args.reduce(function (s, n) { return s + n; });
    })
};

var expresses = ["do",
    [1]
];

console.log(nisp(expresses, sandbox)); // => 20
