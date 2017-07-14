import { parse } from '../parser/extended'
import style from './style'

const TPL_CONTAINER = `<pre class="nisp-container">{lines}</pre>`

const TPL_LINE = `<div class="nisp-line">{ranges}</div>`

const TPL_BLOCK = `<div class="nisp-block">{ranges}</div>`

const TPL_RANGE = `<div class="nisp-range nisp-{class}">{range}</div>`

const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#39;',
}

const renderRange = (text, type) => {
    return TPL_RANGE.replace('{class}', type).replace('{range}', escape(text))
}

const renderLine = (text) => {
    return TPL_LINE.replace('{ranges}', text)
}

const renderBlock = (text) => {
    return TPL_BLOCK.replace('{ranges}', text)
}

const renderContainer = (text) => {
    return TPL_CONTAINER.replace('{lines}', text)
}

const escape = (value) => {
    return String(value).replace(/[&<>"']/g, l => {
        return htmlEscapes[l] || l
    })
}

const comments = (nodes) => {
    let ret = []
    if (!nodes) {
        return ret
    }
    for (let item of nodes) {
        if (item.type === Type.comment) {
            ret.push(item)
        }
    }
    return ret
}

enum Type {
    blank,
    comment,
    package,
    value,
    nisp
}

class Context {
    root = null
    first = false
}

interface Table {
    start: (any) => string
    router: (any, context: Context) => string
    [x: number]: (node?: any, context?: Context) => string
}

const table: Table = {
    start: node => {
        let context = new Context()
        context.root = node
        return renderContainer(table.router(node, context) || '')
    },
    router: (node, context) => {
        if (!node) {
            return node
        }

        let handler = table[node.type]
        
        if (handler) {
            return handler(node, context)
        }

        return node
    },
    [Type.value] : (node, context) => {
        const value = node.value
        let type
        if (context.first) {
            type = style.name
            context.first = false
        } else if (value === null) {
            type = style.null
        } else if (!isNaN(+value)) {
            type = style.number
        } else if (String(value).charAt(0) === '\'') {
            type = style.string
        } else {
            type = style.identifier
        }
        return renderRange(value, type)
    },
    [Type.blank] : () => {
        return ''
    },
    [Type.comment] : (node) => {
        let value = node.value
        value = '# ' + value.replace(/^\s*#\s*/, '')
        return renderRange(value, style.comment)
    },
    [Type.package] : (node, context) => {
        let ret = []
        let list = comments(node.left)
        list.push(node.value)
        list = list.concat(comments(node.right))
        ret.push(table.router(list.shift(), context))
        if (list.length) {
            ret[0] = renderBlock(ret[0])
            for (let item of list) {
                ret.push(renderBlock(table.router(item, context)))
            }
        }
        return ret.join('')
    },
    [Type.nisp] : (node, context) => {
        let ret = []
        let list = comments(node.left)
        list = list.concat(node.value)
        list = list.concat(comments(node.right))
        ret.push(renderRange('(', style.symbol))
        if (list.length) {
            let top = list[0]
            context.first = true
            if (top.type === Type.value) {
                ret.push(table.router(top, context))
                list.shift()
            }
            for (const item of list) {
                ret.push(renderLine(table.router(item, context)))
                if (item.type === Type.nisp) {
                    context.first = false
                }
            }
        }
        ret.push(renderRange(')', style.symbol))
        return ret.join('')
    }
}

export default function (code: string): any {
    let ast = parse(code)
    return table.start(ast)
};