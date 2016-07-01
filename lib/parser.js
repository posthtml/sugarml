// Our target output is a posthtml AST
// More details on this format coming soon
module.exports = (tokens) => {
  let current = 0
  let indentLevel = 0
  let token = tokens[current]

  function walk (ctx) {
    // grab the current token
    token = tokens[current]

    // special handling for doctypes
    if (token && token.type === 'doctype') {
      current++
      return `<!DOCTYPE ${token.value}>`
    }

    // if there is text content add it to the root
    if (token && token.type === 'content') {
      current++
      return token.value
    }

    if (token && token.type === 'comment') {
      current++
      return `<!-- ${token.value} -->`
    }

    // if we have a tag, let's start formatting it into an AST
    if (token && token.type === 'tag') {
      // create our base node with the tag's name
      const node = {
        tag: token.value,
        content: []
      }

      // move past the tag token
      next()

      // get the attributes
      if (token.type === 'attributeKey') { node.attrs = {} }
      while (token.type === 'attributeKey' || token.type === 'attributeValue') {
        // if we have a key, add it to attrs with empty string value
        if (token.type === 'attributeKey') {
          node.attrs[token.value] = ''
          next()
        }
        // if we have a value, add it as the value for the previous key
        if (token.type === 'attributeValue') {
          const previousKey = tokens[current - 1].value
          node.attrs[previousKey] = token.value
          next()
        }
      }

      // grab the current indent level, we need to to decide how long to keep
      // searching for contents
      const currentIndent = indentLevel

      // now we recurse to get the contents, looping while the indent level is
      // greater than that of the current node, to pick up everything nested
      node.content.push(walk(node.content))
      while (indentLevel > currentIndent) {
        node.content.push(walk(node.content))
      }

      // add the node to the previous context's content
      return node
    }

    // if there is a newline add it to the root
    if (token && token.type === 'newline') {
      // move past the newline
      next()

      // if the next token is a tag, it must be at the root indent level, so
      // we reset the indent level before moving forward. this happens at the
      // end of the page, with the last element usually
      if (token && token.type === 'tag') {
        indentLevel = 0
      }

      // if the next token is an indent, we need to deal with nesting
      if (token && token.type === 'indent') {
        // if our indent level is greater than what we were at before, we
        // recurse again, and update the current indent level
        if (token.level > indentLevel) {
          indentLevel = token.level
          current++
          ctx.push('')
          return walk(ctx)
        }

        // if the indent level is the same as before, we just continue parsing
        // at the same level
        if (token.level === indentLevel) {
          current++
          return ''
        }

        // if the indent level is less than before, we decrease the indent level
        // to match and return
        if (token.level < indentLevel) {
          indentLevel = token.level
          current++
          return ''
        }
      } else {
        return ''
      }
    }

    if (typeof token === 'undefined') {
      // end of input, this means our indent level is back to zero
      // this will break out of any existing nest loops
      indentLevel = 0
      return
    }

    // if we haven't matched here, we're not up to date with the lexer
    throw new TypeError(`Unrecognized token type: ${token.type}`)
  }

  // run the parser
  const root = []
  while (current < tokens.length) { root.push(walk(root)) }
  return root

  //
  // Utilities
  //

  function next () {
    token = tokens[++current]
  }
}
