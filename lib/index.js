const lex = require('./lexer')
const parse = require('./parser')

module.exports = (input) => {
  return parse(lex(input))
}

module.exports.lex = lex
module.exports.parse = parse
