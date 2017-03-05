import { macro, arg } from '../core'

let root = typeof window === 'object' ? window : global

// ["fn", <arg1>, <arg2>, ...]
export default (fn, customPromise?) => {
    var P = customPromise || root['Promise']; // eslint-disable-line

    return macro(ctx => {
        let { ast } = ctx

        let syncedArgs = []
        let p = ast.length > 1 ?
            P.resolve(arg(ctx, 1))
            : P.resolve()

        let f = (i) => v => {
            syncedArgs.push(v)
            return arg(ctx, i)
        }

        for (let i = 2; i < ast.length; i++) {
            p = p.then(f(i))
        }

        return p.then(v => {
            if (ast.length > 1)
                syncedArgs.push(v)

            return fn.apply(ctx, syncedArgs)
        });
    })
}
