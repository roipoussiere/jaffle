const tune = `
# "Hyperpop"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- $lfo:
  - Cosine:
  - .slow: 15
- $lfo2:
  - Sine:
  - .slow: 16
- $filter1:
  - set:
  - .cutoff:
    - =lfo2
    - .range: [ 300, 3000 ]
- $filter2:
  - set:
  - .hcutoff:
    - =lfo
    - .range: [1000, 6000 ]
  - .cutoff: 4000

- $scales:
  - cat: [ D3 major, G3 major ]
  - .slow: 8

- samples^:
  - bd: 344/344757_1676145-lq.mp3
    sn: 387/387186_7255534-lq.mp3
    hh: 561/561241_12517458-lq.mp3
    hh2: 44/44944_236326-lq.mp3
    hh3: 44/44944_236326-lq.mp3
  - https://freesound.org/data/previews/

- stack:
  - _-7 0 -7 7
  - .struct: _x(5,8,1)
  - .fast: 2
  - .sub: 7
  - .scale: =scales
  - .note:
  - .s: _sawtooth,square
  - .gain: .3
  - .attack: 0.01
  - .decay: 0.1
  - .sustain: .5
  - .apply: =filter1

  - _~@3 [<2 3>,<4 5>]
  - .echo: [ 4, =1/16, .7 ]
  - .scale: =scales
  - .note:
  - .s: square
  - .gain: .7
  - .attack: 0.01
  - .decay: 0.1
  - .sustain: 0
  - .apply: =filter1

  - _6 4 2
  - .add: 14
  - .superimpose:
    - sub: 5
  - .fast: 1
  - .euclidLegato: [ 3, 8 ]
  - .mask: _<1 0@7>
  - .fast: 2
  - .echo: [ 32, =1/8, .8 ]
  - .scale: =scales
  - .note:
  - .s: sawtooth
  - .gain:
    - Sine:
    - .range: [ .1, .4 ]
    - .slow: 8
  - .attack: .001
  - .decay: .2
  - .sustain: 0
  - .apply: =filter2

- .stack:
  - stack:
    - _bd <~@7 [~ bd]>
    - .fast: 2
    - _~ sn
    - _[~ hh3]*2
  - .s:
  - .fast: 2
  - .gain: .7

- .slow: 2
`;

export default tune;
