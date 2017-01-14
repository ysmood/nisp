var parser = require("./parser");

var isBuffer = function (obj) {
    return (typeof Buffer !== "undefined") && Buffer.isBuffer(obj);
};

var encode = function (value) {
    return (typeof Buffer === "undefined") ? btoa(value) : value.toString("base64");
};

var slice = Array.prototype.slice;
var isArray = function (target) {
    return Object.prototype.toString.call(target).slice(8, -1) === "Array";
};

export default function (literals: TemplateStringsArray, ...placeHolder) {
    var str = [literals[0]];
    for (var i = 1 ; i < literals.length ; ++ i) {
        var val = placeHolder[i - 1];
        if (isBuffer(val)) {
            str.push("`" + encode(val) + "`");
        } else if (isArray(val)) {
            str.push("($ " + JSON.stringify(val) + ")");
        } else {
            str.push(JSON.stringify(val));
        }
        str.push(literals[i]);
    }

    return str.join("");
};