import run, { macro } from '../core'

export default macro(ctx => {
    let { ast, sandbox, env } = ctx
    var key = run(ast[1], sandbox, env, ctx);

    return sandbox[key] = run(
       ast[2], sandbox, env, ctx
    );
});
