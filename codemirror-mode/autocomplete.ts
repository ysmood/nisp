import * as CodeMirror from 'codemirror/lib/codemirror'
import * as fuzzaldrin from 'fuzzaldrin'
import * as _ from 'lodash'
import { parse } from '../parser'

export interface Hint {
    text: string
    displayText: string
    type?: 'fn',
    render?: (elem, self, data) => void
    score?: number
    fnType?: string
}

export interface HintList {
    [k: string]: Hint
}

class Set<T> {
    list: T[]

    constructor() {
        this.list = []
    }

    add(item) {
        let i = this.list.indexOf(item)
        if (i > -1) {
            this.list[i] = item
            return
        }

        this.list.push(item)
    }
}

function add(list: HintList, ...items: Hint[]) {
    for (const el of items)
        list[el.text] = el
}

const truncateLen = 100

const fnTypeContainer = document.createElement('div')
fnTypeContainer.className = 'fn-type-container'
fnTypeContainer.style.position = 'absolute'
fnTypeContainer.style.display = 'none'
document.body.appendChild(fnTypeContainer)

export default (cm) => {
    let currWord = ''
    let wordList: HintList = {}

    const sortHint = (el: Hint) => {
        el.displayText = truncate(el.displayText)
        el.score = fuzzaldrin.score(el.text, currWord)
        return -el.score
    }

    const showHintReg = /[\s(]([^\s(]+)$/
    const match = (line) => {
        const ms = line.match(showHintReg)

        if (!ms) return false

        currWord = ms[1]

        return true
    }

    const truncate = (str: string): string => {
        if (str.length > truncateLen + 3)
            return str.slice(0, truncateLen / 2) + '...' + str.slice(-truncateLen / 2)
        else
            return str
    }

    const parseOpt = {
        data: _.noop,
    }

    const scanWords = (ast, set: Set<string>) => {
        if (_.isArray(ast)) {
            for (const el of ast) {
                scanWords(el, set)
            }
        } else if (_.isString(ast)) {
            set.add(ast)
        }
        return set
    }

    const filterHint = el => el.score > 0

    const renderDisplayText = (elem, _, data: Hint) => {
        const node = document.createElement('div')
        node.style.whiteSpace = 'normal'
        switch (data.type) {
            case 'fn':
                node.innerHTML = `
                <span class='pt-icon-standard pt-intent-primary pt-icon-function'></span>
                ${_.escape(data.displayText)}
            `
                break
            default:
                node.innerText = data.displayText
        }
        elem.append(node)
    }

    const renderFnType = (completion: Hint, elem) => {
        closeFnType()

        if (completion.type !== 'fn')
            return

        fnTypeContainer.style.display = 'block'
        fnTypeContainer.innerHTML = completion.fnType
        const rect = elem.getBoundingClientRect()
        fnTypeContainer.style.left = 5 + rect.left + rect.width + 'px'
        let top = 0
        while (elem) {
            top += elem.offsetTop
            elem = elem.offsetParent
        }
        fnTypeContainer.style.top = top + 'px'
    }
    const closeFnType = () => {
        fnTypeContainer.style.display = 'none'
    }

    const updateWordList = _.debounce(() => {
        try {
            const ast = parse(cm.getValue(), parseOpt)
            wordList = {}

            add(wordList, {
                text: 'null',
                displayText: 'null',
            }, {
                    text: 'true',
                    displayText: 'true',
                }, {
                    text: 'false',
                    displayText: 'false',
                })

            const set = scanWords(ast, new Set<string>())
            for (const str of set.list)
                add(wordList, {
                    text: str,
                    displayText: str,
                })

            _.assign(wordList, cm.getOption('nispFnList'))
            _.each(wordList, (el) => {
                el.render = renderDisplayText
            })
        } catch (err) {
            null
        }
    }, 300)

    const showHint = _.debounce(() => {
        const cursor = cm.getCursor()
        const line = cm.getLine(cursor.line).slice(0, cursor.ch)

        if (!match(line)) return

        cm.showHint({
            completeSingle: false,
            hint() {
                const sorted = _.sortBy(wordList, sortHint).filter(filterHint)

                const data = {
                    list: sorted,
                    from: CodeMirror.Pos(cursor.line, cursor.ch - currWord.length),
                    to: CodeMirror.Pos(cursor.line, cursor.ch),
                }

                CodeMirror.on(data, 'select', renderFnType)
                CodeMirror.on(data, 'close', closeFnType)

                return data
            },
        })
    }, 100)

    cm.on('change', updateWordList)

    cm.on('inputRead', showHint)
}
