const parse = require('..')
const fs = require('fs')
const path = require('path')
const test = require('ava')
const fixtures = path.join(__dirname, 'fixtures')

test('lexer', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'simple.html'), 'utf8')
  console.log(parse(html))
})

test.skip('pipe', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'pipe.html'), 'utf8')
  console.log(parse(html))
})

test.skip('id', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'id.html'), 'utf8')
  console.log(parse(html))
})

test.skip('class', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'class.html'), 'utf8')
  console.log(parse(html))
})

test.skip('comment', (t) => {
  const html = fs.readFileSync(path.join(fixtures, 'comments.html'), 'utf8')
  console.log(parse(html))
})
