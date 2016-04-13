module.exports = function (run, ast, sandbox, env) {
    return sandbox[run(ast[1], sandbox, env)] = run(ast[2], sandbox, env);
};
