# nisp

[![NPM version](https://badge.fury.io/js/nisp.svg)](http://badge.fury.io/js/nisp) [![Build Status](https://travis-ci.org/ysmood/nisp.svg)](https://travis-ci.org/ysmood/nisp) [![Deps Up to Date](https://david-dm.org/ysmood/nisp.svg?style=flat)](https://david-dm.org/ysmood/nisp)


The interesting part is that it is designed to be non-turing-complete.

You have the full control of the vm, you can decide what the language can have, for example,
if you don't expose the `if` expression, the user cannot directly express if logic.

By default the language only presents the meta data of the program itself. So by default
it is used to exchange plain data.

You may ask what it does? Yes it does nothing. And that is exactly what a composable permission
protocol need. We use it to expose composable api.

The ast of nisp is plain JSON, the js implementation is only 35 lines of code, so it will be very to port nisp to other languages. No closure or complex data type is required, even plain C can implement nisp easily.

Everything inside nisp is a function, it's very easy to keep everything type safe, plus the composable nature,
nisp is an ideal middle layer to carry query or RPC.

# Quick Start

For more examples, read the unit test of this project.


### Use the predefined functions

Only if the `$` function is defined, the user can define variable.

```js
var nisp = require("nisp");

var sandbox = {
    do: require("nisp/lang/do"),
    def: require("nisp/lang/def"),
    if: require("nisp/lang/if")
};

var expresses = ["do",
    ["def", "a", ["if", false, 10, 20]],
    "a"
];

nisp(expresses, sandbox); // => 20
```

### Define your own function

Here the user can only use it as a sum-only-calculator.

```js
var nisp = require("nisp");
var plain = require("nisp/fn/plain");

var sandbox = {
    "+": plain(function (args) {
        return args.reduce(function (s, n) { return s + n; });
    })
};

var expresses = ["+", 1, 2, 3];

nisp(expresses, sandbox); // => 6
```

### Composable RPC

```js
var nisp = require("nisp");
var plain = require("nisp/fn/plain");

var sandbox = {
    concat: plain(function () {
        return Array.prototype.concat.apply([], arguments);
    }),

    map: plain(function (args) {
        var fn = args[0], arr = args[1];
        return arr.map(fn);
    }),

    getAnimals: plain(function (args, session) {
        if (session.isZooKeeper)
            return ['cat', 'dog'];
        else
            throw new Error("Not Allowed");
    }),

    getFruits: plain(function () {
        return ['apple', 'banana'];
    }),

    getDetails: plain(function (args) {
        return 'Details: ' + args;
    })
};

var session = {
    user: 'Jack',
    isZooKeeper: true
}

var expresses = ["map", "getUrl", ["concat", ["getAnimals"], ["getFruits"]]];

nisp(expresses, sandbox, session);
```

### Full control the ast

Here we implementation a `if` expression. The `if` expression is very special,
it cannot be achieved without ast manipulation.

```js
var nisp = require("nisp");
var args = require("nisp/lib/args");
var plain = require("nisp/fn/plain");

var sandbox = {
    // Full lazy.
    "if": args(function (v) {
        return v(0) ? v(1) : v(2);
    }),

    // Most times you don't want to use it.
    "non-lazy-if": plain(function (args) {
        return args[0] ? args[1] : args[2];
    })

    // Even half lazy, you have the full control to how lazy the program will be.
    // No matter v(0) is true or false, the v(1) will be calculated.
    "half-lazy-if": args(function (v) {
        var v1 = v(1);
        return v(0) ? v1 : v(2);
    })
};

var expresses = ["+", 1, 2];

nisp(expresses, sandbox); // => 3
```

### Make a complete async language

```js
var nisp = require("nisp");
var plainAsync = require("nisp/fn/plainAsync");
var Promise = require('yaku');

function waitNumber (val) {
    return new Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), 1000);
    });
};

var sandbox = {
    download: plainAsync(function () {
        return waitNumber(1);
    }),

    "+": plainAsync(function (args) {
        return args.reduce(function (s, n) { return s + n; });
    })
};

// Here we can write async code a async way.
var expresses = ["+", ["download"], ["download"]];

nisp(expresses, sandbox).then(function (out) {
    console.log(out) // => 2
});
```



# API

TODO...

Checkout the files in `src` folder.
