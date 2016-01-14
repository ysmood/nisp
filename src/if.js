// ["if", <cond>, <exp1>, <exp2>]
module.exports = function (ast, env, run) {
    return run(ast[1], env) ?
        run(ast[2], env) :
        run(ast[3], env);
};
