import { Context } from '../core'

export default function (this: Context, name, val) {
    if (name === '__proto__') return
    return this.sandbox[name] = val
}
