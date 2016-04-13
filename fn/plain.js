// ["fn", <arg1>, <arg2>, ...]
module.exports = function (fn) {
    return function (run, args, sandbox, env) {
        var plainArgs = [], len = args.length;

        for (var i = 1; i < len; i++) {
            plainArgs[i - 1] = run(args[i], sandbox, env);
        }

        return fn(plainArgs, env, sandbox, args);
    };
};
