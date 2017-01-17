import nisp, { Sandbox } from "../core";
import $ from './$'

function atob (str) {
    return (typeof Buffer === "undefined") ? atob(str) : Buffer.from(str, "base64");
}

export default function (ast, sandbox: Sandbox, env?) {
    sandbox['atob'] = atob;
    sandbox['$'] = $;

    return nisp(ast, sandbox, env);
};
