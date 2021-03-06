[![npm][npm]][npm-url]
[![deps][deps]][deps-url]
[![tests][tests]][tests-url]
[![coverage][cover]][cover-url]
[![code style][style]][style-url]
[![chat][chat]][chat-url]

<div align="center">
  <img width="200" height="200" title="SugarML" src="https://d1yn1kh78jj1rr.cloudfront.net/preview/funny-sugar-skull-vector-t-shirt-design_zyKH5bO__M.jpg">
  <img width="220" height="200" title="PostHTML" hspace="20"     src="http://posthtml.github.io/posthtml/logo.svg">
  <h1>SugarML</h1>
</div>

<h2 align="center">Install</h2>

```bash
npm i -S posthtml-sugarml
```

<h2 align="center">Usage</h2>

```js
import { readFileSync } from 'fs'

import posthtml from 'posthtml'
import sugarml from 'posthtml-sugarml'

const html = readFileSync('./index.sml', 'utf8')

posthtml()
  .process(html, { parser: sugarml() })
  .then((result) => console.log(result.html))
```

This parser is very loose with its rules and standards. It is not responsible for enforcing good style or conventions, it's simply responsible for compiling your code. This means that you can use all sorts of invalid characters in attribute and tag names, and indentation rules are extremely loose.

#### Indentation

This parser determines how tags are nested based on indentation. For example:

```txt
.first-level
  .second-level
    .third-level Hi!
  .second-level
```

This would be compiled into the following html output:

```html
<div class="first-level">
  <div class="second-level">
    <div class="third-level">Hi!</div>
  </div>
  <div class="second-level"></div>
</div>
```

_As long as one line is indented with more characters than the last, it will be nested_. It doesn't matter if the number of characters that you use is consistent, or if they are spaces or tabs, or anything else. It's just the number of space characters used to indent, that's it. So you can get away with very messy code, if you want, but that's what linters are for.

#### Doctypes

The doctype is a special tag, and is handled specially. If the first word on the first line of your template is `doctype`, it will be parsed as a doctype. Anything after this word will be added to the tag. So for example:

```html
doctype html >>> <!DOCTYPE html>
doctype HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd" >>> <!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
```

#### Tags

A tag is written simply as the name of the tag. Tag names must start with a letter, then after that can contain any character other than `#`, `.`, `(`, `:`, or a space/tab. These character limitation are in place solely because of the language's syntax requirements.

So, for example, these tag names are valid and will compile correctly (although I would not advise using a tag with characters other than letters and hyphens personally):

```sml
tag
tag!
tag-name
tag_name
tag@name
```

However, these tag names will not compile into the results you expect

```txt
tag.name
tag:name
tag(name
tag name
```

Fortunately, it is not advisable to have custom html tags that look anything like these anyway, so you should be in the clear as long as you are writing reasonable html.

#### Nested Tags

Sometimes you don't really want to indent nested tags when they are short enough to be placed on one line. When this happens, you can use a colon instead of a newline and indent to nest. For example:

```html
ul
  li: a(href='#') link 1
  li: a(href='#') link 2
```

You can nest as many wrapper tags on a single line as you want, as long as they are all separated by a colon immediately following the tag. However If the tag has content, it cannot be nested with a colon. For example:

```
.wrap: .wrap2: .wrap3 hello! // this works fine
.wrap hello!: .wrap2         // this doesn't work
```

#### Shorthands

There is a shorthand for adding classes and IDs to your tags, which is exactly the same as it is in just about every other whitespace-significant html parser, and the same as CSS. For example:

```html
p#main => <p id="main"></p>
p.main => <p class="main"></p>
p#uid.app.active => <p id="uid" class="app active"></p>
```

You can chain as many classes and IDs in this manner as you want. If you do not use an element name, it will assume you want a div. For example:

```html
#main => <div id="main"></div>
```

#### Attributes

Attributes fall between parentheses directly after a tag's name. They are space-separated and can be either boolean (key, no value), or key/value pairs. For example:

