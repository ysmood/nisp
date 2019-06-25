import style from './style'
import { Context, tokenizer } from './tokenizer'

const table = tokenizer(style)

export default {
    startState: () => {
        const context = new Context()
        return context
    },
    token: (stream, context: Context) => {
        return table.router(stream, context)
    },
    indent: (context: Context, after) => {
        if (!context.backed) {
            return context.indent
        }
        const regex = /^\s*\)/
        return Math.max(0, context.indent - (regex.test(after) ? 1 : 0)) * 4
    },
}
