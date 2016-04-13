// ["do", <exp1>, <exp2>, ...]
module.exports = function (run, ast, sandbox, env) {
    var arr = [], len = ast.length;
    for (var i = 1; i < len; i++) {
        arr = arr.concat(run(ast[i], sandbox, env));
    }

    return arr;
};
