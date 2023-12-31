const tune = `
# "Waa2"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- n:
  - _a4 [a3 c3] a3 c3
  - .sub:
    - _<7 12 5 12>
    - .slow: 2
  - .off:
    - =1/4
    - set:
    - .add: 7
  - .off:
    - =1/8
    - set:
    - .add: 12

- .slow: 2
- .clip:
  - Sine:
  - .range: [ 0.3, 2 ]
  - .slow: 28
- .s:
  - _sawtooth square
  - .fast: 2
- .cutoff:
  - Cosine:
  - .range: [ 500, 4000 ]
  - .slow: 16
- .gain: .5
- .room: .5
`;

export default tune;
