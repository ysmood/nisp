/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, env) {
    if (arguments.length < 2) throw new TypeError("env is required");

    if (!isArray(ast)) {
        return ast in env ? env[ast] : ast;
    }

    var action = ast[0];

    if (action in env) {
        var val = env[action];
        return isFunction(val) ? val(ast, env, run) : val;
    } else {
        return run(action, env);
    }
}

/**
 * Eval an  ast
 * @param  {Array} ast
 * @param  {Object} env
 * @return {Any}
 */
module.exports = function (ast, env) {
    if (arguments.length < 2) env = {};

    return run(ast, env);
};

function isArray (obj) {
    return typeof obj === "object" && typeof obj.length === "number";
}

function isFunction (obj) {
    return typeof obj === "function";
}

