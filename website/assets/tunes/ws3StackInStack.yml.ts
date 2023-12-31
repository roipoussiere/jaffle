const tune = `
# "Strudel workshop, first effects: stacks within stacks"
# @by Felix Roos
- stack:
  - stack:
    - sound: _hh*8
    - .gain: _[.25 1]*2
    - sound: _bd*2,~ sd:1

  - note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
  - .sound: sawtooth
  - .lpf: _200 1000

  - note: _<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>/2
  - .sound: sawtooth
  - .vowel: _<a e i o>/2
`;

export default tune;
