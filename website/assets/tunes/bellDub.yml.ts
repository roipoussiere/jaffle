const tune = `
# "Belldub"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
    bell:
      b4: https://cdn.freesound.org/previews/339/339809_5121236-lq.mp3

# "Hand Bells, B, Single.wav" by InspectorJ (www.jshaw.co.uk) of Freesound.org
- stack:

  # bass
  - note:
    - _[0 ~] [2 [0 2]] [4 4*2] [[4 ~] [2 ~] 0@2]
    - .scale: g1 dorian
    - .superimpose:
      - set:
      - .add: .02
  - .s: sawtooth
  - .cutoff: 200
  - .resonance: 20
  - .gain: .15
  - .shape: .6
  - .release: .05

  # perc
  - s: _[~ hh]*4
  - .room:
    - _0 0.5
    - fast: 2
  - .end:
    - Perlin:
    - .range: [ 0.02, 1 ]

  - s: _mt lt ht
  - .struct: _x(3,8)
  - .fast: 2
  - .gain: .5
  - .room: .5
  - .sometimes:
    - set: 
    - .speed: .5

  - s: _misc:2
  - .speed: 1
  - .delay: .5
  - .delaytime: =1/3
  - .gain: .4

  # chords
  - note:
    - _[~ Gm7] ~ [~ Dm7] ~
    - .voicings: lefthand
    - .superimpose:
      - set:
      - .add: .1
  - .s: sawtooth
  - .gain: .5
  - .cutoff:
    - Perlin:
    - .range: [ 400, 3000 ]
    - .slow: 8
  - .decay:
    - Perlin:
    - .range: [ 0.05, .2 ]
  - .sustain: 0
  - .delay: .9
  - .room: 1

  # blips
  - note:
    - _0 5 4 2
    - .iter: 4
    - .off:
      - =1/3
      - add: 7
    - scale: g4 dorian
  - .s: square
  - .cutoff: 2000
  - .decay: .03
  - .sustain: 0
  - .degradeBy: .2
  - .orbit: 2
  - .delay: .2
  - .delaytime: _.33 | .6 | .166 | .25
  - .room: 1
  - .gain: .5
  - .mask: _<0 1>/8

  # bell
  - note:
    - Rand:
    - .range: [ 0, 12 ]
    - .struct: _x(5,8,-1)
    - .scale: g2 minor pentatonic
  - .s: bell
  - .begin: .05
  - .delay: .2
  - .degradeBy: .4
  - .gain: .4
  - .mask: _<1 0>/8

- .slow: 5
`;

export default tune;
