function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}

module.exports = function (fnArgs) {
    return function (args, env, eval) {
        var closure = assign({}, env);
        var len = fnArgs[1].length;

        for (var i = 0; i < len; i++) {
            closure[eval(fnArgs[1][i], env)] = eval(args[i + 1], env);
        }

        return eval(fnArgs[2], closure);
    };
};
