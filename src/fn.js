
// ["fn", [<arg1>, <arg2>, ...], <exp1>, <exp2>, ...]
module.exports = function (fnAst) {
    return function (ast, env, run) {
        // generate a closure
        var closure = assign({}, env);
        var i, len, ret;

        // assign arguments to closure
        len = fnAst[1].length;
        for (i = 0; i < len; i++) {
            closure[run(fnAst[1][i], env)] = run(ast[i + 1], env);
        }

        // run the function
        len = fnAst.length;
        for (i = 2; i < fnAst.length; i++) {
            ret = run(fnAst[i], closure);
        }

        return ret;
    };
};

function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}

