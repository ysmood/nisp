let root = typeof window === 'object' ? window : global

// ["fn", <arg1>, <arg2>, ...]
export default function (fn, customPromise?) {
    var P = customPromise || root['Promise']; // eslint-disable-line

    return function (...args) {
        return P.all(args).then((syncedArgs) =>
            fn.apply(this, syncedArgs)
        );
    };
};
