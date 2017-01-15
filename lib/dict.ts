// ["list", k1, v1, k2, v2, ...]
export default function () {
    var dict = {};
    var args = arguments

    for (var i = 0, j; i < args.length; i = ++j) {
        j = i + 1;
        dict[args[i]] = args[j];
    }

    return dict;
};
