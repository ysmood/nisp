import { Context } from '../core/index'

export default function (ctx: Context, msg: string) {
    let stack = []
    let node = ctx

    while(node) {
        stack.push(node.ast[0])
        node = node.parent
    }

    throw new Error(
        `[nisp] ${msg}\n`
        + `stack: ` + JSON.stringify(stack, null, 4)
    )
}
