import { isArray, isFunction } from './utils'

export interface Sandbox {
    macros?: {
        [name: string]: Function
    }
    [name: string]: any
}

interface Env {
    sandbox?: Sandbox
    run?: typeof run
}

function apply (fn, ast, env) {
    var plainArgs = [], len = ast.length;

    for (var i = 1; i < len; i++) {
        plainArgs[i - 1] = env.run(ast[i], env);
    }

    return fn.apply(env, plainArgs);
}

/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, env: Env) {
    if (!env) throw new TypeError("nisp env is required");
    if (!env.run) throw new TypeError("nisp env.run is required");

    var sandbox = env.sandbox
    if (!sandbox) throw new TypeError("nisp env.sandbox is required");

    if (isArray(ast)) {
        var macros = sandbox.macros
        var action = ast[0]
        var fn

        // handle raw data, this is the only builtin function
        if (action === "$")
            return ast[1];

        if (isFunction(action)) {
            return apply(action, ast, env)
        }

        if (action in sandbox) {
            fn = sandbox[action];
            return isFunction(fn) ? apply(fn, ast, env) : fn;
        } else if (macros && action in macros) {
            fn = macros[action]
            if (isFunction(fn)) {
                return fn(ast, env)
            } else {
                throw new TypeError(`nisp function ${action} is undefined, ast: ${JSON.stringify(ast)}`);
            }
        } else {
                throw new TypeError(`nisp macro ${action} is undefined, ast: ${JSON.stringify(ast)}`);
        }
    } else {
        return ast;
    }
}

/**
 * Eval an  ast
 * @param {any} ast A freezed world, pure and simple.
 * @param {Sandbox} sandbox The interface that directly connects to the real world.
 * It defined how to tranform the freezed world into the real world
 * @param {Env} env The system space of the vm
 * @return {any}
 */
export default function (ast, sandbox: Sandbox, env: Env = {}) {
    env.run = run
    env.sandbox = sandbox

    return run(ast, env);
};