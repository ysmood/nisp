import run, { macro } from '../core'

export default function (fn) {
    return macro((ast, sandbox, env, stack) => {
        function arg (index) {
            return run(ast[index + 1], sandbox, env, stack)
        }

        return fn(arg)
    });
};
