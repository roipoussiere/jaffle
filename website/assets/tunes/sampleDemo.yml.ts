const tune = `
# "Sample demo"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- stack:
  # percussion
  - s: _[woodblock:1 woodblock:2*2] snare_rim:0,gong/8,brakedrum:1(3,8),~@3 cowbell:3
  - .sometimes:
    - set:
    - .speed: 2

  # melody
  - note:
    - _<0 4 1 3 2>
    - .off:
      - _.25 | .125
      - add: 2
    - .scale: D3 hirajoshi
  - .s: clavisynth
  - .gain: .2
  - .delay: .25
  - .jux:
    - Rev:
  - .degradeBy:
    - Sine:
    - .range: [ 0, .5 ]
    - .slow: 32

  # bass
  - note:
    - _<0@3 <2(3,8) 3(3,8)>>
    - .scale: D1 hirajoshi
  - .s: psaltery_pluck
  - .gain: .6
  - .clip: 1
  - .release: .1
  - .room: .5
`;

export default tune;
