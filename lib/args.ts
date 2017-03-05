import { macro, arg } from '../core'

export default function (fn) {
    return macro(ctx => {
        return fn((i) => arg(ctx, i + 1))
    });
};
