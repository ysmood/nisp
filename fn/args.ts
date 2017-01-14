
// The function make the all the evaluation completely lazy.
export default function (fn) {
    return function (run, ast, sandbox, env) {
        return fn(function (index, type, args) {
            index++;

            switch (type) {
            case "fn":
                return run([ast[index]].concat(args), sandbox, env);
            case "plain":
                return ast[index];
            default:
                return run(ast[index], sandbox, env);
            }
        }, {
            env: env,
            sandbox: sandbox,
            ast: ast,
            run: run
        });
    };
};
