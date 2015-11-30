module.exports = function (ast, env, eval) {
    return eval(ast[1], env) ?
        eval(ast[2], env) :
        eval(ast[3], env);
};
