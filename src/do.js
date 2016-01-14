// ["do", <exp1>, <exp2>, ...]
module.exports = function (ast, env, eval) {
    var ret, len = ast.length;
    for (var i = 1; i < len; i++) {
        ret = eval(ast[i], env);
    }

    return ret;
};
