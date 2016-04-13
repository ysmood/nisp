module.exports = function (run, ast, sandbox, env) {
    var key;
    if (typeof ast[1] === "string")
        key = ast[1];
    else
        key = run(ast[1], sandbox, env);

    return sandbox[key] = run(ast[2], sandbox, env);
};
