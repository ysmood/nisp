// ["do", <exp1>, <exp2>, ...]
module.exports = function (ast, env, run) {
    var ret, len = ast.length;
    for (var i = 1; i < len; i++) {
        ret = run(ast[i], env);
    }

    return ret;
};
