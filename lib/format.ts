import { parse } from '../parser/extended'

const fill = (input, length, space = 4) => {
    return new Array(length * space + 1).join(' ') + input
    // let ret = []
    // for (let i = 0; i < length * space; ++ i) {
    //     ret.push(i + 1)
    // }
    // return '[' + ret.join('') + ']' + input;
}

const mapFill = (inputs, indent, left?, right?) => {
    let ret = []
    for (let item of inputs) {
        return (left || '') + fill(item, indent) + (right || '')
    }
    return ret.join('')
};

const comments = (nodes, context) => {
    if (!nodes) {
        return []
    }
    let ret = []
    for (let item of nodes) {
        let value = table.router(item, context)
        if (value) {
            ret.push(table.router(item, context))
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
        let left = comments(node.left, context)
        let right = comments(node.right, context)
        let value = table.router(node.value, context)
        let ret = []
        if (left.length) {
            ret.push(left.shift())
            ret = ret.concat(mapFill(left, context.indent, '\n'))
            ret.push('\n')
            value = fill(value, context.indent)
        }
        ret.push(value)
        if (right.length) {
            ret = ret.concat(mapFill(right, context.indent, '\n'))
        }
        return ret.join('')
    },
    [Type.nisp] : (node, context) => {
        let ret = []
        let left = comments(node.left, context)
        let right = comments(node.right, context)
        ret.push('(')
        ++ context.indent
        if (left.length) {
            ret = ret.concat(mapFill(left, context.indent, '\n'))
            ret.push('\n')
        } else {
            ret.push(table.router(node.value.shift(), context))
            if (node.value.length) {
                ret.push('\n')
            }
        }
        for (let item of node.value) {
            ret.push(fill(table.router(item, context), context.indent), '\n')
        }
        if (right.length) {
            ret = ret.concat(mapFill(right, context.indent, '', '\n'))
        }
        -- context.indent
        if (node.value.length || left.length) {
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