import Context from './context'
import { Stream, Style } from './interface.d'
import State from './state'

export interface Table {
    [x: number]: (stream: Stream, context: Context) => string
    router: (stream: Stream, context: Context) => string
}

const tokenizer = (style: Style) => {
    const table: Table = {
        router: (stream, context) => {
            // console.log(context.state.map(i => State[i]), stream.peek())
            const state = context.state[context.state.length - 1]
            const handle = table[state]

            if (!handle) {
                return null
            }

            const ret = handle(stream, context)
            if (stream.pos === stream.string.length) {
                if (context.commitIndent > context.pushIndent) {
                    context.pushIndent = context.commitIndent
                    ++ context.indent
                }
                 else if (context.commitIndent < context.pushIndent) {
                    context.pushIndent = context.commitIndent
                    -- context.indent
                }
            }
            return ret
        },

        [State.start]: (stream, context) => {
            context.state.pop()
            context.state.push(State.error)
            context.state.push(State.primary)
            context.state.push(State.empty)
            return table.router(stream, context)
        },

        [State.empty]: (stream, context) => {
            const blank = /^\s+/
            if (stream.match(blank)) {
                return style.blank
            }
            const comment = /^#.*/
            if (stream.match(comment)) {
                return style.comment
            }
            context.state.pop()
            if (stream.eol()) {
                context.state.push(State.empty)
                return style.blank
            }
            return table.router(stream, context)
        },

        [State.primary]: (stream, context) => {
            const peek = stream.peek()
            context.state.pop()

            if (peek === '(') {
                ++ context.commitIndent
                context.named = true
                context.state.push(State.group)
                context.state.push(State.empty)
                stream.next()
                return style.groupStart
            }

            if (peek === '\'' || peek === '"') {
                context.backed = false
                context.string = peek
                context.state.push(State.string)
                stream.next()
                if (context.named) {
                    return style.name
                }
                return style.string
            }

            const number = /^[-+]?(?:0[xX][\da-fA-F]+|\d+\.?|\d*\.\d+(?:[eE]\d+)?)(?![^)(\x20\t\r\n'"])/
            if (stream.match(number)) {
                context.state.push(State.empty)
                if (context.named) {
                    context.named = false
                    return style.name
                }
                return style.number
            }

            const bool = /^(?:true|false)\b/
            if (stream.match(bool)) {
                context.state.push(State.empty)
                if (context.named) {
                    context.named = false
                    return style.name
                }
                return style.boolean
            }

            const nul = /^null\b/
            if (stream.match(nul)) {
                context.state.push(State.empty)
                if (context.named) {
                    context.named = false
                    return style.name
                }
                return style.null
            }

            const identifier = /^[^)(\x20\t\r\n'"]+/
            if (stream.match(identifier)) {
                context.state.push(State.empty)
                if (context.named) {
                    context.named = false
                    return style.name
                }
                return style.identifier
            }

            context.state.push(State.error)
            return table.router(stream, context)
        },

        [State.string]: (stream, context) => {
            if (stream.peek() === context.string) {
                context.string = ''
                context.backed = true
                context.state.pop()
                context.state.push(State.empty)
                stream.next()
                if (context.named) {
                    context.named = false
                    return style.name
                }
                return style.string
            }
            const regex = new RegExp(`^([^${context.string}\\\\]+|\\\\.)+`)
            if (stream.match(regex)) {
                if (context.named) {
                    return style.name
                }
                return style.string
            }

            context.state.push(State.error)
            return table.router(stream, context)
        },

        [State.group]: (stream, context) => {
            const peek = stream.peek()

            if (peek === ')') {
                -- context.commitIndent
                context.named = false
                context.state.pop()
                context.state.push(State.empty)
                stream.next()
                return style.groupEnd
            }

            context.state.push(State.primary)
            return table.router(stream, context)
        },

        [State.error]: (stream, _) => {
            stream.skipToEnd()
            return style.error
        },
    }

    return table
}

export {
    Context,
    tokenizer,
}
