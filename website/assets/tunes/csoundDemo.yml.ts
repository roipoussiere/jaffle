const tune = `
# "CSound demo"
# @license with CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
# @by Felix Roos

- loadCsound: >
    instr CoolSynth
      iduration = p3
      ifreq = p4
      igain = p5
      ioct = octcps(ifreq)

      kpwm = oscili(.05, 8)
      asig = vco2(igain, ifreq, 4, .5 + kpwm)
      asig += vco2(igain, ifreq * 2)

      idepth = 2
      acut = transegr:a(0, .005, 0, idepth, .06, -4.2, 0.001, .01, -4.2, 0) ; filter envelope
      asig = zdf_2pole(asig, cpsoct(ioct + acut + 2), 0.5)

      iattack = .01
      isustain = .5
      idecay = .1
      irelease = .1
      asig *= linsegr:a(0, iattack, 1, idecay, isustain, iduration, isustain, irelease, 0)
      
      out(asig, asig)
    endin

- _<0 2 [4 6](3,4,2) 3*2>
- .off:
  - =1/4
  - add: 2
- .off:
  - =1/2
  - add: 6
- .scale: D minor
- .note:
# - .pianoroll:
- .csound: CoolSynth
`;

export default tune;
