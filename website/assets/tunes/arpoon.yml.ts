const tune = `
# "Arpoon"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples: github:tidalcycles/Dirt-Samples/master

- note:
  - _<<Am7 C^7> C7 F^7 [Fm7 E7b9]>
  - .voicings: lefthand
- .arp:
  - _[0,3] 2 [1,3] 2
  - .fast: 3
  - .lastOf:
    - 4
    - fast: 2
- .clip: 2
- .add:
  - Perlin:
  - .range: [ 0, 0.2 ]
  - .add: _<0 12>/8
  - .note:
- .cutoff:
  - Perlin:
  - .range: [ 500, 4000 ]
- .resonance: 12
- .gain: _<.5 .8>*16
- .decay: .16
- .sustain: 0.5
- .delay: .2
- .room: .5
- .pan:
  - Sine:
  - .range: [ .3, .6 ]
- .s: piano
- .stack:
  - _<<A1 C2>!2 F2 [F2 E2]>
  - .Add:
  - .out:
    - _0 -5
    - .fast: 2
  - .add: _0,.12
  - .note:
  - .s: sawtooth
  - .clip: 1
  - .cutoff: 300
- .slow: 4
- .stack:
  - s: _bd*4, [~ [hh hh? hh?]]*2,~ [sd ~ [sd:2? bd?]]
  - .bank: RolandTR909
  - .gain: .5
  - .slow: 2
`;

export default tune;
