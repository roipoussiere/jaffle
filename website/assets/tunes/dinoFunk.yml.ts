const tune = `
# "Dinofunk"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
    bass: https://cdn.freesound.org/previews/614/614637_2434927-hq.mp3
    dino:
      b4: https://cdn.freesound.org/previews/316/316403_5123851-hq.mp3

- setVoicingRange:
  - lefthand
  - [ 'c3', 'a4' ]

- stack:
  - s: bass
  - .loopAt: 8
  - .clip: 1

  - s: _bd*2, ~ sd,hh*4

  - note:
    - _Abm7
    - .voicings: lefthand
    - .struct:
      - _x(3,8,1)
      - .slow: 2

  - _0 1 2 3
  - .scale: ab4 minor pentatonic
  - .superimpose:
    - set:
    - .add: .1
  - .sometimes:
    - set:
    - .add: 12
  - .note:
  - .s: sawtooth
  - .cutoff:
    - Sine:
    - .range: [ 400, 2000 ]
    - .slow: 16
  - .gain: .8
  - .decay:
    - Perlin:
    - .range: [ .05, .2 ]
  - .sustain: 0
  - .delay:
    - Sine:
    - .range: [ 0, .5 ]
    - .slow: 32
  - .degradeBy: .4
  - .room: 1

  - note: _<b4 eb4>
  - .s: dino
  - .delay: .8
  - .slow: 8
  - .room: .5
`;

export default tune;
