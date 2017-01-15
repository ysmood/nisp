import run, { Sandbox, macro } from '../core'

// ["if", <cond>, <exp1>, <exp2>]
export default macro((ast, sandbox: Sandbox, env, stack) => {
    return run(ast[1], sandbox, env, stack) ?
        run(ast[2], sandbox, env, stack) :
        run(ast[3], sandbox, env, stack)
});
