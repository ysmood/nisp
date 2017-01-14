var run = require("./run");

function decode (value) {
    return (typeof Buffer === "undefined") ? atob(value) : Buffer.from(value, "base64");
};

export default function (code, sandbox, env?) {
    if (!sandbox.decode) {
        sandbox.decode = decode;
    }

    return run(code, sandbox, env);
};