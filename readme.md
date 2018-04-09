# nisp

[![NPM version](https://badge.fury.io/js/nisp.svg)](http://badge.fury.io/js/nisp) [![Build Status](https://travis-ci.org/ysmood/nisp.svg)](https://travis-ci.org/ysmood/nisp) [![Deps Up to Date](https://david-dm.org/ysmood/nisp.svg?style=flat)](https://david-dm.org/ysmood/nisp)


The interesting part is that nisp is designed to be Turing incomplete.

You have the full control of the vm and ast,
you can decide what the language will have, or how lazy the expression will be.
for example, if you don't expose the `if` exp the user can never express if logic.

By default nisp only presents the meta data of the program itself. So by default
it is used to exchange plain data.

You may ask what it really does? Yes, it does nothing. And that is exactly what a composable permission
protocol needs. I use it to expose composable api.

The ast of nisp is plain JSON, the js implementation is only around 50 lines of code,
so it will be very easy to port nisp to other languages.
No closure or complex data type is required, even plain C can implement nisp easily.

Everything inside nisp is just function, so it's very easy to keep everything type safe, and with the composable nature,
nisp is an ideal middle layer to carry query or RPC. Such as the Websocket RPC lib based on nisp: https://github.com/ysmood/nisper.

# Quick Start

For more examples, read the unit test of this project.

Try it online: https://runkit.com/ysmood/nisp-demo

### Implementaions

- Golang: https://github.com/ysmood/gisp
- Ruby: https://github.com/ysmood/ruby-nisp


### Define your own function

For a simple example, here you can use it as a sum-only-calculator.

```js
import nisp from 'nisp'

var sandbox = {
    '+': (a, b) => a + b
};

var exp = ['+', 1, ['+', 1, 1]];

nisp(exp, sandbox); // => 3
```


### Encode and escape data

Sometimes you may want to separate nisp code and raw data,
Here we provide `encode` function to reduce the pain of typing
quotes and commas. The grammar is a subset of lisp.

```js
import nisp from 'nisp'
import encode from 'nisp/lib/encode'
import $ from 'nisp/lib/$'

var sandbox = {
    $, // raw data
    "+": ns => ns.reduce((a, b) => a + b),
    "++": ns => ns.map(a => a + 1)
};

var data = [1, 2, 3]

var exp = encode`(+ (++ ${data}))`

nisp(exp, sandbox); // => 9
```


### Composable RPC and safe by design

Commonly used RPC libs such as json-rpc, thrift and GRPC can
only handle function per call, if you want to handle large
amount of data with two procedures, you have to load all of them
on each procedure, that is a big waste. With nisp, you can
seamlessly compose multiple functions into one remote call.

We even used nisp to create a simple db query language, and it
automatically helps us defense insertion attach by its nature.

```js
import nisp, { error } from 'nisp'

var sandbox = {
    concat (...args) {
        return args.reduce((a, b) => a.concat(b));
    },

    getAnimals () {
        if (this.env.isZooKeeper)
            return ['cat', 'dog'];
        else
            error(this, "Not Allowed"); // it will log error stacks
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
import nisp from 'nisp'
import encode from 'nisp/lib/encode'
import $ from 'nisp/lib/$'
import args from 'nisp/lib/args'
import $do from 'nisp/lib/do'

var sandbox = {
    $,

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
    (if           true  (+ 1 1) (+ 2 2))
    (non-lazy-if  false (+ 1 1) (+ 2 2))
    (half-lazy-if true  (+ 1 1) (+ 2 2))
)`;

nisp(exp, sandbox);
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

The project is written in typescript, all main APIs are typed and commented.
