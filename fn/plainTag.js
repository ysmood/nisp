module.exports = function (name) {
    return function () {
        var strings = arguments[0];
        var ret = strings[0];
        var len = arguments.length;

        for (var i = 1; i < len; i++) {
            ret += arguments[i] + strings[i];
        }

        return [name, ret];
    };
};
