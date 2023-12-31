const tune = `
# "Melting submarine"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples: github:tidalcycles/Dirt-Samples/master/

- stack:

  # drums
  - s: _bd:5,[~ <sd:1!3 sd:1(3,4,3)>],hh27(3,4,1)
  - .speed: # random sample speed variation
    - Perlin:
    - .range: [ .7, .9 ]
  # - .hush:

  # bassline
  - _<a1 b1*2 a1(3,8) e2>
  - .off: # random octave jumps
    - =1/8
    - set:
    - .add: 12
    - .degradeBy: .5
  - .add: # random pitch variation
    - Perlin:
    - .range: [ 0, .5 ]
  - .superimpose: # add second, slightly detuned voice
    - add: .05
  - .note: # wrap in "note"
  - .decay: .15
  - .sustain: 0 # make each note of equal length
  - .s: sawtooth # waveform
  - .gain: .4 # turn down
  - .cutoff: # automate cutoff
    - Sine:
    - .slow: 7
    - .range: [ 300, 5000 ]
  # - .hush:

  # chords
  - _<Am7!3 <Em7 E7b13 Em7 Ebm7b5>>
  - .voicings: lefthand
  - .superimpose: # add second, slightly detuned voice
    - set:
    - .add: .04
  - .add: # random pitch variation
    - Perlin:
    - .range: [ 0, .5 ]
  - .note: # wrap in "note"
  - .s: sawtooth # waveform
  - .gain: .16 # turn down
  - .cutoff: 500 # fixed cutoff
  - .attack: 1 # slowly fade in
  # - .hush:

  - _a4 c5 <e6 a6>
  - .struct: _x(5,8,-1)
  - .superimpose: # add second, slightly detuned voice
    - set:
    - .add: .04
  - .add: # random pitch variation
    - Perlin:
    - .range: [ 0, .5 ]
  - .note: # wrap in "note"
  - .decay: .1
  - .sustain: 0 # make notes short
  - .s: triangle # waveform
  - .degradeBy: # randomly controlled random removal :)
    - Perlin:
    - .range: [ 0, .5 ]
  - .echoWith: # echo notes
    - 4
    - .125
    - set: n
    - .gain: =.15*1/(n+1)
  # - .hush:

- .slow: =3/2
`;

export default tune;
