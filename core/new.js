var parser = require("./parser");
var run = require("./run");

var encode = function (value) {
    return (typeof Buffer === "undefined") ? btoa(value) : value.toString("base64");
};

var decode = function (value) {
    return (typeof Buffer === "undefined") ? atob(value) : Buffer.from(value, "base64");
};

var isBuffer = function (obj) {
    return (typeof Buffer !== "undefined") && Buffer.isBuffer(obj);
};

var slice = Array.prototype.slice;

module.exports = function () {
    var literals = arguments[0];
    var placeHolder = slice.call(arguments, 1);

    return function (sandbox, env, options) {
        options = options || {};
        options.encode = options.encode || encode;
        options.decode = options.decode || decode;
        sandbox.plain = require("../lang/plain");

        var str = [literals[0]];
        for (var i = 1 ; i < literals.length ; ++ i) {
            var val = placeHolder[i - 1];
            if (isBuffer(val)) {
                str.push("`" + options.encode(val) + "`");
            } else if (Array.isArray(val)) {
                str.push("(plain " + JSON.stringify(val) + ")");
            } else {
                str.push(JSON.stringify(val));
            }
            str.push(literals[i]);
        }
        var ast = parser.parse(str.join(""), { sandbox: sandbox, decode : options.decode });
        return run(ast, sandbox, env);
    };
};