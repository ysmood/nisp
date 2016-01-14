
// ["fn", <arg1>, <arg2>, ...]
module.exports = function (fn, customPromise) {
    var P = customPromise || Promise;
    fn = spread(fn);

    return function (args, env, eval) {
        var plainArgs = [], len = args.length;
        for (var i = 1; i < len; i++) {
            plainArgs[i - 1] = eval(args[i], env);
        }

        return P.all(plainArgs).then(fn);
    };
};

function spread (fn) {
    return function (args) {
        return fn.apply(null, args);
    };
}
