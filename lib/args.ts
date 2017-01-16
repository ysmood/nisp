import run, { macro } from '../core'

export default function (fn) {
    return macro(ctx => {
        function arg (index) {
            let { ast, sandbox, env } = ctx
            return run({
                ast: ast[index + 1],
                sandbox: sandbox,
                env: env,
                parent: ctx
            })
        }

        return fn(arg)
    });
};
