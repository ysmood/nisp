// ["if", <cond>, <exp1>, <exp2>]
module.exports = function (run, ast, sandbox, env) {
    return run(ast[1], sandbox, env) ?
        run(ast[2], sandbox, env) :
        run(ast[3], sandbox, env);
};
