function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}

module.exports = function (fnAst) {
    return function (ast, env, eval) {
        var closure = assign({}, env);
        var i, len, ret;

        len = fnAst[1].length;
        for (i = 0; i < len; i++) {
            closure[eval(fnAst[1][i], env)] = eval(ast[i + 1], env);
        }

        len = fnAst.length;
        for (i = 2; i < fnAst.length; i++) {
            ret = eval(fnAst[i], closure);
        }

        return ret;
    };
};
