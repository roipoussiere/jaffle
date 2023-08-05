const tune = `
# "Underground plumber"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos
# @details inspired by Friendship - Let's not talk about it (1979) :)

- samples^:
  - bd: bd/BT0A0D0.wav
    sn: sn/ST0T0S3.wav
    hh: hh/000_hh3closedhh.wav
    cp: cp/HANDCLP0.wav
  - https://loophole-letters.vercel.app/samples/tidal/

- $h:
  - set:
  - .transpose: _<0@2 5 0 7 5 0 -5>/2

- stack:
  - s: _<<bd*2 bd> sn> hh
  - .fast: 2
  - .gain: .7

  - _[c2 a1 bb1 ~] ~
  - .echo: [ 2, =1/16, 1 ]
  - .slow: 2
  - .layer: =h
  - .note:
  - .s: square
  - .clip: .4
  - .cutoff: 400
  - .decay: .12
  - .sustain: 0

  - _[g2,[c3 eb3]]
  - .iter: 4
  - .echoWith:
    - 4
    - =1/8
    - set: n
    - .transpose: =n*12
    - .velocity: =.4**n
  - .layer: =h
  - .note:
  - .clip: .1

- .fast: =2/3
- .pianoroll:
`;

export default tune;
