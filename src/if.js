module.exports = function (args, env, eval) {
    return eval(args[1], env) ?
        eval(args[2], env) :
        eval(args[3], env);
};
