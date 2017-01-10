var parser = require('./parser')
var run = require('./run');

var reduce = (left, right) => {
    return left + JSON.stringify(placeHolder[index ++]) + right;
};

var encode = (value) => {
    return (typeof Buffer === 'undefined') ? btoa(value) : value.toString('base64')
}

var decode = (value) => {
    return (typeof Buffer === 'undefined') ? atob(value) : Buffer.from(value, 'base64')
}

var isBuffer = (obj) => {
    return (typeof Buffer !== 'undefined') && Buffer.isBuffer(obj);
}

module.exports = (literals, ...placeHolder) => {
    return (sandbox, env, options) => {
        options = options || {};
        options.encode = options.encode || encode;
        options.decode = options.decode || decode;

        var index = 0;
        var str = [literals[0]];
        for (var i = 1 ; i < literals.length ; ++ i) {
            var val = placeHolder[i - 1];
            if (isBuffer(val)) {
                str.push('`' + options.encode(val) + '`')
            } else {
                str.push(JSON.stringify(val))
            }
            str.push(literals[i])
        }
        var ast = parser.parse(str.join(''), { sandbox: sandbox, decode : options.decode });
        return run(ast, sandbox, env);
    }
}