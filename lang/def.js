module.exports = function (run, ast, sandbox, env) {
    var key = run(ast[1], sandbox, env);

    return sandbox[key] = run(ast[2], sandbox, env);
};
