/*eslint-disable */

import run from '../core/run'

// ['@', 'if', true, 1, 2]
// ['if', true, 1, 2]
let ret = run(['$', [1, 2]], {})

console.log(ret)
