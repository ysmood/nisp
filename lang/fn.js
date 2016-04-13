
// ["fn", [<arg1>, <arg2>, ...], <exp1>, <exp2>, ...]
module.exports = function (run, fnAst, sandbox, env) {
    return function (run, ast) {
        // generate a closure
        var closure = assign({}, sandbox);
        var i, len, ret;

        // assign arguments to sandbox
        len = fnAst[1].length;
        for (i = 0; i < len; i++) {
            closure[run(fnAst[1][i], sandbox, env)] = run(ast[i + 1], sandbox, env);
        }

        // run the function
        len = fnAst.length;
        for (i = 2; i < fnAst.length; i++) {
            ret = run(fnAst[i], closure, env);
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

