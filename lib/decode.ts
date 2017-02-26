type Callback = (type: string, obj: any, path: Path) => void
type Path = (string | number)[]

function walk (obj, cb: Callback, path: Path, nodes: any[]) {
    let type = typeof obj

    if (type === 'object') {
        if (obj === null) {
            cb('null', obj, path)
        } else {
            if (nodes.indexOf(obj) > -1)
                throw new TypeError('cycled object')
            else
                nodes.push(obj)

            if (typeof obj.length === 'number') {
                cb('array-start', obj, path)
                for (let i = 0; i < obj.length; i++) {
                    let node = obj[i]
                    let p = path.concat(i)

                    if (i === 0)
                        cb('array-first', node, p)
                    else
                        cb('array', node, p)

                    walk(node, cb, p, nodes)
                }
                cb('array-end', obj, path)
            } else {
                cb('object-start', obj, path)
                let keys = Object.keys(obj)
                for (let i = 0; i < keys.length; i++) {
                    let key = keys[i]
                    let node = obj[key]
                    let p = path.concat(key)

                    if (i === 0)
                        cb('object-first', node, p)
                    else
                        cb('object', node, p)

                    walk(node, cb, p, nodes)
                }
                cb('object-end', obj, path)
            }
        }
    } else {
        cb(type, obj, path)
    }
}

let ret: string
let path: string[]
let nodes: any[]
let regStrEscape = /'/g
let listSymbol: string
let dictSymbol: string

let spaces = {}

let space = len => {
    if (len in spaces) {
        return spaces[len]
    } else {
        let s = ''
        len *= 4
        for (let i = 0; i < len; i++) {
            s += ' '
        }
        return spaces[len] = s
    }
}
let last = arr => arr[arr.length - 1]

function gen (type: string, obj: any, path: Path) {
    switch (type) {
    case 'null':
    case 'undefined':
    case 'boolean':
    case 'number':
    case 'symbol':
    case 'function':
        ret += obj + ''
        break;

    case 'string':
        ret += `'${obj.replace(regStrEscape, "''")}'`
       break;

    case 'object-start':
        ret += '(' + dictSymbol
        break

    case 'object-first':
    case 'object':
        ret += '\n' + space(path.length) + last(path) + ' '
        break

    case 'object-end':
        ret += '\n' + space(path.length) + ')'
        break

    case 'array-start':
        ret += '(' + listSymbol
        break

    case 'array-first':
    case 'array':
        ret += '\n' + space(path.length)
        break

    case 'array-end':
        ret += '\n' + space(path.length) + ')'
        break

    default:
        throw new TypeError('unknown type: ' + type)
    }
}

export default function (obj, list = '|', dict = ':'): string {
    ret = ''
    path = []
    nodes = []
    listSymbol = list
    dictSymbol = dict

    walk(obj, gen, path, nodes)

    return ret
}