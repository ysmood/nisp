# nisp

[![NPM version](https://badge.fury.io/js/nisp.svg)](http://badge.fury.io/js/nisp) [![Build Status](https://travis-ci.org/ysmood/nisp.svg)](https://travis-ci.org/ysmood/nisp) [![Deps Up to Date](https://david-dm.org/ysmood/nisp.svg?style=flat)](https://david-dm.org/ysmood/nisp)


The interesting part is that nisp is designed to be non-turing-complete.

You have the full control of the vm and ast,
you can decide what the language will have, or how lazy the expresssion will be.
for example, if you don't expose the `if` exp the user can never express if logic.

By default nisp only presents the meta data of the program itself. So by default
it is used to exchange plain data.

You may ask what it really does? Yes, it does nothing. And that is exactly what a composable permission
protocol needs. I use it to expose composable api.

The ast of nisp is plain JSON, the js implementation is only around 50 lines of code,
so it will be very to port nisp to other languages. 
No closure or complex data type is required, even plain C can implement nisp easily.

Everything inside nisp is a function, it's very easy to keep everything type safe, plus the composable nature,
nisp is an ideal middle layer to carry query or RPC.

# Quick Start

For more examples, read the unit test of this project.


### Define your own function

Here the user can only use it as a sum-only-calculator.

```js
import nisp from 'nisp'

var sandbox = {
    "+": (a, b) => a + b
};

var exp = ["+", 1, 2];

nisp(exp, sandbox); // => 3
```


### Encode and escape data

Sometimes you may want to separate nisp code and raw data,
Here we provide `encode` function to simplify the pain of typing
quotes and commas. The grammar is a subset of lisp.

```js
import encode from 'nisp/lib/encode'
import exec from 'nisp/lib/exec'

var sandbox = {
    "+": ns => ns.reduce((a, b) => a + b),
    "++": ns => ns.map(a => a + 1)
};

var data = [1, 2, 3]

var exp = encode`(+ (++ ${data}))`

exec(exp, sandbox); // => 9
```


### Composable RPC

```js
import nisp from 'nisp'

var sandbox = {
    concat (...args) {
        return args.reduce((a, b) => a.concat(b));
    },

    getAnimals () {
        if (this.session.isZooKeeper)
            return ['cat', 'dog'];
        else
            throw new Error("Not Allowed");
    },

    getFruits () {
        return ['apple', 'banana'];
    }
};

var session = {
    user: 'Jack',
    isZooKeeper: true
}

var exp = ["concat", ["getAnimals"], ["getFruits"]];

nisp(exp, sandbox, session);
```

### Full control the ast with macro

Here we implementation a `if` expression The `if` expression is very special,
it cannot be achieved without ast manipulation.

```js
import { macro } from 'nisp'
import encode from 'nisp/lib/encode'
import exec from 'nisp/lib/exec'
import args from 'nisp/lib/args'
import $do from 'nisp/lib/do'

var sandbox = {
    // Most times you don't want to use it.
    "non-lazy-if": (cond, a, b) => cond ? a : b,

    // Full lazy.
    if: args(v => v(0) ? v(1) : v(2)),

    // Even half lazy, you have the full control to how lazy the program will be.
    // No matter v(0) is true or false, v(1) will be calculated.
    "half-lazy-if": args(function (v) {
        var v1 = v(1);
        return v(0) ? v1 : v(2);
    }),

    do: $do,

    "+" (...args) {
        console.log('calc:', args);
        return args.reduce(function (s, n) { return s + n; });
    })
};

var exp = encode`(do
    (if           true (+ 1 1) (+ 2 2))
    (non-lazy-if  true (+ 1 1) (+ 2 2))
    (half-lazy-if true (+ 1 1) (+ 2 2))
)`;

exec(exp, sandbox);
```

### Make a complete async language

```js
var nisp = require("nisp");
var async = require("nisp/lib/async");

function waitNumber (val) {
    return new Promise(function (r) {
        return setTimeout((function () {
            return r(val);
        }), 1000);
    });
};

var sandbox = {
    download: async(() => waitNumber(1))

    "+": async((a, b) => a + b)
};

// Here we can write async code a sync way.
var exp = ["+", ["download"], ["download"]];

nisp(exp, sandbox).then(function (out) {
    // It will take about 1 seconds to log out.
    console.log(out) // => 2
});
```



# API

TODO...

Checkout the files in `src` folder.
