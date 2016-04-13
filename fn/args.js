
// The function make the all the evaluation completely lazy.
module.exports = function (fn) {
    return function (run, ast, sandbox, env) {
        return fn(function (index) {
            return run(ast[index + 1], sandbox, env);
        }, env, sandbox, ast);
    };
};
