# Jaffle

**J**ust **a**nother **f**lat **f**ile **l**ivecoding **e**nvironment.

<img style="display: block; margin: auto;" src="./website/static/images/jaffle_logo_128.png"/>

Check out the [demo website](https://roipoussiere.frama.io)!

## Introduction

Jaffle is a yaml-based syntax for [Tidal-cycles](https://tidalcycles.org/), based on [Strudel](https://strudel.tidalcycles.org).

It aims to make algorithmic music more accessible for people who are not familiar with programming languages.

![](images/editor.png)

Under the hood, Jaffle is a transpiler generating JavaScript code, which is then interpreted by Strudel.

## Features

- easy to read syntax (albeit more verbose than Strudel);
- use lambda functions, expressions, variable definitions, [and more](https://roipoussiere.frama.io/jaffle/syntax/);
- all Strudel examples has been successfully converted to Jaffle;
- extensive [unit tests](tests/transpiler.test.ts)

## Roadmap

I plan to create a visual interface for Jaffle.

The whole point of this project is not actually to define a tune in Yaml, it's to define a tune in structured data. Since this part is now done, I would like to work on an alternative Yaml editor with a visual interface, in order to make this process even more user-friendly. This one could be made of boxes linked with wires (such as in [jsonvis](https://zuramai.github.io/jsonvis/) but more compact).

Additional planned features:

- better syntax highlighting;
- code completion;
- own documentation.

## Syntax

Go to the [syntax section](https://roipoussiere.frama.io/jaffle/syntax) in the Jaffle website (or alternatively read [its source](./website/content/syntax.md) if necessary).

## Contributing

See the [contribution guide](./CONTRIBUTING.md)!

## Authorship

### Jaffle transpiler and demo website

- credits: Nathanaël Jourdane and contributors
- license: [AGPL-3.0](./LICENSE)
- source: https://framagit.org/roipoussiere/jaffle

### Strudel engine

- credits: Strudel contributors
- license: [AGPL-3.0](https://www.gnu.org/licenses/agpl-3.0.txt)
- source: https://github.com/tidalcycles/strudel

### Pre-loaded sounds

- piano:
  - credits: Alexander Holm
  - license: [CC-by](http://creativecommons.org/licenses/by/3.0)
  - source: https://archive.org/details/SalamanderGrandPianoV3
- VCSL:
  - credits: Versilian Studios LLC
  - license: [CC0](https://creativecommons.org/publicdomain/zero/1.0/)
  - source: https://github.com/sgossner/VCSL
- Tidal drum machines:
  - source: https://github.com/ritchse/tidal-drum-machines
- EmuSP12:
  - source: https://github.com/tidalcycles/Dirt-Samples
