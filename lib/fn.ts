import run, { macro } from '../core'

// ["fn", [<arg1>, <arg2>, ...], <exp>]
export default macro((ctx) => {
    return function () {
        let { ast } = ctx
        // generate a closure
        var closure = assign({}, ctx.sandbox);
        var i, len;

        // assign arguments to sandbox
        len = ast[1].length;
        for (i = 0; i < len; i++) {
            closure[ast[1][i]] = arguments[i];
        }

        return run(ast[2], closure, ctx.env, this, ctx.index);
    };
})

function assign (obj, src) {
    for (var k in src) {
        obj[k] = src[k];
    }
    return obj;
}
