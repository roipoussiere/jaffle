const tune = `
# "Strudel workshop, pattern effects: time to stack"
# @by Felix Roos
- stack:
  - n:
    - _<0 [2 4] <3 5> [~ <4 1>]>*2
    - .add: _<0 [0,2,4]>/4
  - .scale: C5:minor
  - .sound: gm_xylophone
  - .room: .4
  - .delay: .125

  - note:
    - _c2 [eb3,g3]
    - .add: _<0 <1 -1>>
  - .adsr: _[.1 0]:.2:[1 0]
  - .sound: gm_acoustic_bass
  - .room: .5

  - n: _0 1 [2 3] 2
  - .sound: jazz
  - .jux:
    - Rev:
  - .slow: 2
`;

export default tune;
