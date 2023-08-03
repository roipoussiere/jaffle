const tune = `
# "Chop"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
    p: https://cdn.freesound.org/previews/648/648433_11943129-lq.mp3

- s: p
- .loopAt: 32
- .chop: 128
- .jux:
  - Rev:
- .shape: .4
- .decay: .1
- .sustain: .6
`;

export default tune;
