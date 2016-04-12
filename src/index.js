/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, env) {
    if (!env) throw new TypeError("env is required");

    if (isArray(ast)) {
        var action = run(ast[0], env);

        if (isFunction(action)) return action(ast, env, run);

        if (action in env) {
            var val = env[action];
            return isFunction(val) ? val(ast, env, run) : val;
        } else {
            return run(action, env);
        }
    } else {
        return ast in env ? env[ast] : ast;
    }
}

/**
 * Eval an  ast
 * @param  {Array} ast
 * @param  {Object} env
 * @return {Any}
 */
module.exports = function (ast, env) {
    if (!env) env = {};

    return run(ast, env);
};

function isArray (obj) {
    return typeof obj === "object" && obj !== null && typeof obj.length === "number";
}

function isFunction (obj) {
    return typeof obj === "function";
}

