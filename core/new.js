let parser = require('./parser')
let run = require('./run');

var reduce = (left, right) => {
    return left + JSON.stringify(placeHolder[index ++]) + right;
};

module.exports = (literals, ...placeHolder) => {
    return (sandbox, env) => {
        var index = 0;
        var str = [literals[0]];
        for (var i = 1 ; i < literals.length ; ++ i) {
            str.push(JSON.stringify(placeHolder[i - 1]))
            str.push(literals[i])
        }
        var ast = parser.parse(str.join(''), { sandbox });
        return run(ast, sandbox, env);
    }
}