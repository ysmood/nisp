import nisp, { error, macro } from '../core'

export default macro((ctx) => {
    let { sandbox, ast, env, index } = ctx
    ast = ast.slice(1)
    if (!ast.length) {
        return
    }
    let defaultNode
    if (ast[ast.length - 1][0] === 'default') {
        defaultNode = ast[ast.length - 1]
        ast = ast.slice(0, -1)
    }
    if (!ast.length) {
        return nisp(defaultNode[1], sandbox, env, ctx, index)
    }
    let expressionValue
    let hasExpression = false
    if (ast[0][0] !== 'case') {
        expressionValue = nisp(ast[0], sandbox, env, ctx, index)
        hasExpression = true
        ast = ast.slice(1)
    }
    for (let node of ast) {
        if (node[0] !== 'case') {
            error(ctx, 'switch unexpected identifier')
            return
        }
        const value = nisp(node[1], sandbox, env, ctx, index)
        if (hasExpression && (expressionValue === value) || !hasExpression && value) {
            return nisp(node[2], sandbox, env, ctx, index)
        }
    }
    if (defaultNode) {
        return nisp(defaultNode[1], sandbox, env, ctx, index)
    }
        
});
