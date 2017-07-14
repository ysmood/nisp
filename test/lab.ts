import nisp from '../core'
import encode from '../lib/encode'
import $do from '../lib/do'
import def from '../lib/def'
import $ from '../lib/$'
import format from '../lib/format'

let add = function (...args) {
    return args.reduce(function (s, v) {
        return s += v;
    });
}

var sandbox = {
    do: $do,
    "+": add,
    $,
    atob: (v) => Buffer.from(v, 'base64'),
    "get" (a, b) {
        return a[b];
    },
    def
};

console.log(
    format(`
(do
    # 定义根节点
   (def root http://portal.fe.st.sankuai.com/perf)
    # 计算根节点url长度
   (def rootLen (len (root)))
   (:
       nisp true
        # 将根节点遍历出来的结果加入依赖 该依赖下的文件如果变化 会导致清缓存操作
       deps (|
           (+ (root)/**)
       )
       value (reduce
           (map # 映射函数 
               (filter #将所有类型为Query的记录取出来
                   (glob (+ ^(root)/))
                    (fn
                         (item)
                        # (= (get (item) type) Json)
                    )
                   # (fn
                   #     (item)
                   #     (= (get (item) type) Query)
                   # )
               )
               (fn #对取出来的逻辑 应用以下逻辑 
                   (item)
                   (do
                       (def val
                           (file
                               (+
                                   (get (item) uri)?(rawQuery) # 拼接字串
                               )
                               nisp
                           )
                       )
                         # (val)
                       (|
                           (substring (get (val) file.uri) (rootLen)) # 这里算相对地址
                           (if
                               (get (val) nisp)
                               (parse (get (val) file.value)) # 如果nisp为true 解析
                               (| $ (get (val) file.value)) # 如果nisp为false 则从缓存中取它值
                           )
                       )
                   )
               )
           )
           (fn
               (array item) #fn函数的两个参数
               (concat (array) (item)) # 将item的队列合并到一个大的队列中
           )
           (| :)
           ()
       )
   )
)
    `)
)

console.log(
    nisp(
        encode`(+ 1 2 ${new Buffer([97])})`,
        sandbox
    )
)