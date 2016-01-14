// ["def", <name>, <value>]
module.exports = function (ast, env, run) {
    return env[run(ast[1], env)] = run(ast[2], env);
};
