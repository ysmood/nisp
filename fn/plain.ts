export default function (fn) {
    return function (run, args, sandbox, env) {
        var plainArgs = [], len = args.length;

        for (var i = 1; i < len; i++) {
            if (typeof Buffer !== "undefined" && Buffer.isBuffer(args[i])) {
                plainArgs[i - 1] = args[i];
            } else {
                plainArgs[i - 1] = run(args[i], sandbox, env);
            }
        }

        return fn(plainArgs, args);
    };
};
