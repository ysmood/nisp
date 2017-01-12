//Nisp Grammar
//[1] https://github.com/pegjs/pegjs/blob/master/examples/json.pegjs
{
  function sandbox(name) {
    return options.sandbox[name]
  }
  
  function decode(value) {
    return options.decode(value)
  }
}

nisp
  = ws '(' ws call:call ws ')' ws { return call }
  / ws '(' ws ')' ws { return undefined }

call
  = ref:ref ws args:arguments { return [sandbox(ref)].concat(args) }
  / ref:ref { return [sandbox(ref)] }
  
ref
  = "(" ws call:call ws ")" { return call }
  / identifier
  / string
  / stringx

arguments
  = left:data ws right:arguments { return [left].concat(right) }
  / data:data { return [data] }

data
  = value
  / binary
  / "(" ws call:call ws ")" { return call }

identifier "id"
  = [^()'" \t\n\r]+ { return text() }
  
binary "binary"
  = [\x60][^\x60]*[\x60] { return decode(text().slice(1, -1)) }

begin_array     = ws "[" ws
begin_object    = ws "{" ws
end_array       = ws "]" ws
end_object      = ws "}" ws
name_separator  = ws ":" ws
value_separator = ws "," ws

ws "whitespace" = [ \t\n\r]*

// ----- 3. Values -----

value
  = false
  / null
  / true
  / object
  / array
  / number
  / string

false = "false" { return false; }
null  = "null"  { return null;  }
true  = "true"  { return true;  }

// ----- 4. Objects -----

object
  = begin_object
    members:(
      head:member
      tail:(value_separator m:member { return m; })*
      {
        var result = {};

        [head].concat(tail).forEach(function(element) {
          result[element.name] = element.value;
        });

        return result;
      }
    )?
    end_object
    { return members !== null ? members: {}; }

member
  = name:string name_separator value:value {
      return { name: name, value: value };
    }

// ----- 5. Arrays -----

array
  = begin_array
    values:(
      head:value
      tail:(value_separator v:value { return v; })*
      { return [head].concat(tail); }
    )?
    end_array
    { return values !== null ? values : []; }

// ----- 6. Numbers -----

number "number"
  = minus? int frac? exp? { return parseFloat(text()); }

decimal_point
  = "."

digit1_9
  = [1-9]

e
  = [eE]

exp
  = e (minus / plus)? DIGIT+

frac
  = decimal_point DIGIT+

int
  = zero / (digit1_9 DIGIT*)

minus
  = "-"

plus
  = "+"

zero
  = "0"

// ----- 7. Strings -----

stringx "stringx"
  = quotation_markx chars:charx* quotation_markx { return chars.join(""); }

string "string"
  = quotation_mark chars:char* quotation_mark { return chars.join(""); }
  
charx
  = unescapedx
  / escape
    sequence:(
        "'"
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

char
  = unescaped
  / escape
    sequence:(
        '"'
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

quotation_markx
  = "'"
  
quotation_mark
  = '"'

unescaped
  = [^\0-\x1F\x22\x5C]
  
unescapedx
  = [^\0-\x1F\x27\x5C]

// ----- Core ABNF Rules -----

// See RFC 4234, Appendix B (http://tools.ietf.org/html/rfc4234).
DIGIT  = [0-9]
HEXDIG = [0-9a-f]i