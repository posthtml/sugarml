const fs = require('fs')
const path = require('path')
const test = require('ava')

const posthtml = require('posthtml')
const parser = require('..')()

const fixture = (file) => {
  return fs.readFileSync(path.join(__dirname, 'fixtures', file), 'utf8')
}

const expect = (file) => {
  return fs.readFileSync(path.join(__dirname, 'expect', file), 'utf8')
}

function compare (t, name, log) {
  let html, expected

  try {
    html = fixture(name)
    expected = expect(name)
  } catch (err) {
    console.error(err)
  }

  return posthtml()
    .process(html, { parser: parser })
    .then((result) => {
      if (log) console.log(result.html)
      t.is(result.html, expected.trim())
    })
}

function error (name, cb) {
  const html = fixture(name)

  try {
    return posthtml().process(html, { parser: parser })
  } catch (err) {
    cb(err.toString())
  }
}

test('Basic', (t) => {
  return compare(t, 'index.html')
})

test('Attrs', (t) => {
  return compare(t, 'attrs.html')
})

test('Content', (t) => {
  return compare(t, 'content.html')
})

test('ID', (t) => {
  return compare(t, 'id.html')
})

test('Class', (t) => {
  return compare(t, 'class.html')
})

test('ID&&Class', (t) => {
  return compare(t, 'class&id.html')
})

test('Comment', (t) => {
  return compare(t, 'comment.html')
})

test('Error', (t) => {
  return error('index.html', (err) => {
    t.truthy(err === 'Error: Cannot parse character "<" at 1:1')
  })
})
