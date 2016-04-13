var reg = /[\[\]\",\s\{\}]/g;

/**
 * Used to JSON.stringify and tag the string.
 * @param  {Object | String} nisp
 * @return {Object} `{ tag: String, json: String }`
 */
module.exports = function (nisp) {
    if (typeof nisp !== "string") {
        nisp = JSON.stringify(nisp);
    }

    return {
        tag: nisp.replace(reg, "_").slice(0, 100),
        json: nisp
    };
};
