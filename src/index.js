function isArray (obj) {
    return typeof obj === "object" && typeof obj.length === "number";
}

function isFunction (obj) {
    return typeof obj === "function";
}

/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function eval (ast, env) {
    if (arguments.length < 2) throw new TypeError("env is required");

    if (!isArray(ast)) {
        return ast in env ? env[ast] : ast;
    }

    var action = ast[0];

    if (action in env) {
        var val = env[action];
        return isFunction(val) ? val(ast, env, eval) : val;
    } else {
        return eval(action, env);
    }
}

/**
 * Eval a list of ast
 * @param  {Array} astList
 * @param  {Object} env
 * @return {Any}
 */
module.exports = function (astList, env) {
    if (arguments.length < 2) env = {};

    // The main loop
    var ret, len = astList.length;
    for (var i = 0; i < len; i++) {
        ret = eval(astList[i], env);
    }

    return ret;
};
