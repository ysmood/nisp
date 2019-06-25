export interface Style {
    name: string
    identifier: string
    string: string
    number: string
    null: string
    boolean: string
    groupStart: string
    groupEnd: string
    blank: string
    comment: string
    error: string
}

export interface Stream {
    match: (regex: RegExp) => any
    eol: () => boolean
    peek: () => string
    next: () => void
    skipToEnd: () => void
    string: string
    pos: number
}
