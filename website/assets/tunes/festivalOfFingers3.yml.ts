const tune = `
# "Festival of fingers 3"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- _[-7*3],0,2,6,[8 7]
- .echoWith:
  - 4
  - =1/4
  - set: n
  - .add: =n*7
  - .velocity: =1/(n+1)
  - .legato: =1/(n+1)
- .velocity:
  - Perlin:
  - .range: [ .5, .9 ]
  - .slow: 8
- .stack:
  - _[22 25]*3
  - .legato:
    - Sine:
    - .range: [ .5, 2 ]
    - .slow: 8
  - .velocity:
    - Sine:
    - .range: [ .4, .8 ]
    - .slow: 5
  - .echo: [ 4, =1/12, .5 ]
- .scale:
  - cat:
    - D dorian
    - G mixolydian
    - C dorian
    - F mixolydian
- .legato: 1
- .slow: 2
- .note:
- .piano:
# - .pianoroll:
#     maxMidi: 160
`;

export default tune;
