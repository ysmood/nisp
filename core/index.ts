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
    ast: any[]
    sandbox: Sandbox
    env?: any
    parent?: Context
    index?: number
}

function apply (fn: Fn, ctx: Context) {
    if (fn.macro === macro)
        return fn(ctx)

    let args = [], len = ctx.ast.length;

    for (let i = 1; i < len; i++) {
        args[i - 1] = arg(ctx, i)
    }

    return fn.apply(ctx, args);
}

/**
 * Get nth argument value
 */
export function arg (ctx: Context, index: number): any {
    return nisp({
        ast: ctx.ast[index],
        sandbox: ctx.sandbox,
        env: ctx.env,
        parent: ctx,
        index: index,
    })
}

export class NispError extends Error {
    nispStack: any[]

    constructor (msg: string, stack: any[]) {
        super(msg)
        this.nispStack = stack

        this.toString = () => {
            return `nisp ${this.message}\n` +
                `stack: ` + JSON.stringify(this.nispStack, null, 4)
        }
    }
}

/**
 * Throw error with stack info
 */
export let error = function (ctx: Context, msg: string) {
    let stack = []
    let node = ctx
    let max = 100

    while(node && max-- > 0) {
        stack.push(node.ast[0], node.index)
        node = node.parent
    }

    throw new NispError(msg, stack)
}

function nisp (ctx: Context) {
    if (!ctx) error(ctx, "ctx is required");

    let { sandbox, ast } = ctx

    if (!sandbox) error(ctx, "sandbox is required");

    if (isArray(ast)) {
        if (ast.length === 0) return

        let action = arg(ctx, 0)

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
export default function (ast: any, sandbox: Sandbox, env?, parent?: Context, index = 0) {
    return nisp({ ast, sandbox, env, parent, index })
}
