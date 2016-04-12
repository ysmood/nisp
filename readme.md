# nisp

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

var env = {
    do: require("nisp/lib/do"),
    set: require("nisp/lib/set"),
    get: require("nisp/lib/get"),
    if: require("nisp/lib/if")
};

var expresses = ["do",
    ["set", "a", ["if", false, 10, 20]],
    ["get", "a"]
];

nisp(expresses, env); // => 20
```

### Define your own function

Here the user can only use it as a sum-only-calculator.

```js
var nisp = require("nisp");
var plainFn = require("nisp/lib/plainFn");

var env = {
    "+": plainFn(function (a, b) {
        return a + b;
    })
};

var expresses = ["+", 1, 2];

nisp(expresses, env); // => 6
```

### Define your own function with permission check

Here only the admin user can sum things.

```js
var nisp = require("nisp");
var plainFn = require("nisp/lib/plainFn");

var env = {
    session: { isAdmin: false },
    "+": plainFn(function (a, b) {
        if (!env.session.isAdmin) throw Error("permission not allowed");
        return a + b;
    })
};

var expresses = ["+", 1, 2];

nisp(expresses, env); // => Error
```

### Full control the ast

Here we implementation a `if` expression. The `if` expression is very special,
it cannot be achieved without ast manipulation.

```js
var nisp = require("nisp");
var lazyFn = require("nisp/lib/lazyFn");
var plainFn = require("nisp/lib/plainFn");

var env = {
    // Full lazy.
    "if": lazyFn(function (v) {
        return v(0) ? v(1) : v(2);
    }),

    // Most times you don't want to use it.
    "non-lazy-if": plainFn(function (cond) {
        return cond ? a : b;
    })

    // Even half lazy, you have the full control to how lazy the program will be.
    // No matter v(0) is true or false, the v(1) will be calculated.
    "half-lazy-if": lazyFn(function (v) {
        var v1 = v(1);
        return v(0) ? v1 : v(2);
    })
};

var expresses = ["+", 1, 2];

nisp(expresses, env); // => 3
```

### Make a complete async language

```js
var nisp = require("nisp");
var plainAsyncFn = require("nisp/lib/plainAsyncFn");
var Promise = require('yaku');

function waitNumber (val) {
    return new Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), 1000);
    });
};

var env = {
    "download": plainAsyncFn(function () {
        return waitNumber(1);
    }),

    "+": plainAsyncFn(function (a, b) {
        return a + b;
    })
};

// Here we can write async code a async way.
var expresses = ["+", ["download"], ["download"]];

nisp(expresses, env).then(function (out) {
    console.log(out) // => 2
});
```



# API

TODO...

Checkout the files in `src` folder.
