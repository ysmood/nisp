import { parse } from '../parser'

let dataListIndex = 0
let dataList: any[]
let options = {
    data () {
        let val = dataList[dataListIndex++]
        return ["$", val]
    }
}

export default function (literals: TemplateStringsArray, ...list): string {
    var str = literals[0];
    for (var i = 1 ; i < literals.length ; ++ i) {
        str += '@' + literals[i]
    }

    dataListIndex = 0
    dataList = list
    return parse(str, options)
};