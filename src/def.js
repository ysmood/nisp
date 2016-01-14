// ["def", <name>, <value>]
module.exports = function (ast, env, eval) {
    return env[eval(ast[1], env)] = eval(ast[2], env);
};
