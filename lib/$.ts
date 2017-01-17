import { macro } from '../core'

export default macro(ctx => {
    return ctx.ast[1]
});
