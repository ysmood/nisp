/*eslint-disable */

var nisp = require("../core");
var Promise = require("yaku");
var yutils = require("yaku/lib/utils");


var fns = {
    plain: require("../fn/plain"),
    plainSpread: require("../fn/plainSpread"),
    plainAsync: require("../fn/plainAsync"),
    plainAsyncSpread: require("../fn/plainAsyncSpread"),
    args: require("../fn/args")
};


var langs = {
    do: require("../lang/do"),
    if: require("../lang/if"),
    plain: require("../lang/plain"),
    def: require("../lang/def"),
    fn: require("../lang/fn"),
    list: require("../lang/list"),
    dict: require("../lang/dict"),

    add: fns.plain(function (args) {
        return args.reduce(function (s, v) {
            return s += v;
        });
    })
};

// var tpl = nisp.new`
//     ( add 1 ${Buffer.from('str')} )
// `;


// console.log(tpl(langs))