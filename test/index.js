const parser = require('..')
const fs = require('fs')
const path = require('path')
const test = require('ava')
const posthtml = require('posthtml')
const fixtures = path.join(__dirname, 'fixtures')
// const {inspect} = require('util')

test('basic coverage example', (t) => {
  return compare(t, 'simple')
})

test('attributes', (t) => {
  return compare(t, 'attributes')
})

test('pipe', (t) => {
  return compare(t, 'pipe')
})

test('id', (t) => {
  return compare(t, 'id')
})

test('class', (t) => {
  return compare(t, 'class')
})

test('class and id', (t) => {
  return compare(t, 'class-id')
})

test('comment', (t) => {
  return compare(t, 'comments')
})

function compare (t, name, log) {
  let html, expected

  try {
    html = fs.readFileSync(path.join(fixtures, `${name}.html`), 'utf8')
    expected = fs.readFileSync(path.join(fixtures, `expected/${name}.html`), 'utf8')
  } catch (err) {
    console.error(err)
  }

  return posthtml()
    .process(html, { parser })
    .then((res) => {
      if (log) console.log(res.html)
      t.is(res.html, expected.trim())
    })
}
