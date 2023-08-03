const tune = `
# "Blippy Rhodes"
# @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- samples^:
  - bd: samples/tidal/bd/BT0A0D0.wav
    sn: samples/tidal/sn/ST0T0S3.wav
    hh: samples/tidal/hh/000_hh3closedhh.wav
    rhodes:
      E1: samples/rhodes/MK2Md2000.mp3
      E2: samples/rhodes/MK2Md2012.mp3
      E3: samples/rhodes/MK2Md2024.mp3
      E4: samples/rhodes/MK2Md2036.mp3
      E5: samples/rhodes/MK2Md2048.mp3
      E6: samples/rhodes/MK2Md2060.mp3
      E7: samples/rhodes/MK2Md2072.mp3
  - https://loophole-letters.vercel.app/

- stack:
  - s: _<bd sn> <hh hh*2 hh*3>
  - .color: '#00B8D4'
  
  - _<g4 c5 a4 [ab4 <eb5 f5>]>
  - .scale: _<C:major C:mixolydian F:lydian [F:minor <Db:major Db:mixolydian>]>
  - .struct: _x*8
  - .scaleTranspose: _0 [-5,-2] -7 [-9,-2]
  - .slow: 2
  - .note:
  - .clip: .3
  - .s: rhodes
  - .room: .5
  - .delay: .3
  - .delayfeedback: .4
  - .delaytime: =1/12
  - .gain: .5
  - .color: '#7ED321'
  
  - _<c2 c3 f2 [[F2 C2] db2]>/2
  - .add: _0,.02
  - .note:
  - .gain: .3
  - .clip: _<1@3 [.3 1]>/2
  - .s: sawtooth
  - .cutoff: 600
  - .color: '#F8E71C'

- .fast: =3/2
# - .pianoroll:
#     fold: 1
`;

export default tune;
