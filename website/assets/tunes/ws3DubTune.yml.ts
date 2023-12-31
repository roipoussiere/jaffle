const tune = `
# "Strudel workshop, first effects: little dub tune"
# @by Felix Roos
- stack:
  - note: _~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]
  - .sound: gm_electric_guitar_muted
  - .delay: .5

  - sound: _<bd rim>
  - .bank: RolandTR707
  - .delay: .5

  - n: _<4 [3@3 4] [<2 0> ~@16] ~>/2
  - .scale: D4:minor
  - .sound: _gm_accordion:2
  - .room: 2
  - .gain: .4

  - n: _<0 [~ 0] 4 [3 2] [0 ~] [0 ~] <0 2> ~>*2
  - .scale: D2:minor
  - .sound: _sawtooth,triangle
  - .lpf: 800
`;

export default tune;
