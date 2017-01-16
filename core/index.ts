import { isArray, isFunction } from './utils'

export interface Sandbox {
    [name: string]: any
}

export interface Run {
    (ast, sandbox: Sandbox, env, stack: any[])
}

export interface Fn {
    (...args)
    macro?: typeof macro
}

// To safely mark a function as macro function
export function macro (fn: Run) {
    return Object.defineProperty(fn, 'macro', {
        configurable: false,
        value: macro
    })
}

function apply (fn: Fn, ast, sandbox, env, stack: any[]) {
    if (fn.macro === macro)
        return fn(ast, sandbox, env, stack)

    var args = [], len = ast.length;

    for (var i = 1; i < len; i++) {
        args[i - 1] = run(ast[i], sandbox, env, stack);
    }

    return fn.apply(env, args);
}

function error (msg: string, stack: any[]) {
    throw new TypeError(
        `[nisp] ${msg}\nstack: ${JSON.stringify(stack)}`
    );
}

/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, sandbox: Sandbox, env, stack: any[]) {
    if (!env) error("nisp env is required", stack);
    if (!sandbox) error("nisp env.sandbox is required", stack);

    if (isArray(ast)) {
        var action = run(ast[0], sandbox, env, stack)
        var fn

        if (stack) stack = stack.concat(action)

        // handle raw data, this is the only builtin function
        if (action === "$")
            return ast[1];

        if (isFunction(action)) {
            return apply(action, ast, sandbox, env, ast[0])
        }

        if (action in sandbox) {
            fn = sandbox[action];
            return isFunction(fn) ? apply(fn, ast, sandbox, env, stack) : fn;
        } else {
            error(`function "${action}" is undefined`, stack);
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
 * @param {Object} env The system space of the vm
 * @param {any[]} stack Stack info
 * @return {any}
 */
export default function (ast, sandbox: Sandbox, env = {}, stack = []) {
    return run(ast, sandbox, env, stack);
};