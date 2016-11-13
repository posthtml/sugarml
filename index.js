const lex = require('./lib/lexer')
const parse = require('./lib/parser')

/**
 * @author Jeff Escalante (@jescalan)
 * @description SugarML Parser
 * @license MIT
 *
 * @module posthtml-sugarml
 * @version 1.0.0
 *
 * @requires lib/lexer.js
 * @requires lib/parser.js
 *
 * @param  {Object} options Options
 *
 * @return {Function}
 */
module.exports = function (options) {
  options = options || { pretty: false, location: true }
  /**
   * @method SugarML
   *
   * @param  {String} src File
   *
   * @return {Object}     PostHTML Tree
   */
  return function sugarml (src) {
    return parse(lex(src, options), options)
  }
}
