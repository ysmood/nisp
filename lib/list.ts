// ["list", a, b, c, ...]
export default function () {
    var arr = [];

    for (var i = 0, len = arguments.length; i < len; i++) {
        arr.push(arguments[i]);
    }

    return arr;
};
