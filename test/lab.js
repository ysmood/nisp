/*eslint-disable */

var nisp = require("../core");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");

var sandbox = {
    do: require("../lang/do"),
    def: require("../lang/def"),
    if: require("../lang/if")
};

var code = nisp.encode`(do
    (def "a" 10)
)`;

console.log(nisp.exec(code, sandbox)); // => 20
