import { isArray, isFunction } from './utils'

export interface Sandbox {
    [name: string]: Fn
}

export interface Fn {
    (...args)
    macro?: typeof macro
}

export interface Nisp {
    (ctx: Context)
}

// To safely mark a function as macro function
export function macro (fn: Nisp) {
    return Object.defineProperty(fn, 'macro', {
        configurable: false,
        value: macro
    })
}

export interface Context {
    /**
     * The abstract syntax tree of nisp.
     */
    ast: any

    /**
     * The interface to the real world.
     * It defined functions to reduce the data of each expression.
     * There's only one builtin function `$`, you cannot overwrite it, it is used to
     * mark raw data, the object follow by it will not be handled by the vm.
     */
    sandbox: Sandbox

    /**
     * The system space of the vm.
     */
    env?: any

    /**
     * Parent context, it is used to back trace the execution stack.
     */
    parent?: Context
}

function apply (fn: Fn, ctx: Context) {
    if (fn.macro === macro)
        return fn(ctx)

    let args = [], len = ctx.ast.length;

    for (let i = 1; i < len; i++) {
        args[i - 1] = nisp({
            ast: ctx.ast[i],
            sandbox: ctx.sandbox,
            env: ctx.env,
            parent: ctx
        });
    }

    return fn.apply(ctx, args);
}

function error (ctx: Context, msg: string) {
    throw new TypeError(
        `[nisp] ${msg}\n`
        + ctx
    );
}

function nisp (ctx: Context) {
    if (!ctx) error(ctx, "ctx is required");

    let { sandbox, ast } = ctx

    if (!sandbox) error(ctx, "sandbox is required");

    if (isArray(ast)) {
        let action = ast[0]

        // handle raw data, this is the only builtin function
        if (action === "$")
            return ast[1];

        action = nisp({
            ast: action,
            sandbox: sandbox,
            env: ctx.env
        })

        if (isFunction(action)) {
            return apply(action, ctx)
        }

        if (action in sandbox) {
            let fn = sandbox[action];
            return isFunction(fn) ? apply(fn, ctx) : fn;
        } else {
            error(ctx, `function "${action}" is undefined`);
        }
    } else {
        return ast;
    }
}

/**
 * Eval an nisp ast
 */
export default nisp