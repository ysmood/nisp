import run, { macro } from '../core'

export default macro(ctx => {
    let { ast, sandbox, env } = ctx
    var key = run({
        ast: ast[1], sandbox, env, parent: ctx
    });

    return sandbox[key] = run({
       ast: ast[2], sandbox, env, parent: ctx
    });
});
