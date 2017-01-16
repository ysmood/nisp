export function isArray (obj): obj is Array<any> {
    return obj && obj.constructor === Array;
}

export function isFunction (obj): obj is Function {
    return typeof obj === "function";
}
