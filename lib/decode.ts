type Callback = (type: string, obj: any, path: Path) => void
type Path = (string | number)[]

function walk (obj, cb: Callback, path: Path, nodes: any[]) {
    if (nodes.indexOf(obj) > -1)
        throw new TypeError('cycled object')

    let type = typeof obj

    switch (type) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
    case 'function':
        cb(type, obj, path)
        break;

    case 'object':
        if (obj === null) {
            cb('null', obj, path)
        } else if (typeof obj.length === 'number') {
            cb('array-start', obj, path)
            for (let i = 0; i < obj.length; i++) {
                let node = obj[i]
                nodes.push(node)
                path = path.concat(i)

                if (i === 0)
                    cb('array-first', node, path)
                else
                    cb('array', node, path)

                walk(node, cb, path, nodes)
            }
            cb('array-end', obj, path)
        } else {
            cb('object-start', obj, path)
            let keys = Object.keys(obj)
            for (let i = 0; i < obj.length; i++) {
                let key = keys[i]
                let node = obj[key]
                nodes.push(node)
                path = path.concat(i)

                if (i === 0)
                    cb('object-first', node, path)
                else
                    cb('object', node, path)

                walk(node, cb, path, nodes)
            }
            cb('object-end', obj, path)
       }
        break;

    default:
        throw new TypeError('not supported type')
    }
}

let ret: string
let path: string[]
let nodes: any[]

let space = len => '                                                '.slice(0, len * 4)
let last = arr => arr[arr.length - 1]

function gen (type: string, obj: any, path: Path) {
    switch (type) {
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'string':
    case 'symbol':
    case 'function':
        ret += obj + ''
        break;

    case 'object-start':
        ret += space(path.length) + '{\n'
        break

    case 'object-first':
        ret += space(path.length) + last(path) + ': '
        break

    case 'object':
        ret += ',\n' + space(path.length) + last(path) + ': '
        break

    case 'object-end':
        ret += space(path.length) + '\n}'
        break

    case 'array-start':
        ret += space(path.length) + '[\n'
        break

    case 'array-first':
        ret += space(path.length) + last(path) + ': '
        break

    case 'array':
        ret += ',\n' + space(path.length) + last(path) + ': '
        break

    case 'array-end':
        ret += space(path.length) + '\n]'
        break

    default:
    }
}

export default function (obj): string {
    ret = ''
    path = []
    nodes = []

    walk(obj, gen, path, nodes)

    return ret
}