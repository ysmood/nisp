/*
 * Nisp Encode Grammar
 * ==========================
 *
 * (foo
 *     # comment
 *     (bar 'test')
 *
 *     'YQ=='
 * )
 */

{
	function str (chars) {
    	var ret = '', len = chars.length
        for (var i = 0; i < len; i++) {
        	ret += chars[i]
        }
        return ret
    }
}

start
	= nisp / _

nisp
	= _ '(' _ fn:fn _ subs:(nisp / data)* _ ')' _
    {
    	subs.unshift(fn);
        return subs
    }

fn
	= $[a-zA-Z0-9_+\-*/]+

data
	= _ data_quote chars:data_char* data_quote
	{ return str(chars) }

data_char
    = "''" { return "'" }
    / [^']

data_quote
	= "'"

_
	= ws (comment ws)*

comment
	= '#' [^\r\n]*

ws "whitespace"
	= $[ \t\n\r]*
