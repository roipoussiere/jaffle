const tune = `
# "Bass fuge"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
  - flbass:
    - 00_c2_finger_long_neck.wav
    - 01_c2_finger_short_neck.wav
    - 02_c2_finger_long_bridge.wav
    - 03_c2_finger_short_bridge.wav
    - 04_c2_pick_long.wav
    - 05_c2_pick_short.wav
    - 06_c2_palm_mute.wav
  - github:cleary/samples-flbass/main/
- samples^:
  - bd:
    - bd/BT0AADA.wav
    - bd/BT0AAD0.wav
    - bd/BT0A0DA.wav
    - bd/BT0A0D3.wav
    - bd/BT0A0D0.wav
    - bd/BT0A0A7.wav
    sd:
    - sd/rytm-01-classic.wav
    - sd/rytm-00-hard.wav
    hh:
    - hh27/000_hh27closedhh.wav
    - hh/000_hh3closedhh.wav
  - github:tidalcycles/Dirt-Samples/master/

- note:
  - _<8(3,8) <7 7*2> [4 5@3] 8>
  - .sub: 1 # sub 1 -> 1-indexed
  - .layer:
    - set:
    - set:
    - .add: 7
    - .color: steelblue
    - .off:
      - =1/8
      - set:
      - .add: _2,4
      - .off:
        - =1/8
        - set:
        - .add: 5
        - .echo: [ 4, .125, .5 ]
    - .slow: 2
  - .scale: A1 minor

- .s: flbass
- .n: 0
- .gain: .3
- .cutoff:
  - Sine:
  - .slow: 7
  - .range: [ 200, 4000 ]
- .resonance: 10
# .hcutoff: 400
- .clip: 1
- .stack:
  - s: _bd:1*2,~ sd:0,[~ hh:0]*2
- .pianoroll^:
    vertical: 1
`;

export default tune;
