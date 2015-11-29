function isArray (obj) {
    return typeof obj === "object" && typeof obj.length === "number";
}

function isFunction (obj) {
    return typeof obj === "function";
}

/**
 * Eval a expression with specific env.
 * @param  {Array} exp Expression.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function eval (exp, env) {
    if (arguments.length < 2) throw new TypeError("env is required")

    if (!isArray(exp)) {
        return exp in env ? env[exp] : exp;
    }

    var action = exp[0];

    // eval fn
    // [envFn, ...args]
    if (action in env) {
        var len = exp.length;
        var val = env[action];
        return isFunction(val) ? val(exp.slice(1), env, eval) : val;
    } else {
        return eval(action, env);
    }
}

module.exports = function (ast, env) {
    var ret, len = ast.length;

    if (arguments.length === 1) env = {};

    // The main loop
    for (var i = 0; i < len; i++) {
        ret = eval(ast[i], env);
    }

    return ret;
}