import { parse } from "../parser";
import nisp from "../core";

function atob (str) {
    return (typeof Buffer === "undefined") ? atob(str) : Buffer.from(str, "base64");
}

function json (str) {
    return JSON.parse(str)
}

export default function (code, sandbox, env?, stack?) {
    if (!sandbox.atob) {
        sandbox.atob = atob;
    }
    if (!sandbox.json) {
        sandbox.json = json;
    }

    return nisp(parse(code), sandbox, env, stack);
};