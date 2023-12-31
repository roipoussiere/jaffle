const tune = `
# "Bridge is over"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos, bassline by BDP - The Bridge Is Over

- samples^:
    mad: https://freesound.org/data/previews/22/22274_109943-lq.mp3

- stack:
  - stack:
    - note: _c3*2 [[c3@1.4 bb2] ab2] gb2*2 <[[gb2@1.4 ab2] bb2] gb2>
    - .gain: .8
    - .clip: _[.5 1]*2

    - n: _<0 1 2 3 4 3 2 1>
    - .clip: .5
    - .echoWith:
      - 8
      - =1/32
      - set: i
      - .add:
        - n: =i
      - .velocity: =.7**i
    - .scale: c4 whole tone
    - .echo: [ 3, =1/8, .5 ]
    - .piano:

  - s: mad
  - .slow: 2

- .cpm: 78
- .slow: 4
- .pianoroll:
`;

export default tune;
