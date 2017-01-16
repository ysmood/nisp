
const isBuffer = obj => (typeof Buffer !== "undefined") && Buffer.isBuffer(obj);

const btoa = value => (typeof Buffer === "undefined") ? btoa(value) : value.toString("base64");

const escapeQuoteReg = /'/g

function json (str) {
    return JSON.stringify(str).replace(escapeQuoteReg, "''")
}

export default function (literals: TemplateStringsArray, ...placeHolder) {
    var str = literals[0];
    for (var i = 1 ; i < literals.length ; ++ i) {
        var val = placeHolder[i - 1];
        if (isBuffer(val)) {
            str += `(atob '${btoa(val)}')`;
        } else {
            str += `(json '${json(val)}')`
        }
        str += literals[i]
    }

    return str;
};