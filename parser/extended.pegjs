
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
{
  var types = {
    blank: 0,
    comment: 1,
    package: 2,
    value: 3,
    nisp: 4
  };
}

start
  = l:_ v:val r:_ {
    return { type: types.package, left: l, value: v, right: r };
  }

val
  = n:nisp
  / 'true'  { return { type: types.value, value: true }; }
  / 'false' { return { type: types.value, value: false }; }
  / 'null'  { return { type: types.value, value: null }; }
  / $number { return { type: types.value, value: parseFloat(text()) }; }
  / '@'     { return { type: types.value, value: '@' }; }
  / $name   { return { type: types.value, value: text() }; }
  / string  { return { type: types.value, value: text() }; }


nisp
  = '('
    l:_
    values:(
      head:val tail:sep_val* { tail.unshift(head); return tail; }
    )?
  	r:_ ')' {
      return {
        type: types.nisp,
        left: l,
        value: values === null ? [] : values,
        right: r
      };
    }


sep_val 'value'
  = l:_ v:val {
    return { type: types.package, left: l, value: v };
  }

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


_ "whitespace"
  = (
    $([ \t\r\n]+) { return { type: types.blank, value: text() }; }
    /
    $comment { return { type: types.comment, value: text() }; }
  )*

comment
  = '#' [^\r\n]*

number
  = '-'? digit+ ("." digit+)? !name

digit
  = [0-9]