import { isArray, isFunction } from './utils'

/**
 * Eval a expression with specific env.
 * @param  {Array} ast The ast of the program.
 * @param  {Object} env key/value object.
 * @return {Any} The computed value.
 */
function run (ast, sandbox: Sandbox, env: {}) {
    if (!env) throw new TypeError("nisp env is required");
    if (!sandbox) throw new TypeError("nisp sandbox is required");

    if (isArray(ast)) {
        // handle raw data, this is the only builtin function
        if (ast[0] === "$")
            return ast[1];

        var action = run(ast[0], sandbox, env);

        if (isFunction(action)) {
            return action(run, ast, sandbox, env);
        }

        if (action in sandbox) {
            var fn = sandbox[action];
            return isFunction(fn) ? fn(run, ast, sandbox, env) : fn;
        } else {
            throw new TypeError("nisp '" + action + "' is undefined, ast: " + JSON.stringify(ast));
        }
    } else {
        return ast;
    }
}

export interface Sandbox {
    [name: string]: Function
}

/**
 * Eval an  ast
 * @param {any} ast A freezed world, pure and simple.
 * @param {Sandbox} sandbox The interface that directly connects to the real world.
 * It defined how to tranform the freezed world into the real world
 * @param {Object} env The system space of the vm
 * @return {Any}
 */
export default function (ast, sandbox: Sandbox, env = {}) {
    return run(ast, sandbox, env);
};