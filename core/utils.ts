export function isArray (obj): obj is Array<any> {
    return typeof obj === "object" && obj !== null && typeof obj.length === "number";
}

export function isFunction (obj): obj is Function {
    return typeof obj === "function";
}
