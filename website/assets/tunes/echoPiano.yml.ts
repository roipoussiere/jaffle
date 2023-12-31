const tune = `
# "Echo piano"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- _<0 2 [4 6](3,4,2) 3*2>
- .scale: D minor
- .color: salmon
- .off:
  - =1/4
  - set:
  - .scaleTranspose: 2
  - .color: green
- .off:
  - =1/2
  - set:
  - .scaleTranspose: 6
  - .color: steelblue
- .legato: .5
- .echo: [ 4, 1/8, .5 ]
- .note:
- .piano:
- .pianoroll:
`;

export default tune;
