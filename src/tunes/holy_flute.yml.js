const tune = `
# "Holy flute"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- _c3 eb3(3,8) c4/2 g3*2
- .superimpose:
  - set:
  - .slow: 2
  - .add: 12
  - set:
  - .slow: 4
  - .sub: 5
- .add: _<0 1>/16
- .note:
- .s: ocarina_vib
- .clip: 1
- .release: .1
- .room: 1
- .gain: .2
- .color: _salmon | orange | darkseagreen
- .pianoroll^:
    fold: 0
    autorange: 0
    vertical: 0
    cycles: 12
    smear: 0
    minMidi: 40
`;

export default tune;
