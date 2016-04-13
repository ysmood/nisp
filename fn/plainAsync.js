
// ["fn", <arg1>, <arg2>, ...]
module.exports = function (fn, customPromise) {
    var P = customPromise || Promise; // eslint-disable-line

    return function (run, args, sandbox, env) {
        var plainArgs = [], len = args.length;
        for (var i = 1; i < len; i++) {
            plainArgs[i - 1] = run(args[i], sandbox, env);
        }

        return P.all(plainArgs).then(function (syncedArgs) {
            return fn(syncedArgs, env, sandbox, args);
        });
    };
};
