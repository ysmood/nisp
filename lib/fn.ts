import run, { Sandbox, macro } from '../core'

// ["fn", [<arg1>, <arg2>, ...], <exp>]
export default macro((fnAst, fnSandbox: Sandbox, env, stack) => {
    return function () {
        // generate a closure
        var closure = assign({}, fnSandbox);
        var i, len, ret;

        // assign arguments to sandbox
        len = fnAst[1].length;
        for (i = 0; i < len; i++) {
            closure[fnAst[1][i]] = arguments[i];
        }

        return run(fnAst[2], closure, env, stack);
    };
})

function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}
