import State from './state'

class Context {
    state = [State.start]
    string = ''
    backed = true
    commitIndent = 0
    pushIndent = 0
    indent = 0
    pos = 0
    named = false
}

export default Context
