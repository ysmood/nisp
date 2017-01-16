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

    let args = [], len = ast.length;

    for (let i = 1; i < len; i++) {
        args[i - 1] = run(ast[i], sandbox, env, stack);
    }

    return fn.apply(env, args);
}

function error (msg: string, stack: any[]) {
    throw new TypeError(
        `[nisp] ${msg}\n`
        + `stack: ${JSON.stringify(stack)}`
    );
}

function run (ast, sandbox: Sandbox, env, stack: any[]) {
    if (!sandbox) error("sandbox is required", stack);

    if (isArray(ast)) {
        let action = ast[0]

        // handle raw data, this is the only builtin function
        if (action === "$")
            return ast[1];

        action = run(action, sandbox, env, stack)

        if (stack) stack = stack.concat(action)

        if (isFunction(action)) {
            return apply(action, ast, sandbox, env, ast[0])
        }

        if (action in sandbox) {
            let fn = sandbox[action];
            return isFunction(fn) ? apply(fn, ast, sandbox, env, stack) : fn;
        } else {
            error(`function "${action}" is undefined`, stack);
        }
    } else {
        return ast;
    }
}

/**
 * Eval an nisp ast
 * @param {any} ast The abstract syntax tree of nisp
 * @param {Sandbox} sandbox The interface to the real world.
 * It defined functions to reduce the data of each expression.
 * There's only one builtin function `$`, you cannot overwrite it, it is used to
 * mark raw data, the object follow by it will not be handled by the vm.
 * @param {Object} env The system space of the vm.
 * @param {any[]} stack Stack info, if you want to boost the performance
 * You can pass in `null` to disable the stack tracing.
 * @return {any}
 */
export default function (ast, sandbox: Sandbox, env?, stack = []) {
    return run(ast, sandbox, env, stack);
};