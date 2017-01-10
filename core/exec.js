var parser = require('./parser')
var run = require('./run');

var decode = (value) => {
    return (typeof Buffer === 'undefined') ? atob(value) : Buffer.from(value, 'base64')
}

module.exports = (code, sandbox, env) => {
    var ast = parser.parse(code, { sandbox: sandbox, decode : decode });
    return run(ast, sandbox, env);
}