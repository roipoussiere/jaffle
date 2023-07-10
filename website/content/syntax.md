---
title: "Syntax"
---

# Jaffle Syntax

This chapter aims to provide an overview of the Jaffle syntax, for people already familiar with Strudel.

If necessary, read the [Strudel documentation](https://strudel.tidalcycles.org/learn).

Also, if you have some suggestions about this syntax or simply want to talk about it, see the [contribution guide](https://github.com/roipoussiere/jaffle/blob/main/CONTRIBUTING.md). ;)

## Yaml basics

Jaffle uses the Yaml syntax. Here is the basic usage:

```yml
# I'm a comment
- array:
  - 1
  - 2
- dictionary:
    a: 1
    b: 2
- array of dictionaries:
  - a1: 1
    b1: 2
  - a2: 3
    b2: 4
- inline array: [ 1, 2, 3 ]
- inline dict: { a: 1, b: 2 }
- inline array of dictionaries: [ a: 1, b: 2 ]
- literals:
  - string: hello
  - quoted string: '[ 1, 2, 3 ]'
  - number: 42
  - float: 2.21
  - null value:
```

## Mini-notation

Mini-notation strings are prefixed with `_`:

{{< code "h" >}}
```js
note("c@3 eb")
```
{{< code "m" >}}
```yml
- note: _c@3 eb
```
{{< code "f" >}}

## Chained functions

Chained functions are array items following the first function, prefixed with `.`:

{{< code "h" >}}
```js
note("c@3 eb")
  .lpf(600)
  .delay(.5)
  .gain(2)
```
{{< code "m" >}}
```yml
- note: _c@3 eb
- .lpf: 600
- .delay: .5
- .gain: 2
```
{{< code "f" >}}

You can consider that this prefix visually acts as a small indentation character. ;)

## Function parameters

Function parameters are defined in an array:

{{< code "h" >}}
```js
stack(
    note("c@3 eb"),
    sound("bd hh sd oh"))
```
{{< code "m" >}}
```yml
- stack:
  - note: _c@3 eb
  - sound: _bd hh sd oh
```
{{< code "f" >}}

Note that the yaml root element must also be an array (hence the first `-`).

### Functions without parameters

It is safe to have a yaml attribute without value (just don't forget the `:` sign):

{{< code "h" >}}
```js
note("c@3 eb")
  .piano()
  .log()
```
{{< code "m" >}}
```yml
- note: c@3 eb
- .piano:
- .log:
```
{{< code "f" >}}

## List of chained functions

When functions chains follow each other, they are still on the same level:

{{< code "h" >}}
```js
stack(
    note("c@3 eb")
      .lpf(600)
      .delay(.5),

    sound("bd hh sd oh")
      .gain(0.5)
      .slow(2))
```
{{< code "m" >}}
```yml
- stack:
  - note: _c@3 eb
  - .lpf: 600
  - .delay: .5

  - sound: _bd hh sd oh
  - .gain: 0.5
  - .slow: 2
```
{{< code "f" >}}

In this case it is suggested to split function chains with a blank line.

## Data serialization

To pass structured data in a parameter, you must add `^` after the attribute name:

{{< code "h" >}}
```js
samples({
  bd: [
    'bd/BT0AADA.wav',
    'bd/BT0AAD0.wav'],
  sd: [
    'sd/rytm-01-classic.wav',
    'sd/rytm-00-hard.wav'],
  hh: [
    'hh27/000_hh27closedhh.wav',
    'hh/000_hh3closedhh.wav'],
}, 'github:tidalcycles/Dirt-Samples/master/');
s("<bd:0 bd:1>,~ <sd:0 sd:1>,[hh:0 hh:1]*2")
```
{{< code "m" >}}
```yml
- samples^:
  - bd:
    - bd/BT0AADA.wav
    - bd/BT0AAD0.wav
    sd:
    - sd/rytm-01-classic.wav
    - sd/rytm-00-hard.wav
    hh:
    - hh27/000_hh27closedhh.wav
    - hh/000_hh3closedhh.wav
  - github:tidalcycles/Dirt-Samples/master/
- s: _<bd:0 bd:1>,~ <sd:0 sd:1>,[hh:0 hh:1]*2
```
{{< code "f" >}}

To serialize data on a specific argument, add its index next to `^`, starting from 1 (ie. `foo^1:`).

## Signals

Keywords without parenthesis like signals are written with a capital on the first letter:

{{< code "h" >}}
```js
saw
  .range(50, 80)
  .segment(24)
  .note()
```
{{< code "m" >}}
```yml
- Saw:
- .range: [ 50, 80 ]
- .segment: 24
- .note:
```
{{< code "f" >}}

## Expressions

To put an expression in a parameter, prepend it by the `=` sign:

{{< code "h" >}}
```js
"c3 [eb3,g3]"
  .add(1/3)
  .note()
```
{{< code "m" >}}
```yml
- _c3 [eb3,g3]
- .add: =1/3
- .note:
```
{{< code "f" >}}

Such expressions are limited to simple mathematics (`+`, `-`, `*`, `/`, `**`).

## Functions in parameters

To pass a function in a parameter such as in accumulation modifiers, use `set` (here with an inline dictionnary):

{{< code "h" >}}
```js
note("c3 eb3 g3 a3")
  .sometimes(x=>x.gain(8))
```
{{< code "m" >}}
```yml
- note: _c3 eb3 g3 a3
- .sometimes: [ set: , .gain: 8 ]
```
{{< code "f" >}}

If necessary, additional parameters can be passed in the `set` value:

{{< code "h" >}}
```js
"<0 [2 4]>"
  .echoWith(4, 1/8, (p,n) => p.add(n*2))
  .scale('C minor')
  .note()
```
{{< code "m" >}}
```yml
- _<0 [2 4]>
- .echoWith: [ 4, =1/8, set: n, .add: =n*2 ]
- .scale: C minor
- .note:
```
{{< code "f" >}}

More parameters could be added using an array (ie. `set: [ n, m ]`).

## Using variables

Variables can be defined using the `$` prefix and accessed in expressions (`=`):

{{< code "h" >}}
```js
const melody =
  note("c@3 eb")
    .lpf(600)
    .delay(.5)
const drums =
  sound("bd hh sd oh")
    .gain(0.5)
stack(
    melody,
    drums
      .slow(2))
```
{{< code "m" >}}
```yml
- $melody:
  - note: _c@3 eb
  - .lpf: 600
  - .delay: .5
- $drums:
  - sound: _bd hh sd oh
  - .gain: 0.5
- stack:
  - =melody
  - =drums
  - .slow: 2
```
{{< code "f" >}}
