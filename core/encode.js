var isBuffer = (obj) => {
    return (typeof Buffer !== 'undefined') && Buffer.isBuffer(obj);
}

var encode = (value) => {
    return (typeof Buffer === 'undefined') ? btoa(value) : value.toString('base64')
}

module.exports = (literals, ...placeHolder) => {
    var str = [literals[0]];
    for (var i = 1 ; i < literals.length ; ++ i) {
        var val = placeHolder[i - 1];
        if (isBuffer(val)) {
            str.push('`' + encode(val) + '`')
        } else {
            str.push(JSON.stringify(val));
        }
        str.push(literals[i]);
    }

    return str.join('');
}