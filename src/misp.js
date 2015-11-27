function isArray (obj) {
    return typeof obj === "object" && typeof obj.length === "number";
}

function evalExp (exp, env) {
    if (arguments.length < 2) throw new TypeError("env is required")

    if (!isArray(exp)) {
        return exp in env ? env[exp] : exp;
    }

    var action = exp[0];

    // eval lambda
    // [envFn, ...args]
    if (action in env) {
        var len = exp.length;
        var val = env[action];
        return typeof val === 'function' ? val(exp.slice(1), env, evalExp) : val;
    }

    // nothing to do
    return evalExp(action, env);
}

module.exports = function misp (ast, env) {
    var ret, len = ast.length;

    if (arguments.length === 1) env = {};

    for (var i = 0; i < len; i++) {
        ret = evalExp(ast[i], env);
    }

    return ret;
}