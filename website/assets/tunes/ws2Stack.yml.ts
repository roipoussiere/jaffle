const tune = `
# "Strudel workshop, first notes: stack example"
# @by Felix Roos
- stack:
  - note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
  - .sound: gm_synth_bass_1
  - .lpf: 800

  - n: >
      _< [~ 0] 2 [0 2] [~ 2]
         [~ 0] 1 [0 1] [~ 1]
         [~ 0] 3 [0 3] [~ 3]
         [~ 0] 2 [0 2] [~ 2] >*2
  - .scale: C4:minor
  - .sound: gm_synth_strings_1

  - sound: _bd*2, ~ <sd cp>, [~ hh]*2
  - .bank: RolandTR909
`;

export default tune;
