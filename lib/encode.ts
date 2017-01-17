import { parse } from '../parser'

const isBuffer = obj => (typeof Buffer !== "undefined") && Buffer.isBuffer(obj);

const $btoa = value => (typeof Buffer === "undefined") ? btoa(value) : value.toString("base64");

let dataListIndex = 0
let dataList: any[]
function data () {
    let val = dataList[dataListIndex++]

    if (isBuffer(val)) {
        return `["atob","${$btoa(val)}"]`;
    } else {
        return `["$",${JSON.stringify(val)}]`
    }
}

export default function (literals: TemplateStringsArray, ...list): string {
    var str = literals[0];
    for (var i = 1 ; i < literals.length ; ++ i) {
        str += '@' + literals[i]
    }

    dataListIndex = 0
    dataList = list
    return parse(str, { data })
};