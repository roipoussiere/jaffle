const tune = `
# "Flatrave"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- stack:
  - s: _bd*2,~ [cp,sd]
  - .bank: RolandTR909
  
  - s: _hh:1*4
  - .sometimes:
    - fast: 2
  - .rarely:
    - set:
    - .speed: .5
    - .delay: .5
  - .end:
    - Perlin:
    - .range: [ 0.02, .05 ]
    - .slow: 8
  - .bank: RolandTR909
  - .room: .5
  - .gain: _0.4,0.4(5,8,-1)
  
  - note:
    - _<0 2 5 3>
    - .scale: G1 minor
  - .struct: _x(5,8,-1)
  - .s: sawtooth
  - .decay: .1
  - .sustain: 0
  
  - note: _<G4 A4 Bb4 A4>,Bb3,D3
  - .struct: _~ x*2
  - .s: square
  - .clip: 1
  - .cutoff:
    - Sine:
    - .range: [ 500, 4000 ]
    - .slow: 16
  - .resonance: 10
  - .decay:
    - Sine:
    - .slow: 15
    - .range: [ .05, .2 ]
  - .sustain: 0
  - .room: .5
  - .gain: .3
  - .delay: .2
  - .mask: _<0 1@3>/8
  
  - _0 5 3 2
  - .sometimes:
    - slow: 2
  - .off:
    - =1/8
    - add: 5
  - .scale: G4 minor
  - .note:
  - .decay: .05
  - .sustain: 0
  - .delay: .2
  - .degradeBy: .5
  - .mask: _<0 1>/16
`;

export default tune;
