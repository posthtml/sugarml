[![NPM][npm]][npm-url]
[![Deps][deps]][deps-url]
[![Tests][travis]][travis-url]
[![Coverage][cover]][cover-url]
[![Standard Code Style][style]][style-url]

<div align="center">
  <img width="220" height="200" title="PostHTML" src="http://posthtml.github.io/posthtml/logo.svg">
  <h1>SugarML<h1>
  <p>PostHTML Sugar Syntax</p>
</div>

[npm]: http://img.shields.io/npm/v/sugarml.svg?style=flat
[npm-url]: https://badge.fury.io/js/sugarml

[deps]: http://img.shields.io/david/posthtml/sugarml.svg?style=flat
[deps-url]: https://david-dm.org/posthtml/sugarml

[travis]: http://img.shields.io/travis/posthtml/sugarml/master.svg?style=flat
[travis-url]: https://travis-ci.org/posthtml/sugarml

[cover]: http://img.shields.io/coveralls/posthtml/sugarml.svg?style=flat
[cover-url]: https://coveralls.io/github/posthtml/sugarml

A simple parser for whitespace-significant html, intended for use with [posthtml](https://github.com/posthtml/posthtml).

> **Note:** This project is in early development, and versioning is a little different. [Read this](http://markup.im/#q4_cRZ1Q) for more details.

<h2 align="center">Why should you care?</h2>

If you are interesting in using posthtml, but enjoy whitespace-significant html syntax, like jade, slim, etc. You have come to the right place. Alternately, if you are simply looking for a strong alternative to jade for any other reason, read on.

This parser's syntax is heavily inspired by [jade/pug](http://jade-lang.com/). It is a much smaller and simpler version, containing only the bare minimum necessary to write clean whitespace-significant html. It is intended for use as a posthtml plugin, and returns a [PostHTML AST](https://github.com/posthtml/posthtml-parser#posthtml-ast-format), but could in theory be used for any other purpose as well.

If you are looking for the ability to add expressions, variables, loops, layouts, etc. you can implement them through other posthtml plugins in addition to this parser. This type of functionality is outside the scope of this parser as it is intended to be light, simple, modular, and accessible to contributors.

The source is not very long or complicated and is heavily commented for clarity. Take a look and feel free to contribute!

<h2 align="center">Install</h2>

```bash
npm i -S sugarml
```

> **Note:** This project is compatible with node v6+ only

<h2 align="center">Usage</h2>

```js
'use strict'

import { readFileSync } from 'fs'

import posthtml from 'posthtml'
import sugarml from 'sugarml'

const html = readFileSync('./index.sml', 'utf8')

posthtml()
  .process(html, { parser: sugarml })
  .then((result) => console.log(result.html))
```

This parser is very loose with its rules and standards. It is not responsible for enforcing good style or conventions, it's simply responsible for compiling your code. This means that you can use all sorts of invalid characters in attribute and tag names, and indentation rules are extremely loose.

#### Indentation & Nesting

This parser determines how tags are nested based on indentation. For example:

```sml
.first-level
  .second-level
    .third-level hi!
  .second-level-2
```

This would be compiled into the following html output:

```html
<div class='first-level'>
  <div class='second-level'>
    <div class='third-level'>hi!</div>
  </div>
  <div class='second-level-2'></div>
</div>
```

_As long as one line is indented with more characters than the last, it will be nested_. It doesn't matter if the number of characters that you use is consistent, or if they are spaces or tabs, or anything else. It's just the number of space characters used to indent, that's it. So you can get away with very messy code, if you want, but that's what linters are for.

#### Tags

A tag is written simply as the name of the tag. Tag names must start with a letter, then after that can contain any character other than `#`, `.`, `(`, `:`, or a space/tab. These character limitation are in place solely because of the language's syntax requirements.

So, for example, these tag names are valid and will compile correctly (although I would not advise using a tag with characters other than letters and hyphens personally):

```sml
div
custom-name
wow@mytagiscool!
hello___12world
```

However, these tag names will not compile into the results you expect:

```sml
foo(bar
hello.min.js
iam:atag
my cool tag
```

Fortunately, it is not advisable to have custom html tags that look anything like these anyway, so you should be in the clear as long as you are writing reasonable html.

#### Classes & IDs

There is a shorthand for adding classes and IDs to your tags, which is exactly the same as it is in just about every other whitespace-significant html parser, and the same as CSS. For example:

```html
p#main >>> <p id='main'></p>
p.staff >>> <p class='staff'></p>
p#main.staff.active >>> <p id='main' class='staff active'></p>
```

You can chain as many classes and IDs in this manner as you want. If you do not use an element name, it will assume you want a div. For example:

```html
#main >>> <div id='main'></div>
```

#### Attributes

Attributes fall between parentheses directly after a tag's name. They are space-separated and can be either boolean (key, no value), or key/value pairs. For example:

```html
input(type='text') >>> <input type='text'>
input(checked) >>> <input checked>
input(type='checkbox' checked) >>> <input type='checkbox' checked>
```

You can quote your attribute values or not, your choice (although we would recommend quoting). However, if the value contains a space, it must be quoted. For example:

```html
div(class=foo) >>> <div class='foo'></div>
div(class='foo bar') >>> <div class='foo bar'></div>
div(class=foo bar) >>> <div class='foo' bar></div>
```

Attributes can contain any character other than `=` or a space. If you value is quoted, it can contain any value other than a quote (that will end the attribute), and if it's not quoted, it can contain any value other than a quote or space. So even attributes with special characters (found sometimes in certain front-end frameworks like vue and angular) work fine. For example:

```html
div(:bind='focus') >>> <div :bind='click'></div>
div(*ngFor='foo in bar') >>> <div *ngFor='foo in bar'></div>
div(@click='doSomething') >>> <div @click='doSomething'></div>
```

#### Inline Nested Tags

Sometimes you don't really want to indent nested tags when they are short enough to be placed on one line. When this happens, you can use a colon instead of a newline and indent to nest. For example:

```html
ul
  li: a(href='#') link 1
  li: a(href='#') link 2
```

You can nest as many wrapper tags on a single line as you want, as long as they are all separated by a colon immediately following the tag. However If the tag has content, it cannot be nested with a colon. For example:

```
.wrap: .wrap2: .wrap3 hello! // this works fine
.wrap hello!: .wrap2 // this does not
```

#### Nested Text Content

If you need to mix up text content alongside inline tags and such, you can use the pipe character for this as such:

```
p
  | Here's some text
  strong And some bold text
  | ...and some more text
```

This would render as:

```html
<p>Here's some text <strong>and some bold text</strong> ...and some more text</p>
```

For any type of content transforms that are more complex than this, we recommend checking out [posthtml-content](https://github.com/posthtml/posthtml-content).

#### Doctypes

The doctype is a special tag, and is handled specially. If the first word on the first line of your template is `doctype`, it will be parsed as a doctype. Anything after this word will be added to the tag. So for example:

```html
doctype html >>> <!DOCTYPE html>
doctype HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd" >>> <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
```

<h2 align="center">Example</h2>

**Input:**

```html
doctype html
html
  head
    title Testing
  body#index
    h1 Hello world!
    p.intro Wow what a great little language! Some features:
    ul(data-list='yep' @sortable)
      li: a(href='#') whitespace significant!
      li: a(href='#') simple classes and ids!
    footer
      | Thanks for visiting
      span see you next time!
```

**Setup:**

```js
'use strict'

import { readFileSync } from 'fs'

import posthtml from 'posthtml'
import sugarml from 'sugarml'

const html = readFileSync('./index.sml', 'utf8')

posthtml()
  .process(html, { parser: sugarml })
  .then((result) => console.log(result.html))
```

**Output:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Testing</title>
  </head>
  <body id='index'>
    <h1>Hello world!</h1>
    <p class='intro'>Wow what a great little language! Some features:</p>
    <ul data-list='yep' @sortable>
      <li><a href='#'>whitespace significant!</a></li>
      <li><a href='#'>simple classes and ids!</a></li>
    </ul>
    <footer>
      Thanks for visiting
      <span>see you next time!</span>
    </footer>
  </body>
</html>
```
<h2 align="center">Maintainer</h2>

| [![Jeff Escalante][maintainer]][maintainer-url] |
|-------------------------------------------------|
| [Jeff Escalante][maintainer-url]                |

<h2 align="center">LICENSE & CONTRIBUTING</h2>

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](CONTRIBUTING.md)

[npm]: http://img.shields.io/npm/v/sugarml.svg?style=flat
[npm-url]: https://badge.fury.io/js/sugarml

[deps]: http://img.shields.io/david/posthtml/sugarml.svg?style=flat
[deps-url]: https://david-dm.org/posthtml/sugarml

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[travis]: http://img.shields.io/travis/posthtml/sugarml/master.svg?style=flat
[travis-url]: https://travis-ci.org/posthtml/sugarml

[cover]: http://img.shields.io/coveralls/posthtml/sugarml.svg?style=flat
[cover-url]: https://coveralls.io/github/posthtml/sugarml

[maintainer]: https://avatars.githubusercontent.com/u/556932?s=125
[maintainer-url]: https://github.com/jescalan
