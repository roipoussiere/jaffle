const tune = `
# "Random bells"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
    bell:
      c6: https://freesound.org/data/previews/411/411089_5121236-lq.mp3
    bass:
      d2: https://freesound.org/data/previews/608/608286_13074022-lq.mp3

- stack:

  # bells
  - _0
  - .euclidLegato: [ 3, 8 ]
  - .echo: [3, =1/16, .5 ]
  - .add:
    - Rand:
    - .range: [ 0, 12 ]
  - .scale: _D:minor:pentatonic
  - .note:
  - .velocity:
    - Rand:
    - .range: [ .5, 1 ]
  - .s: bell
  - .gain: .6
  - .delay: .2
  - .delaytime: =1/3
  - .delayfeedback: .8

  # bass
  - note: _<D2 A2 G2 F2>
  - .euclidLegatoRot: [ 6, 8, 4 ]
  - .s: bass
  - .clip: 1
  - .gain: .8

- .slow: 6
- .pianoroll^:
    vertical: 1
`;

export default tune;
