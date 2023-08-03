const amenSister = `
# "Amensister"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples: github:tidalcycles/Dirt-Samples/master

- stack:

# amen
  - n: _0 1 2 3 4 5 6 7
  - .sometimes:
    - set:
    - .ply: 2
  - .rarely:
    - set:
    - .speed: _2 | -2
  - .sometimesBy:
    - .4
    - set:
    - .delay: .5
  - .s: amencutup
  - .slow: 2
  - .room: .5

# bass
  - Sine:
  - .add:
    - Saw:
    - .slow: 4
  - .range: [ 0, 7 ]
  - .segment: 8
  - .superimpose:
    - set:
    - .add: .1
  - .scale: G0 minor
  - .note:
  - .s: sawtooth
  - .decay: .1
  - .sustain: 0
  - .gain: .4
  - .cutoff:
    - Perlin:
    - .range: [ 300, 3000 ]
    - .slow: 8
  - .resonance: 10
  - .degradeBy: _0 0.1 .5 .1
  - .rarely:
    - add:
      - note: 12

# chord
  - note:
    - _Bb3,D4
    - .superimpose:
      - set: 
      - .add: .2
  - .s: sawtooth
  - .cutoff: 1000
  - .struct: _<~@3 [~ x]>
  - .decay: .05
  - .sustain: .0
  - .delay: .8
  - .delaytime: .125
  - .room: .8

# alien
  - s: breath
  - .room: 1
  - .shape: .6
  - .chop: 16
  - .rev:
  - .mask: _<x ~@7>

  - n: _0 1
  - .s: east
  - .delay: .5
  - .degradeBy: .8
  - .speed:
    - Rand:
    - .range: [ .5, 1.5 ]

- .reset: _<x@7 x(5,8,-1)>
`;

export default amenSister;
