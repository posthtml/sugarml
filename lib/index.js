const lexer = require('./lexer')

module.exports = (input) => {
  return lexer(input)
}
