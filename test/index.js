const parser = require('..')
const fs = require('fs')
const util = require('util')
const path = require('path')
const test = require('ava')
const fixtures = path.join(__dirname, 'fixtures')

test('parser', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'nesting.html'), 'utf8')
  console.log(util.inspect(parser(html), { showHidden: false, depth: null, colors: true }))
})

test.skip('lexer', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'simple.html'), 'utf8')
  console.log(parser.lex(html))
})

test.skip('pipe', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'pipe.html'), 'utf8')
  console.log(parser(html))
})

test.skip('id', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'id.html'), 'utf8')
  console.log(parser(html))
})

test.skip('class', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'class.html'), 'utf8')
  console.log(parser(html))
})

test.skip('comment', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'comments.html'), 'utf8')
  console.log(parser(html))
})
