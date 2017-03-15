// ["dict", k1, v1, k2, v2, ...]
import { error } from '../core/index'
export default function () {
    var dict = {};
    var args = arguments
    if(args.length % 2 == 1){
        return error(this, `the amount keys and values should be same`);
    }
    for (var i = 0, j; i < args.length; i = ++j) {
        j = i + 1;
        dict[args[i]] = args[j];
    }

    return dict;
};
