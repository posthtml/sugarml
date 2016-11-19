// ------------------------------------
// #SugarML - Lexer
// ------------------------------------

'use strict'

module.exports = function Lexer (input) {
  let line = 1
  let col = 1
  let current = 0
  let tokens = []

  // Strip utf8 BOM and standardize line breaks
  input = input.replace(/^\uFEFF/, '')
  input = input.replace(/\r\n|\r/g, '\n')

  // grab the current character
  let char = input[current]
  let last

  while (current < input.length) {
    doctype()
    content()
    tag()
    attrs()
    indent()
    newline()
    comment()

    if (char === 'undefined') continue // end of input

    // are we infinite looping? throw an error
    if (last === current) {
      throw new Error(`Cannot parse character "${char}" at ${line}:${col}`)
    }

    last = current
  }

  return tokens

  /**
   * Doctype
   */
  function doctype () {
    // doctype must be the first thing in the document
    if (current === 0 && lookahead(7) === 'doctype') {
      // move past the entire word 'doctype'
      char = input[current += 7]

      col += 7

      // is there's a space afterwards, skip it
      if (char.match(/\s/)) next()

      // after the space, collect til EOL
      let content = ''

      while (char !== '\n') {
        content += char
        next()
      }

      token('doctype', content)
    }
  }

  /**
   * Content - '|'
   */
  function content () {
    if (char === '|') {
      // move past the pipe
      next()

      // move past the space after it, if there is one
      if (char.match(/\s/)) next()

      // grab all the text contents
      let content = ''

      while (char !== '\n') {
        content += char
        next()
      }

      token('content', content)
    }
  }

  /**
   * Tag
   */
  function tag () {
    /**
     * Nested
     */
    if (char && char === ':') {
      // move past the colon
      next()
      // if there's a space for padding, move past this
      if (char.match(/\s/)) next()
      // TODO: might need to add artificial indent here
    }

    /**
     * Short - (Class '.' && ID '#')
     */
    if (char === '#' || char === '.') {
      // store type for later
      const key = char === '#' ? 'id' : 'class'

      // move past the # or .
      next()

      // match until another #, ., (, :, or space
      let value = ''

      while (!char.match(/[#\.\(:\s]/)) {
        value += char
        next()
      }

      // if there was no previous element, it's a div
      // this could be configurable if there's demand for it
      const lastToken = tokens[tokens.length - 1]

      if (
        !lastToken ||
        ['tag', 'attrKey', 'attrVal'].indexOf(lastToken.type) < 0
      ) {
        token('tag', 'div')
      }

      // we have to add an attribute key and value to represent class/id
      // the value is quoted using single quotes for consistency
      token('attrKey', key)
      token('attrVal', value)
    }

    if (char.match(/\w/)) {
      // element names can include any character, technically.
      // except for, due to language syntax: ['#', '.', '(', ':', '\s']
      let tag = ''

      while (!char.match(/[#\.\(:\s]/)) {
        tag += char
        next()
      }

      token('tag', tag)
    }
  }

  /**
   * Attributes - directly following a tag, wrapped in parens. Attributes
   * themselves can be boolean or key/value, and are space-separated.
   */
  function attrs () {
    if (char === '(') {
      // move past the open paren
      next()

      // we're in attribute land until the *close paren*
      while (char !== ')') {
        // attempt to get the attribute key
        // - if it has a value, it will end at the *=*
        // - if it's boolean, it will end at the *paren* or *space* (next attr)
        let key = ''

        while (!char.match(/[=\)\s]/)) {
          key += char
          next()
        }

        // if we do have a key, add it to our tokens
        if (key.length) token('attrKey', key)

        // attempt to get the value, which exists if there's an *=*
        let value = ''

        if (char === '=') {
          // move past the equals
          next()

          // if there's an open quote, move past it
          let quoted = false

          if (char.match(/['"]/)) {
            quoted = true
            next()
          }

          // now we grab the value, it ends at a *space*, *close paren*, or
          // a *close quote*. if it's quoted though, we don't match *space*.
          // this is because you can have div(class='foo bar')
          let regex = /[\s\)'"]/

          if (quoted) { regex = /[\)'"]/ }

          while (!char.match(regex)) {
            value += char
            next()
          }

          // if there's a close quote, move past it
          if (char.match(/['"]/)) next()
        }

        // if we did match a value, push it to tokens
        if (value.length) token('attrVal', value)

        // if we have a *space*, move on to the next attribute
        if (char.match(/\s/)) next()
      }
      // done with attributes, move past the *close paren*
      if (char === ')') next()
    }
  }

  /**
   * An unmatched space at this point could be either an indent, or a space
   * between a tag and its contents.
   */
  function indent () {
    if (char.match(/\s/) && !char.match(/\n/)) {
      const lastToken = tokens[tokens.length - 1]

      // if the previous token was a newline, we're looking at an indent
      let level = 0
      let indent = ''

      if (lastToken.type === 'newline') {
        while (char.match(/\s/) && !char.match(/\n/)) {
          indent += char

          level++

          next()
        }

        token('indent', indent, { level: level })
      }

      // if the previous token was a tag, it's a space before content or
      // trailing whitespace on an empty tag
      if (['tag', 'attrKey', 'attrVal'].indexOf(lastToken.type) > -1) {
        // move past the space
        next()

        // pull contents until we hit a newline
        let content = ''

        while (char && char !== '\n') {
          content += char
          next()
        }

        token('content', content)
      }
    }
  }

  /**
   * Newline - line break
   */
  function newline () {
    if (char && char.match(/\n/)) {
      token('newline', char)

      next()

      line++; col = 0 // increment the line number, reset the col
    }
  }

  /**
   * Comment - "//"
   */
  function comment () {
    // comments
    if (char === '/' && next(1) === '/') {
      // move past the two slashes
      next(); next()

      // if there is a dash, then unbuffered comment and we should skip it
      if (char === '-') {
        while (char && char !== '\n') {
          next()
        }

        return
      }

      // if there is a space, move past that
      if (char.match(/\s/)) next()

      // grab the comment body
      let comment = ''

      while (char && char !== '\n') {
        comment += char
        next()
      }

      token('comment', comment)
    }
  }

  /**
   * Adds a token with a name and value, also line/col position.
   * @param {String} type - name/type of the token, ex. "tag"
   * @param {String} value - token's contents/value, ex. "div"
   */
  function token (type, value, extras) {
    tokens.push(Object.assign({ type, value, line, col }, extras))
  }

  /**
   * Moves to the next character
   */
  function next (n) {
    /**
     * Previews the character after the current one
     * @param {Integer} n - number of characters ahead to skip
     */
    if (n) return input[current + 1]

    char = input[++current]

    col++
  }

  /**
   * Looks ahead the specified number of characters and returns a string
   * @param {Integer} n - number of characters ahead to pull
   */
  function lookahead (n) {
    let counter = current

    const target = current + n

    let res = ''

    while (counter < target) {
      res += input[counter]
      counter++
    }

    return res
  }
}
