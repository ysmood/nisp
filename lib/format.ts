import { parse } from '../parser/extended'

const fill = (input, length, space = 4) => {
    return new Array(length * space + 1).join(' ') + input
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
    indent = 0
}

interface Table {
    start: (any) => Node
    router: (any, context: Context) => any
    [x: number]: (node?: any, context?: Context) => any
}

const table: Table = {
    start: node => {
        let context = new Context()
        context.root = node
        return table.router(node, context)
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
    [Type.value] : (node) => {
        return node.value + ''
    },
    [Type.blank] : () => {
        return ''
    },
    [Type.comment] : (node) => {
        return node.value
    },
    [Type.package] : (node, context) => {
        let ret = []
        let list = comments(node.left)
        list.push(node.value)
        list = list.concat(comments(node.right))
        ret.push(table.router(list.shift(), context), '\n')
        for (let item of list) {
            ret.push(fill(table.router(item, context), context.indent), '\n')
        }
        ret.pop()
        return ret.join('')
    },
    [Type.nisp] : (node, context) => {
        let ret = []
        let list = comments(node.left)
        list = list.concat(node.value)
        list = list.concat(comments(node.right))
        ret.push('(')
        ++ context.indent
        let top = list[0]
        if (top.type !== Type.nisp && top.type !== Type.comment) {
            ret.push(table.router(top, context))
            list.shift()
        }
        if (list.length) {
            ret.push('\n')
        }
        for (let item of list) {
            ret.push(fill(table.router(item, context), context.indent), '\n')
        }
        -- context.indent
        if (list.length) {
            ret.push(fill(')', context.indent))
        } else {
            ret.push(')')
        }
        return ret.join('')
    }
}

export default function (code: string): any {
    let ast = parse(code)
    return table.start(ast)
};