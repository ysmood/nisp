
var defaults = {
    path: "/api",
    limitToUseGet: 2000
};

/**
 * The http client for nisp.
 * @param  {Object} opts
 * ```js
 * {
 *     path: "/api",
 *     nisp: String,
 *     limitToUseGet: 2000,
 *     headers: {},
 *     form: FormData
 * }
 * ```
 * @return {Promise}
 */
module.exports = function (opts) {
    for (var key in opts) {
        if (opts[key] === void 0) {
            opts[key] = defaults[key];
        }
    }

    var nisp;

    if (typeof opts.nisp === "string")
        nisp = opts.nisp;
    else
        nisp = JSON.stringify(opts.nisp);

    if (nisp.length + opts.path.length + 10 < opts.limitToUseGet && !opts.form) {
        var path;
        nisp = encodeURIComponent(opts.nisp);

        if (opts.path.indexOf("?") < 0) {
            path = opts.path + "?nisp=" + nisp;
        } else {
            path = opts.path + "&nisp=" + nisp;
        }

        return fetch(path, {
            headers: opts.headers
        });
    } else {
        if (opts.form) {
            opts.form.append("nisp", nisp);
            return fetch(opts.path, {
                method: "POST",
                headers: opts.headers,
                body: opts.form
            });
        } else {
            return fetch(opts.path, {
                method: "POST",
                headers: opts.headers,
                body: nisp
            });
        }
    }
};
