// ["def", <name>, <value>]
module.exports = function (ast, env, run) {
    if (!env.dict) env.dict = {};
    return env.dict[run(ast[1], env)] = run(ast[2], env);
};
