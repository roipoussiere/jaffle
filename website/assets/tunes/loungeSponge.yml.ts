const tune = `
# "Lounge sponge"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos, livecode.orc by Steven Yi

- loadOrc: github:kunstmusik/csound-live-code/master/livecode.orc

- stack:
  - note:
    - _<C^7 A7 Dm7 Fm7>/2
    - .voicings: lefthand
  - .cutoff:
    - Sine:
    - .range: [ 500, 2000 ]
    - .round:
    - .slow: 16
  - .euclidLegato: [ 3, 8 ]
  - .csound: FM1

  - note: _<C2 A1 D2 F2>/2
  - .ply: 8
  - .csound: Bass
  - .gain: _1 4 1 4

  - note:
    - _0 7 [4 3] 2
    - .fast: =2/3
    - .off:
      - _.25 .125
      - add: _<2 4 -3 -1>
    - .slow: 2
    - .scale: A4 minor
  - .legato: .25
  - .csound: SynHarp

  - s: _bd*2,[~ hh]*2,~ cp
  - .bank: RolandTR909
`;

export default tune;
