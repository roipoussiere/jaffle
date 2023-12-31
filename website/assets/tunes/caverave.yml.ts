const tune = `
# "Caverave"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- $keys:
  - set:
  - .s: sawtooth
  - .cutoff: 1200
  - .gain: .5
  - .attack: 0
  - .decay: .16
  - .sustain: .3
  - .release: .1

- $drums:
  - stack:
    - s: _bd*2
    - .mask: _<x@7 ~>/8
    - .gain: .8

    - s: _~ <sd!7 [sd@3 ~]>
    - .mask: _<x@7 ~>/4
    - .gain: .5

    - s: _[~ hh]*2
    - .delay: .3
    - .delayfeedback: .5
    - .delaytime: .125
    - .gain: .4

- $thru:
  - set:
  - .transpose: _<0 1>/8
  - .transpose: -1

- $synths:
  - stack:
    - _<eb4 d4 c4 b3>/2
    - .scale:
      - timeCat: [ [ 3, C minor ], [ 1, C melodic minor ] ]
      - .slow: 8
    - .struct: _[~ x]*2
    - .layer:
      - set:
      - .scaleTranspose: 0
      - .early: 0
      - set:
      - .scaleTranspose: 2
      - .early: =1/8
      - set:
      - .scaleTranspose: 7
      - .early: =1/4
      - set:
      - .scaleTranspose: 8
      - .early: =3/8
    - .apply: =thru
    - .note:
    - .apply: =keys
    - .mask: _<~ x>/16
    - .color: darkseagreen

    - note:
      - _<C2 Bb1 Ab1 [G1 [G2 G1]]>/2
      - .apply: =thru
    - .struct:
      - _[x [~ x] <[~ [~ x]]!3 [x x]>@2]/2
      - .fast: 2
    - .s: sawtooth
    - .attack: 0.001
    - .decay: 0.2
    - .sustain: 1
    - .cutoff: 500
    - .color: brown

    - _<Cm7 Bb7 Fm7 G7b13>/2
    - .struct:
      - _~ [x@0.2 ~]
      - .fast: 2
    - .voicings: lefthand
    - .apply: =thru
    - .every: [ 2, early: =1/8 ]
    - .note:
    - .apply: =keys
    - .sustain: 0
    - .delay: .4
    - .delaytime: .12
    - .mask: _<x@7 ~>/8
    - .early: =1/4

- stack:
  - =drums
  - .fast: 2
  - .color: tomato

  - =synths

- .slow: 2
# - .pianoroll^:
#     fold: 1
`;

export default tune;
