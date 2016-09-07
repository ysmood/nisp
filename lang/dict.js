// ["list", k1, v1, k2, v2, ...]
module.exports = function (run, ast, sandbox, env) {
    var dict = {};

    for (var i = 1, j; i < ast.length; i = ++j) {
        j = i + 1;
        dict[run(ast[i], sandbox, env)] = run(ast[j], sandbox, env);
    }

    return dict;
};
