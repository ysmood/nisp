/*eslint-disable */

var nisp = require('../core');


var sandbox = {
    "def": require('../lang/def'),
    "": require('../lang/plain'),
    "fn": require('../lang/fn'),
    "$": require('../lang/get'),
    "do": require('../lang/do'),
    a: 100
};

var expresses = ["b", 1]

console.log(nisp(expresses, sandbox)); // => 20
