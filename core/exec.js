var run = require("./run");

function decode (value) {
    return (typeof Buffer === "undefined") ? atob(value) : Buffer.from(value, "base64");
};

module.exports = function (code, sandbox, env) {
    if (!sandbox.decode) {
        sandbox.decode = decode;
    }

    return run(parse(code), sandbox, env);
};