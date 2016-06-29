module.exports = function Lexer (input) {
  let line = 1
  let col = 0
  let current = 0
  let tokens = []

  // Strip utf8 BOM and standardize line breaks
  input = input.replace(/^\uFEFF/, '')
  input = input.replace(/\r\n|\r/g, '\n')

  // grab the current character
  let char = input[current]

  while (current < input.length) {
    pipe()
    tag()
    classId()
    attributes()
    indentOrTagContent()
    newline()
    nestedInlineTag()
    comment()
    if (char === 'undefined') continue // end of input
    // TODO prevent infinite loop if invalid syntax
  }

  return tokens

  /**
   * Pipe - starting a line with a pipe denotes text content inside a tag
   */
  function pipe () {
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
      addToken('content', content)
    }
  }

  /**
   * Tag - matches normal characters, creates a html tag token
   */
  function tag () {
    if (char.match(/\w/)) {
      // element names can include any character, technically.
      // except for, due to language syntax: ['#', '.', '(', ':', '\s']
      let tag = ''
      while (!char.match(/[#\.\(:\s]/)) {
        tag += char
        next()
      }

      addToken('tag', tag)
    }
  }

  // parse for class or id shortcuts via '.' and/or '#'
  function classId () {
    if (char === '#' || char === '.') {
      // store type for later
      const type = char === '#' ? 'id' : 'class'

      // move past the # or .
      next()

      // match until another #, ., (, :, or space
      let val = ''
      while (!char.match(/[#\.\(:\s]/)) {
        val += char
        next()
      }

      // if there was no previous element, it's a div
      // this could be configurable if there's demand for it
      const lastToken = tokens[tokens.length - 1]
      if (!lastToken || lastToken.type !== 'tag') {
        addToken('tag', 'div')
      }

      // we have to add an attribute key and value to represent class/id
      // the value is quoted using single quotes for consistency
      addToken('attributeKey', type)
      addToken('attributeValue', `'${val}'`)
    }
  }

  /**
   * Attribute - directly following a tag, wrapped in parens. Attributes
   * themselves can be boolean or key/value, and are space-separated.
   */
  function attributes () {
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
        if (key.length) addToken('attributeKey', key)

        // attempt to get the value, which exists if there's an *=*
        let val = ''
        if (char === '=') {
          // move past the equals
          next()
          // now we grab the value, it ends at a *space* or *close paren*
          // if it's quoted, the quotes are included
          while (!char.match(/[\s\)]/)) {
            val += char
            next()
          }
        }

        // if we did match a value, push it to tokens
        if (val.length) addToken('attributeValue', val)

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
  function indentOrTagContent () {
    if (char.match(/\s/) && !char.match(/\n/)) {
      const lastToken = tokens[tokens.length - 1]

      // if the previous token was a newline, we're looking at an indent
      let indent = 0
      if (lastToken.type === 'newline') {
        while (char.match(/\s/) && !char.match(/\n/)) {
          indent++
          next()
        }
        addToken('indent', indent)
      }

      // if the previous token was a tag, it's a space before content or
      // trailing whitespace on an empty tag
      if (['tag', 'attributeKey', 'attributeValue'].indexOf(lastToken.type) > -1) {
        // move past the space
        next()

        // pull contents until we hit a newline
        let content = ''
        while (char && char !== '\n') {
          content += char
          next()
        }
        addToken('content', content)
      }
    }
  }

  /**
   * Newline - a line break
   */
  function newline () {
    if (char && char.match(/\n/)) {
      addToken('newline', char)
      next()
      line++; col = 0 // increment the line number, reset the col
    }
  }

  /**
   * Nested Inline Tag - a colon directly after a tag means we have a nested
   * inline tag
   */
  function nestedInlineTag () {
    if (char && char === ':') {
      // move past the colon
      next()
      // if there's a space for padding, move past this
      if (char.match(/\s/)) next()
      // TODO: might need to add artificial indent here
    }
  }

  /**
   * Comment - indicated by "//"
   */
  function comment () {
    // comments
    if (char === '/' && nextChar() === '/') {
      // move past the two slashes
      next(); next()

      // if there is a space, move past that
      if (char.match(/\s/)) next()

      // grab the comment body
      let comment = ''
      while (char && char !== '\n') {
        comment += char
        next()
      }
      addToken('comment', comment)
    }
  }

  /**
   * Adds a token with a name and value, also line/col position.
   * @param {String} type - name/type of the token, ex. "tag"
   * @param {String} value - token's contents/value, ex. "div"
   */
  function addToken (type, value) {
    tokens.push({type, value, line, col})
  }

  /**
   * Moves to the next character
   */
  function next () {
    char = input[++current]
    col++
  }

  /**
   * Previews the character after the current one
   */
  function nextChar () {
    return input[current + 1]
  }
}
