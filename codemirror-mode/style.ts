import { Style } from './tokenizer/interface.d'

const style: Style = {
    identifier: 'identifier',
    string: 'string',
    number: 'number',
    groupStart: 'group',
    groupEnd: 'group',
    comment: 'comment',
    error: 'error',
    blank: 'blank',
    null: 'null',
    boolean: 'boolean',
    name: 'name',
}

export default style
