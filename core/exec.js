var parser = require("./parser");
var run = require("./run");
var plain = require("../lang/plain");

var decode = function (value) {
    return (typeof Buffer === "undefined") ? atob(value) : Buffer.from(value, "base64");
};

module.exports = function (code, sandbox, env) {
    if (!sandbox.plain) {
        sandbox.plain = plain;
    }
    var ast = parser.parse(code, { sandbox: sandbox, decode : decode });
    return run(ast, sandbox, env);
};