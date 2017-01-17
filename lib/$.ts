import { macro } from '../core'

/**
 * Return the second ast as raw data
 */
export default macro(ctx => {
    return ctx.ast[1]
});
