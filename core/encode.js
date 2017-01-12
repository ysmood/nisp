var isBuffer = function (obj) {
    return (typeof Buffer !== "undefined") && Buffer.isBuffer(obj);
};

var encode = function (value) {
    return (typeof Buffer === "undefined") ? btoa(value) : value.toString("base64");
};

var slice = Array.prototype.slice;

module.exports = function () {
    var literals = arguments[0];
    var placeHolder = slice.call(arguments, 1);
    var str = [literals[0]];
    for (var i = 1 ; i < literals.length ; ++ i) {
        var val = placeHolder[i - 1];
        if (isBuffer(val)) {
            str.push("`" + encode(val) + "`");
         } else if (Array.isArray(val)) {
            str.push("(plain " + JSON.stringify(val) + ")");
        } else {
            str.push(JSON.stringify(val));
        }
        str.push(literals[i]);
    }

    return str.join("");
};