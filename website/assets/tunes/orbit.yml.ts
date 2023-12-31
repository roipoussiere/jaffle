const tune = `
# "Orbit"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- stack:
  - s: _bd <sd cp>
  - .delay: .5
  - .delaytime: .33
  - .delayfeedback: .6

  - s: _hh*2
  - .delay: .8
  - .delaytime: .08
  - .delayfeedback: .7
  - .orbit: 2

- .sometimes:
  - set:
  - .speed: -1
`;

export default tune;
