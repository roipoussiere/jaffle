const tune = `
# "Princess Zelda's Rescue"
# @by Koji Kondo

- stack:
  - > # melody
    _[B3@2 D4] [A3@2 [G3 A3]] [B3@2 D4] [A3] 
     [B3@2 D4] [A4@2 G4] [D4@2 [C4 B3]] [A3]
     [B3@2 D4] [A3@2 [G3 A3]] [B3@2 D4] [A3]
     [B3@2 D4] [A4@2 G4] D5@2 
     [D5@2 [C5 B4]] [[C5 B4] G4@2] [C5@2 [B4 A4]] [[B4 A4] E4@2]
     [D5@2 [C5 B4]] [[C5 B4] G4 C5] [G5] [~ ~ B3]
  - .color: '#9C7C38'

  - > # bass
    _[[C2 G2] E3@2] [[C2 G2] F#3@2] [[C2 G2] E3@2] [[C2 G2] F#3@2]
     [[B1 D3] G3@2] [[Bb1 Db3] G3@2] [[A1 C3] G3@2] [[D2 C3] F#3@2]
     [[C2 G2] E3@2] [[C2 G2] F#3@2] [[C2 G2] E3@2] [[C2 G2] F#3@2]
     [[B1 D3] G3@2] [[Bb1 Db3] G3@2] [[A1 C3] G3@2] [[D2 C3] F#3@2]
     [[F2 C3] E3@2] [[E2 B2] D3@2] [[D2 A2] C3@2] [[C2 G2] B2@2]
     [[F2 C3] E3@2] [[E2 B2] D3@2] [[Eb2 Bb2] Db3@2] [[D2 A2] C3 [F3,G2]]
  - .color: '#4C4646'

- .transpose: 12
- .slow: 48
- .superimpose: # add slightly detuned voice
  - set:
  - .add: 0.06
- .note:
- .gain: .1
- .s: triangle
- .room: 1
- .pianoroll^:
    fold: 1
`;

export default tune;
