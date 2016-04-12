
// The function make the all the evaluation completely lazy.
module.exports = function (fn) {
    return function (ast, env, run) {
        return fn(function (index) {
            return run(ast[index + 1], env);
        });
    };
};
