// ["list", a, b, c, ...]
module.exports = function (run, ast, sandbox, env) {
    var arr = [];

    for (var i = 1; i < ast.length; i++) {
        arr.push(run(ast[i], sandbox, env));
    }

    return arr;
};
