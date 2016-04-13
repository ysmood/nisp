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

        if (isFunction(action)) {
            return action(ast, env, run);
        }

        // If the current action is in the pre-defined env,
        // else we try to eval each item.
        if (action in env) {
            var fn = env[action];
            return isFunction(fn) ? fn(ast, env, run) : fn;
        } else {
            var out = [];

            for (var i = 0; i < ast.length; i++) {
                out.push(run(ast[i], env));
            }

            return out;
        }
    } else {
        return ast in env ? env[ast] : ast;
    }
}

/**
 * Eval an  ast
 * @param  {Array} ast A freezed world, pure and simple.
 * @param  {Object} env The interface that directly connects to the real world.
 * It defined how to tranform the freezed world into the real world
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
