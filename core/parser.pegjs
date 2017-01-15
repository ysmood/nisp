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

start
	= nisp / _

nisp
	= _ '(' _ exp:(val / nisp)* _ ')' _ { return exp }

val
	= 'true' _ { return true }
    / 'false' _ { return false }
    / 'null' _ { return null }
    / number
    / str:$[^' \t\r\n()]+ _ { return str }
	/ quote str:$char* quote _  { return str }

char
    = "''" { return "'" }
    / [^']

quote
	= "'"

_
	= ws (comment ws)*

comment
	= '#' [^\r\n]*

ws "whitespace"
	= [ \t\r\n]*

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

exp
  = [eE] (minus / '+')? DIGIT+

frac
  = "." DIGIT+

int
  = '0' / ([1-9] DIGIT*)

minus
  = "-"

DIGIT  = [0-9]