function isArray (obj) {
    return typeof obj === "object" && typeof obj.length === "number";
}

function evalExp (exp, env) {
    if (!isArray(exp)) {
        return exp in env ? env[exp] : exp;
    }

    var action = exp[0];

    // define variable
    // ["$", "name", exp]
    if (action === "$") {
        return env[exp[1]] = evalExp(exp[2], env);
    }

    // lambda
    // ["@", [...args], exp]
    if (action === "@") {
        return function () {
            var len = arguments.length;
            var closure = {};

            for (var k in env) {
                closure[k] = env[k];
            }
            for (var i = 0; i < len; i++) {
                closure[exp[1][i]] = arguments[i];
            }

            return evalExp(exp[2], closure);
        };
    }

    // condition
    // ["?", expCond, expTrue, expFalse]
    if (action === "?") {
        return evalExp(exp[1], env) ?
            evalExp(exp[2], env) :
            evalExp(exp[3], env);
    }

    // plain data
    // ["`", data]
    if (action === "`") {
        return exp[1];
    }

    if (typeof action === "function") {
        return val.apply(0, args)
    }

    // eval lambda
    // [envFn, ...args]
    if (action in env) {
        var len = exp.length;
        var args = [];
        for (var i = 1; i < len; i++) {
            args.push(evalExp(exp[i], env));
        }

        var val = env[action];
        return typeof val === 'function' ? val.apply(0, args) : val;
    }

    // nothing to do
    return evalExp(action, env);
}

module.exports = function misp (ast, env) {
    var ret, len = ast.length;

    if (isArray(ast)) {
        for (var i = 0; i < len; i++) {
            var exp = ast[i];
            ret = isArray(exp) ? evalExp(exp, env) : exp;
        }
    } else {
        ret = ast;
    }

    return ret;
}