
/*
 * Nisp Encode Grammar
 * It is a very simple data format, it mates lisp and json together.
 * It is designed to be fast and lightweight.
 * ==========================
 *
 * (foo
 *     # comment
 *     (bar 'test')
 *
 *     # same with json string, except single quot is used
 *     'We\nll'
 *
 *     # json data type: number, string, true, false, null
 *     (1 test true false null)
 *
 *     # data embed placeholder
 *     @
 * )
 */

start
    = _ v:val _ { return v }

val
    = nisp
    / 'true'  { return true }
    / 'false' { return false }
    / 'null'  { return null }
    / $number { return parseFloat(text()) }
    / '@'     { return options.data() }
    / $name
    / string


nisp
    = '(' _
    values:(
    	head:val tail:sep_val* { tail.unshift(head); return tail }
    )?
    _ ')' { return values === null ? [] : values }


sep_val 'value'
    = _ v:val { return v }

name 'name'
	= [^' ()\r\n\t]+

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }

char
  = unescaped
  / escape
    sequence:(
        '\''
      / "\\"
      / "/"
      / "b" { return "\b"; }
      / "f" { return "\f"; }
      / "n" { return "\n"; }
      / "r" { return "\r"; }
      / "t" { return "\t"; }
      / "u" digits:$(HEXDIG HEXDIG HEXDIG HEXDIG) {
          return String.fromCharCode(parseInt(digits, 16));
        }
    )
    { return sequence; }

escape
  = "\\"

quotation_mark
  = '\''

unescaped
  = [^\0-\x09\x0b-\x0c\x0e-\x1F\x27\x5C]

HEXDIG = [0-9a-f]i

_ = (whiteSpace / comment)*

whiteSpace "whitespace"
  = "\t"
  / "\v"
  / "\f"
  / " "
  / "\u00A0"
  / "\uFEFF"
  / zs
  / "\n"
  / "\r\n"
  / "\r"
  / "\u2028"
  / "\u2029"

// Separator, Space
zs = [\u0020\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]

comment
	= '#' [^\r\n]*

number
    = '-'? digit+ ("." digit+)? !name

digit
    = [0-9]
