import { Context, error } from '../core'

export default function (this: Context, name, val) {
    // protect sandbox
    if (name === '__proto__')
        error(this, 'set __proto__ is not allowed')

    return this.sandbox[name] = val
}
