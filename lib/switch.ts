import nisp, { error, macro, arg } from '../core'

// ["if", <cond>, <exp1>, <exp2>]
export default macro((ctx) => {
    let { sandbox, ast } = ctx,
        len = ctx.ast.length,
        value = arg(ctx, 1);

    let obj = {
        hit: false,
        value: undefined
    }

    const $case = (val, exp) => {
        const _val = nisp(val, Object.create(sandbox), ctx.env, ctx, ctx.index);
        if (value === _val) {
            obj.hit = true;
            obj.value = nisp(exp, Object.create(sandbox), ctx.env, ctx, ctx.index);
        }
        return obj;
    }

    const $default = (val) => {
        if (!obj.hit) {
            obj.hit = true;
            obj.value = nisp(val, Object.create(ctx.sandbox), ctx.env, ctx, ctx.index);
        }
        return obj;
    }

    for (let i = 2; i < len; i++) {
        const action = ast[i][0];
        if (action === 'default' && i !== len - 1) {
            error(ctx, 'please put the case in front of default');
        }
        if (action === 'case') {
            obj = $case(ast[i][1], ast[i][2]);
        } else if (action === 'default') {
            obj = $default(ast[i][1]);
        }

        if (obj.hit) {
            return obj.value;
        }
    }

});
