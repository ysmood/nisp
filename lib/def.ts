import run, { Sandbox, macro } from '../core'

export default macro((ast, sandbox: Sandbox, env, stack) => {
    var key = run(ast[1], sandbox, env, stack);

    return sandbox[key] = run(ast[2], sandbox, env, stack);
});
