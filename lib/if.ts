import run, { macro } from '../core'

// ["if", <cond>, <exp1>, <exp2>]
export default macro((ctx) => {
    let { ast, sandbox, env } = ctx
    return run({
        ast: ast[1],
        sandbox,
        env,
        parent: ctx
    }) ? run({
        ast: ast[2],
        sandbox,
        env,
        parent: ctx
    }) : run({
        ast: ast[3],
        sandbox,
        env,
        parent: ctx
    })
});
