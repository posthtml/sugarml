const parser = require('..')
const fs = require('fs')
const path = require('path')
const test = require('ava')
const posthtml = require('posthtml')
const fixtures = path.join(__dirname, 'fixtures')

test('works with posthtml', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'simple.html'), 'utf8')
  const expected = fs.readFileSync(path.join(fixtures, 'expected/simple.html'), 'utf8')
  return posthtml()
    .process(html, { parser })
    .then((res) => {
      t.is(res.html, expected.trim())
    })
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
