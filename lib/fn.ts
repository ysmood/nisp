import run, { macro, Context, error } from '../core'

export let maxStackSize = 17

function countStack (node: Context) {
    let count = 0
    while (node) {
        count++
        node = node.parent
    }
    return count
}

// ["fn", [<arg1>, <arg2>, ...], <exp>]
// There are two closures: one is when the function is created,
// another one is when the function is called.
export default macro((ctx) => {
    return function (this: Context) {
        if (countStack(this) > maxStackSize)
            error(this, 'call stack overflow')

        let { ast } = ctx

        // generate a closure sandbox based on the parent sandbox
        var closure = Object.create(ctx.sandbox)

        // overwrite arguments to closure
        for (let i = 0, len = ast[1].length; i < len; i++) {
            closure[ast[1][i]] = arguments[i];
        }

        return run(ast[2], closure, ctx.env, this, ctx.index);
    };
})
