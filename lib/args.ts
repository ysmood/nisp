import run, { macro } from '../core'

export default function (fn) {
    return macro(ctx => {
        function arg (index) {
            let { ast, sandbox, env } = ctx
            return run(
                ast[index + 1],
                sandbox,
                env,
                ctx
            )
        }

        return fn(arg)
    });
};
