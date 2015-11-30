function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}

module.exports = function (fnArgs) {
    return function (args, env, eval) {
        var closure = assign({}, env);
        var i, len, ret;

        len = fnArgs[1].length;
        for (i = 0; i < len; i++) {
            closure[eval(fnArgs[1][i], env)] = eval(args[i + 1], env);
        }

        len = fnArgs.length;
        for (i = 2; i < fnArgs.length; i++) {
            ret = eval(fnArgs[i], closure);
        }

        return ret;
    };
};
