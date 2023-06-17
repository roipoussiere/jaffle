# Tidaml

A protoype for a yaml-based syntax for [Tidal-cycles](https://tidalcycles.org/), based on [https://strudel.tidalcycles.org](Strudel).

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
