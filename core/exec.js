var parser = require("./parser");
var run = require("./run");

var decode = function (value) {
    return (typeof Buffer === "undefined") ? atob(value) : Buffer.from(value, "base64");
};

module.exports = function (code, sandbox, env) {
    var ast = parser.parse(code, { sandbox: sandbox, decode : decode });
    return run(ast, sandbox, env);
};