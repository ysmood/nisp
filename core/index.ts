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
    ast: any
    sandbox: Sandbox
    env?: any
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

/**
 * Throw error with stack info
 */
export let error = function (ctx: Context, msg: string, err: any = Error) {
    let stack = []
    let node = ctx

    while(node) {
        stack.push(node.ast[0])
        node = node.parent
    }

    throw new err(
        `[nisp] ${msg}\n`
        + `stack: ` + JSON.stringify(stack, null, 4)
    )
}

function nisp (ctx: Context) {
    if (!ctx) error(ctx, "ctx is required", TypeError);

    let { sandbox, ast } = ctx

    if (!sandbox) error(ctx, "sandbox is required", TypeError);

    if (isArray(ast)) {
        let action = ast[0]

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
            error(ctx, `function "${action}" is undefined`, TypeError);
        }
    } else {
        return ast;
    }
}


/**
 * Eval an nisp ast
 * @param {any} ast The abstract syntax tree of nisp.
 * It's a common flaw that array cannot carry plain data,
 * such as `['foo', [1,2]]`, The `1` will be treat as a function name.
 * So it's recommended to use object to carry plain data,
 * such as translate the example to `['foo', { data: [1, 2] }]`.
 * @param {Sandbox} sandbox The interface to the real world.
 * It defined functions to reduce the data of each expression.
 * @param {any} env The system space of the vm.
 * @param {any} parent Parent context, it is used to back trace the execution stack.
 */
export default function (ast: any, sandbox: Sandbox, env?, parent?) {
    return nisp({ ast, sandbox, env, parent })
}
