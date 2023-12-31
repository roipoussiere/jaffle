const tune = `
# "Good times"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- $scale:
  - cat:
    - C3 dorian
    - Bb2 major
  - .slow: 4

- stack:
  - n:
    - _2*4
    - .add: 12
  - .off: [ =1/8, add: 2 ]
  - .scale: =scale
  - .fast: 2
  - .add: _<0 1 2 1>
  - .hush:
  
  - _<0 1 2 3>(3,8,2)
  - .off: [ =1/4, add: '_2,4' ]
  - .n:
  - .scale: =scale

  - _<0 4>(5,8,-1)
  - .scale: =scale
  - .sub:
    - note: 12

- .velocity:
  - _.6 .7
  - .fast: 4
- .add:
  - note: 4
- .piano:
- .clip: 2
- .velocity: .8
- .slow: 2
- .pianoroll:
`;

export default tune;
