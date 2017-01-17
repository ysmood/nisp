import run, { macro } from '../core'

// ["if", <cond>, <exp1>, <exp2>]
export default macro((ctx) => {
    let { ast, sandbox, env } = ctx
    return run(
        ast[1],
        sandbox,
        env,
        ctx
    ) ? run(
        ast[2],
        sandbox,
        env,
        ctx
    ) : run(
        ast[3],
        sandbox,
        env,
        ctx
    )
});
