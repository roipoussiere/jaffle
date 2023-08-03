const tune = `
# "Giant Steps"
# @by John Coltrane

- setVoicingRange:
  - lefthand
  - [ E3, G4 ]

- stack:
  - seq: # melody
    - _[F#5 D5] [B4 G4] Bb4 [B4 A4]
    - _[D5 Bb4] [G4 Eb4] F#4 [G4 F4]
    - _Bb4 [B4 A4] D5 [D#5 C#5]
    - _F#5 [G5 F5] Bb5 [F#5 F#5]
  - .color: '#F8E71C'

  - seq: # chords
    - _[B^7 D7] [G^7 Bb7] Eb^7 [Am7 D7]
    - _[G^7 Bb7] [Eb^7 F#7] B^7 [Fm7 Bb7]
    - _Eb^7 [Am7 D7] G^7 [C#m7 F#7]
    - _B^7 [Fm7 Bb7] Eb^7 [C#m7 F#7]
  - .voicings: lefthand
  - .color: '#7ED321'

  - seq: # bass
    - _[B2 D2] [G2 Bb2] [Eb2 Bb3] [A2 D2]
    - _[G2 Bb2] [Eb2 F#2] [B2 F#2] [F2 Bb2]
    - _[Eb2 Bb2] [A2 D2] [G2 D2] [C#2 F#2]
    - _[B2 F#2] [F2 Bb2] [Eb2 Bb3] [C#2 F#2]
  - .color: '#00B8D4'

- .slow: 20
- .note:
# - pianoroll^:
#   fold: 1
`;

export default tune;
