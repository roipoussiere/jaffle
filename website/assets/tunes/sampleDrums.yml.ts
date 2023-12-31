const tune = `
# "Sample drums"

- samples^:
  - bd: bd/BT0A0D0.wav
    sn: sn/ST0T0S3.wav
    hh: hh/000_hh3closedhh.wav
  - https://loophole-letters.vercel.app/samples/tidal/

- stack:
  - _<bd!3 bd(3,4,3)>
  - .color: '#F5A623'

  - _hh*4
  - .color: '#673AB7'

  - _~ <sn!3 sn(3,4,2)>
  - .color: '#4CAF50'

- .s:
- .pianoroll^:
    fold: 1
`;

export default tune;
