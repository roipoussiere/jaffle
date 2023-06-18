# Tidaml

A protoype for a yaml-based syntax for [Tidal-cycles](https://tidalcycles.org/), based on [https://strudel.tidalcycles.org](Strudel).

Tidaml is used to write tunes in yaml instead of a programming language like JavaScript or Haskel.

## Syntax

### Attributes

Strudel's functions chaining like this:

```js
n("1 2 3")
  .scale("C:minor")
```

are replaced by object attributes in the same level:

```yml
N: 1 2 3
scale: C:minor
```

Because disctionnaries are not ordered, the first instruction is capitalized (here `N` instead `n`). Then follows chained functions.

Most of the time, quotes are optional in yaml (although many yaml syntax highlighters sucks are render them correctly).

### Passing arrays

Some functions takes several parameters:

```js
stack(
  n("1 2")
    .scale("C:minor"),
  note("c a f e"))
```

Those are passed as yaml arrays:

```yml
Stack:
- N: 1 2
  scale: C:minor
- Note: c a f e
```

### Mini-notation

Functions can enventually be applied directly to mini-notation:

```js
"c3 [eb3,g3]".note()
```

The `M` parameter is used in this case:

```yml
M: c3 [eb3,g3]
note:
```

### Functions without parameters

Some function doesn't take any parameter:

```js
note('c a f e').log()
```

It's not a problem to have a key without value in yaml:

```yml
Note: c a f e
log:
```

### Loading samples

You may want to load samples:

```js
await samples({
  bd: ['bd/BT0AADA.wav','bd/BT0AAD0.wav'],
  sd: ['sd/rytm-01-classic.wav','sd/rytm-00-hard.wav'],
  hh: ['hh27/000_hh27closedhh.wav','hh/000_hh3closedhh.wav'],
}, 'github:tidalcycles/Dirt-Samples/master/');
s("<bd:0 bd:1>,~ <sd:0 sd:1>,[hh:0 hh:1]*2")
```

You must use the `^` identifier in this case:

```yml
^samples:
- bd: [ bd/BT0AADA.wav, bd/BT0AAD0.wav ]
  sd: [ sd/rytm-01-classic.wav, sd/rytm-00-hard.wav ]
  hh: [ hh27/000_hh27closedhh.wav, hh/000_hh3closedhh.wav ]
- github:tidalcycles/Dirt-Samples/master/
S: <bd:0 bd:1>,~ <sd:0 sd:1>,[hh:0 hh:1]*2
```

### Signals

What about signals?

```js
saw.range(50, 80).segment(24).note()
```

They are writen like they was functions:

```yml
Saw:
range: [50, 80]
segment: 24
note:
```

Note the clever use of the inline array in the `range` function to avoid line returns.

### Lamda functions

Some functions takes a function as parameter:

```js
note("c3 eb3 g3 a3").sometimes(x=>x.gain(8))
```

The `Set` attribute must be used in this case:

```yml
Note: c3 eb3 g3 a3
sometimes:
  Set:
  gain: 8
```

## Testing

```
cd tidaml
npm install
npm run dev
```

## Things to fix

### Applying a function to a mini-notation

```js
stack(
  n("<0 [2 4] <3 5> [~ <4 1>]>*2".add("<0 [0,2,4]>/4"))
  .scale("C5:minor")
)
```

Not same as:

```js
stack(
  n("<0 [2 4] <3 5> [~ <4 1>]>*2")
  .add("<0 [0,2,4]>/4")
  .scale("C5:minor")
)
```

### Passing a function in attribute

```js
n("0 1 [2 3] 2")
  .scale("C5:minor")
  .jux(rev)
```
