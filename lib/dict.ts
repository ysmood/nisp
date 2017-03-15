// ["list", k1, v1, k2, v2, ...]
import { error } from '../core/index'
export default function () {
    var dict = {};
    var args = arguments
    if(args.length % 2 == 1){
        return error(this,`odd dict error`);
    }
    for (var i = 0, j; i < args.length; i = ++j) {
        j = i + 1;
        dict[args[i]] = args[j] || undefined;
    }

    return dict;
};
