/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, sandbox, env) {
    if (!env) throw new TypeError("env is required");
    if (!sandbox) throw new TypeError("sandbox is required");

    if (isArray(ast)) {
        var action = run(ast[0], sandbox, env);

        if (isFunction(action)) {
            return action(run, ast, sandbox, env);
        }

        // If the current action is in the pre-defined env,
        // else we try to eval each item.
        if (action in sandbox) {
            var fn = sandbox[action];
            return isFunction(fn) ? fn(run, ast, sandbox, env) : fn;
        } else {
            return ast;
        }
    } else {
        return ast in sandbox ? sandbox[ast] : ast;
    }
}

/**
 * Eval an  ast
 * @param  {Array} ast A freezed world, pure and simple.
 * @param  {Object} env The interface that directly connects to the real world.
 * It defined how to tranform the freezed world into the real world
 * @return {Any}
 */
module.exports = function (ast, sandbox, env) {
    if (!sandbox) sandbox = {};
    if (!env) env = {};

    return run(ast, sandbox, env);
};

function isArray (obj) {
    return typeof obj === "object" && obj !== null && typeof obj.length === "number";
}

function isFunction (obj) {
    return typeof obj === "function";
}
