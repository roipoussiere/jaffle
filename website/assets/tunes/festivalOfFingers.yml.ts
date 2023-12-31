const tune = `
# "Festival of fingers"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- $chords: _<Cm7 Fm7 G7 F#7>

- stack:
  - =chords
  - .voicings: lefthand
  - .struct: _x(3,8,-1)
  - .velocity: .5
  - .off:
    - =1/7
    - set:
    - .transpose: 12
    - .velocity: .2

  - =chords
  - .rootNotes: 2
  - .struct: _x(4,8,-2)

  - =chords
  - .rootNotes: 4
  - .scale:
    - cat: [ C minor, F dorian, G dorian, F# mixolydian ]
  - .struct:
    - _x(3,8,-2)
    - .fast: 2
  - .scaleTranspose:
    - _0 4 0 6
    - .early: _.125 .5
  - .layer:
    - scaleTranspose: _0,<2 [4,6] [5,7]>/4

- .slow: 2
- .velocity:
  - Sine:
  - .struct: _x*8
  - .add: =3/5
  - .mul: =2/5
  - .fast: 8

- .note:
- .piano:
`;

export default tune;
