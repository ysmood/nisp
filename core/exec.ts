import { parse } from "./parser";
import run from "./run";

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

    return run(parse(code), sandbox, env, stack);
};