const tune = `
# "Wavy kalimba"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^: 
    kalimba:
      c5: https://freesound.org/data/previews/536/536549_11935698-lq.mp3

- $scales:
  - cat:
    - C major
    - C mixolydian
    - F lydian
    - [ F minor, Db major ]

- stack:
  - _[0 2 4 6 9 2 0 -2]*3
  - .add: _<0 2>/4
  - .scale: =scales
  - .struct: _x*8
  - .velocity: _<.8 .3 .6>*8
  - .slow: 2

  - _<c2 c2 f2 [[F2 C2] db2]>
  - .scale: =scales
  - .scaleTranspose: _[0 <2 4>]*2
  - .struct: _x*4
  - .velocity: _<.8 .5>*4
  - .velocity: 0.8
  - .slow: 2

- .legato: _<.4 .8 1 1.2 1.4 1.6 1.8 2>/8
- .fast: 1
- .note:
- .clip: 1
- .s: kalimba
- .delay: .2
`;

export default tune;
