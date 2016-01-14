// ["fn", <arg1>, <arg2>, ...]
module.exports = function (fn) {
    return function (args, env, eval) {
        var plainArgs = [], len = args.length;
        for (var i = 1; i < len; i++) {
            plainArgs[i - 1] = eval(args[i], env);
        }

        return fn.apply(null, plainArgs);
    };
};
