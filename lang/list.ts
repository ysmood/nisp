// ["list", a, b, c, ...]
export default function (run, ast, sandbox, env) {
    var arr = [];

    for (var i = 1; i < ast.length; i++) {
        arr.push(run(ast[i], sandbox, env));
    }

    return arr;
};
