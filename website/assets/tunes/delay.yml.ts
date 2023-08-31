const tune = `
# "Delay"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- stack:
  - s: _bd <sd cp>
  - .delay: _<0 .5>
  - .delaytime: _.16 | .33
  - .delayfeedback: _.6 | .8

- .sometimes:
  - set:
  - .speed: -1
`;

export default tune;