```html
input(checked) => <input checked>
input(type='text') => <input type="text">
input(type='checkbox' checked) => <input type="checkbox" checked>
```

You can quote your attribute values or not, your choice (although we would recommend quoting). However, if the value contains a space, it must be quoted. For example:

```html
div(class=foo) => <div class="foo"></div>
div(class=foo bar) => <div class="foo" bar></div>
div(class='foo bar') => <div class="foo bar"></div>
```

Attributes can contain any character other than `=` or a space. If you value is quoted, it can contain any value other than a quote (that will end the attribute), and if it's not quoted, it can contain any value other than a quote or space. So even attributes with special characters (found sometimes in certain front-end frameworks like vue and angular) work fine. For example:

```html
div(:bind='focus') >>> <div :bind="click"></div>
div(*ngFor='foo in bar') >>> <div *ngFor="foo in bar"></div>
div(@click='handleClick') >>> <div @click="handleClick"></div>
```

#### Content

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

#### Comments

You can use buffered `//` and unbuffered `//-` comments. Only buffered comments would be compiled into the html output.

```
// just some text
p Paragraph after buffered comment

//- will not output within markup
p Paragraph after unbuffered comment
```

This would render as:

```html
<!-- just some text -->
<p>Paragraph after buffered comment</p>
<p>Paragraph after unbuffered comment</p>
```

<h2 align="center">Example</h2>

```
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

```js
import { readFileSync } from 'fs'

import posthtml from 'posthtml'
import sugarml from 'posthtml-sugarml'

const html = readFileSync('./index.sml', 'utf8')

posthtml()
  .process(html, { parser: sugarml() })
  .then((result) => console.log(result.html))
```

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Testing</title>
  </head>
  <body id="index">
    <h1>Hello world!</h1>
    <p class="intro">Wow what a great little language! Some features:</p>
    <ul data-list="yep" @sortable>
      <li><a href="#">whitespace significant!</a></li>
      <li><a href="#">simple classes and ids!</a></li>
    </ul>
    <footer>
      Thanks for visiting
      <span>see you next time!</span>
    </footer>
  </body>
</html>
```

<h2 align="center">Maintainer</h2>

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150 height="150"
        src="https://avatars.githubusercontent.com/u/556932?s=125">
      <br />
      <a href="https://github.com/jescalan">Jeff Escalante</a>
    </td>
  </tr>
  <tbody>
</table>

<h2 align="center">Contributors</h2>

<table>
  <tbody>
   <tr>
    <td align="center">
      <img width="150 height="150" src="https://avatars.githubusercontent.com/u/1510217?v=3&s=150">
      <br />
      <a href="https://github.com/voischev">Ivan Voischev</a>
    </td>
    <td align="center">
      <img width="150" height="150"
        src="https://avatars.githubusercontent.com/u/5419992?v=3&s=150">
      <br />
      <a href="https://github.com/michael-ciniawsky">Michael Ciniawsky</a>
    </td>
  </tr>
  <tbody>
</table>

[npm]: https://img.shields.io/npm/v/posthtml-sugarml.svg
[npm-url]: https://npmjs.com/package/posthtml-sugarml

[node]: https://img.shields.io/node/v/posthtml-sugarml.svg
[node-url]: https://nodejs.org/

[deps]: http://img.shields.io/david/posthtml/sugarml.svg
[deps-url]: https://david-dm.org/posthtml/sugarml

[style]: https://img.shields.io/badge/code%20style-standard-yellow.svg
[style-url]: http://standardjs.com/

[tests]: http://img.shields.io/travis/posthtml/sugarml/master.svg
[tests-url]: https://travis-ci.org/posthtml/sugarml

[cover]: http://img.shields.io/coveralls/posthtml/sugarml.svg
[cover-url]: https://coveralls.io/github/posthtml/sugarml

[chat]: https://badges.gitter.im/posthtml/posthtml.svg
[chat-url]: https://gitter.im/posthtml/posthtml?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge"
