# nisp

The interesting part is that it is designed to be non-turing-complete.

You have the full control of the vm, you can decide what the language can have, for example,
if you don't expose the `if` expression, the user cannot directly express if logic.

By default the language only presents the meta data of the program itself. So by default
it is used to exchange plain data.

You may ask what it does? Yes it does nothing. And that is exactly what a composable permission
protocol need. We use it to expose composable api.

The ast of nisp is plain JSON, the js implementation is only 35 lines of code, so it will be very to port nisp to other languages.


# Quick Start

For more examples, read the unit test of this project.


### Use the predefined functions

Only if the `$` function is defined, the user can define variable.

```js
var nisp = require("nisp");

var env = {
    $: require("nisp/lib/def"),
    if: require("nisp/lib/if")
};

var expresses = [
    ["$", "a", ["if", false, 10, 20]],
    "a"
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

var expresses = [
    ["+", 1, 2]
];

nisp(expresses, env); // => 6
```

### Define your own function with permission check

Here only the admin user can sum things.

```js
var nisp = require("nisp");
var plainFn = require("nisp/lib/plainFn");

var env = {
    "+": plainFn(function (a, b) {
        if (!session.isAdmin) throw Error("permission not allowed");
        return a + b;
    })
};

var expresses = [
    ["+", 1, 2]
];

var expresses = [
    ["+", 1, 2, 3]
];

nisp(expresses, env); // => 6 or Error
```

### Full control the ast

Here we implementation a `if` expression. The `if` expression is very special,
it cannot be achieved without ast manipulation.

```js
var nisp = require("nisp");
var plainFn = require("nisp/lib/plainFn");

var env = {
    "if": function (ast, env, eval) {
        return eval(ast[1], env) ?
            eval(ast[2], env) :
            eval(ast[3], env);
    },
    // Most times you don't want to use it.
    "non-lazy-if": plainFn(function (cond, a, b) {
        return cond ? a : b;
    })
};

var expresses = [
    ["+", 1, 2]
];

var expresses = [
    ["+", 1, 2, 3]
];

nisp(expresses, env); // => 6 or Error
```

# API

Checkout the files in `src` folder.
