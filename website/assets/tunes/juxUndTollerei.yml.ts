const tune = `
# "Jux und tollerei"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- note: _c3 eb3 g3 bb3
- .palindrome:
- .s: sawtooth
- .jux:
  - set:
  - .rev:
  - .color: green
  - .s: sawtooth
- .off:
  - =1/4
  - set:
  - .add:
    - note: _<7 12>/2
  - .slow: 2
  - .late: .005
  - .s: triangle

# - .delay: .5
- .fast: 1
- .cutoff:
  - Sine:
  - .range: [ 200, 2000 ]
  - .slow: 8
- .decay: .05
- .sustain: 0
- .room: .6
- .delay: .5
- .delaytime: .1
- .delayfeedback: .4
- .pianoroll:
`;

export default tune;
