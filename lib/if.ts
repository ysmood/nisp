import { macro, arg } from '../core'

// ["if", <cond>, <exp1>, <exp2>]
export default macro((ctx) => {
    return arg(ctx, 1) ? arg(ctx, 2) : arg(ctx, 3)
});
