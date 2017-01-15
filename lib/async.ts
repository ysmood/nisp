let root = typeof window === 'object' ? window : global

// ["fn", <arg1>, <arg2>, ...]
export default function (fn, customPromise) {
    var P = customPromise || root['Promise']; // eslint-disable-line

    return function () {
        return P.all(arguments).then((syncedArgs) => {
            return fn.apply(this, syncedArgs);
        });
    };
};
