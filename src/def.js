module.exports = function (args, env, eval) {
    return env[eval(args[1], env)] = eval(args[2], env);
};
