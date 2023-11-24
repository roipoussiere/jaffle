const examples: { [key: string]: string } = {

  example_0: `
# Flor de Fuego

- shape: [200, 0.5, 1.5]
- .scale: [0.5, 0.5]
- .color:
  - [0.5, 2]
  #- .smooth: 1
  - 0.3
  - 0
- .repeat: [2, 2]
- .modulateScale:
  - osc: [3, 0.5]
  - -0.6
- .add: [o0, 0.5]
- .scale: 0.9
- .out:
`,


  example_3: `
# by Olivia Jack

- osc: [20, 0.03, 1.7]
- .kaleid:
- .mult:
  - osc: [20, 0.001, 0]
  - .rotate: 1.58
- .blend: [o0, 0.94]
- .modulateScale:
  - osc: [10, 0]
  - -0.03
- .scale
  - 0.8
  - () => 1.05 + 0.1 * Math.sin(0.05 * time)
- .out: o0
`,


  example_4: `
# by Nelson Vera
# twitter: @nel_sonologia

- osc: [8,-0.5, 1]
- .color: [-1.5, -1.5, -1.5]
- .blend: o0
- .rotate: [-0.5, -0.5]
- .modulate:
  - shape: 4
  - .rotate: [0.5, 0.5]
  - .scale: 2
  - .repeatX: [2, 2]
  - .modulate:
    - o0
    - () => mouse.x * 0.0005
  - .repeatY: [2, 2]
- .out: o0
`,


  example_6: `
# by Débora Falleiros Gonzales
# https://www.gonzalesdebora.com/

- osc: 5
- .add:
  - noise: [5, 2]
- .color: [0, 0, 3]
- .colorama: 0.4
- .out:
`,


  example_8: `
# by Rodrigo Velasco
# https://yecto.github.io/

- osc: [107, 0, 0.7]
- .color: [1, 0, 1]
- .rotate: [0, -0.08]
- .modulateRotate: [o1, 0.4]
- .out: o0

- osc: 33
- .rotate: [2, 0.8]
.modulateRotate:
  - o0
  - () => a.fft[0] * 2
- .out: o1
`,


  example_9: `
# by Rodrigo Velasco
# https://yecto.github.io/

- osc: [18, 0.1, 0]
- .color: [2, 0.1, 2]
- .mult:
  - osc: [20, 0.01, 0]
- .repeat: [2, 20]
- .rotate: 0.5
- .modulate: o1
- .scale:
  - 1
  - () => a.fft[0] * 0.9 + 2
- .diff: o1
- .out: o0

- osc: [20, 0.2, 0]
- .color: [2, 0.7, 0.1]
- .mult:
  - osc: 40
- .modulateRotate: [o0, 0.2]
- .rotate: 0.2
- .out: o1
`,


  example_10: `
# by Zach Krall
# http://zachkrall.online/

- osc: [215, 0.1, 2]
- .modulate:
  - osc: [2, -0.3, 100]
  - .rotate: 15
- .mult:
  - osc: [215, -0.1, 2]
  - .pixelate: [50, 50]
- .color: [0.9, 0.0, 0.9]
- .modulate:
  - osc: [6, -0.1]
  - .rotate: 9
- .add:
  - osc: [10, -0.9, 900]
  - .color: [1, 0, 1]
- .mult:
  - shape: [900, 0.2, 1]
  - .luma:
  - .repeatX: 2
  - .repeatY: 2
  - .colorama: 10
- .modulate:
  - osc: [9, -0.3, 900]
  - .rotate: 6
- .add:
  - osc: [4, 1, 90]
  - .color: [0.2, 0, 1]
- .out:
`,


  example_11: `
# by Zach Krall
# http://zachkrall.online/

- osc: [10, 0.9, 300]
- .color: [0.9, 0.7, 0.8]
- .diff:
  - osc: [45, 0.3, 100]
  - .color: [0.9, 0.9, 0.9]
  - .rotate: 0.18
  - .pixelate: 12
  - .kaleid:
- .scrollX: 10
- .colorama:
- .luma:
- .repeatX: 4
- .repeatY: 4
- .modulate:
  - osc: [1, -0.9, 300]
- .scale: 2
- .out:
`,


  example_13: `
# acid bus seat
# by Will Humphreys
# https://github.com/TheWispy

- osc: 105
- .color: [0.5,0.1,0.8]
- .rotate: [0.11, 0.1]
- .modulate:
  - osc: 10
  - .rotate: 0.3
  - .add: [o0, 0.1]
- .add:
  - osc: [20, 0.01, 1]
  - .color: [0, 0.8, 1]
- .out: o0

- osc: [50, 0.05, 0.7]
- .color: [1, 0.7, 0.5]
- .diff: o0
- .modulate: [o1, 0.05]
- .out: o1

- render: o1
`,


  example_14: `
# by Olivia Jack
# @_ojack_

- osc: [20, 0.01, 1.1]
- .kaleid: 5
- .color: [2.83, 0.91, 0.39]
- .rotate: [0, 0.1]
- .modulate:
  - o0
  - () => mouse.x * 0.0003
- .scale: 1.01
- .out: o0
`,


  example_15: `
# by Olivia Jack
# https://ojack.github.io

- osc: [100, 0.01, 1.4]
- .rotate: [0, 0.1]
- .mult:
  - osc: [10, 0.1]
  - .modulate:
    - osc: 10
    - .rotate: [0, -0.1]
    - 1
- .color: [2.83, 0.91, 0.39]
- .out: o0
`,


  example_16: `
# by Olivia Jack
# https://ojack.github.io

- osc: [4, 0.1, 0.8]
- .color: [1.04, 0, -1.1]
- .rotate: [0.30, 0.1]
- .pixelate: [2, 20]
- .modulate:
  - noise: 2.5
  - () => 1.5 * Math.sin(0.08 * time)
- .out: o0
`,


  example_17: `
# moire
# by Olivia Jack
# twitter: @_ojack_

- $pattern: () => osc(200, 0).kaleid(200).scale(1, 0.4)
- =pattern()
  - .scrollX: [0.1, 0.01]
  - .mult: pattern()
  - .out:
`,


  example_18: `
# by Olivia Jack
# https://ojack.github.io

- osc: [6, 0, 0.8]
  - .color: [1.14, 0.6,.80]
  - .rotate: [0.92, 0.3]
  - .pixelate: [20, 10]
  - .mult:
    - osc: [40, 0.03]
    - .thresh: 0.4
    - .rotate: [0, -0.02]
  - .modulateRotate:
    - osc: [20, 0]
    - .thresh: [0.3, 0.6]
    - () => 0.1 + mouse.x * 0.002
  - .out: o0
`,


  rangga_0: `
# Dreamy Diamond
# by Rangga Purnama Aji
# https://ranggapurnamaaji1.wixsite.com/portfolio

- osc: [7, -0.125]
- .modulate:
  - voronoi: 1
- .diff:
  - voronoi: 1
  - .mult:
    - gradient: -1
    - .luma: 0.125
- .luma: 0.125
- .add:
  - shape: [7, 0.5]
  - .mult:
    - voronoi: [10, 2]
    - .blend: o0
    - .diff:
      - gradient: 1
    - .modulate:
      - voronoi:
- .scrollY: -0.1
- .scrollX: 0.125
- .blend: o0
- .blend: o0
- .out:
`,


  rangga_1: `
# Tag & Sweep
# by Rangga Purnama Aji
# https://ranggapurnamaaji1.wixsite.com/portfolio

- osc: [5, 0.125]
- .colorama: 1
- .luma: 0.125
- .add:
  - shape: [1, 0.5]
  - .luma: 2
  - .diff:
    - gradient: 1
  - .diff:
    - osc: [-1, -0.25]
  - .blend: o0
  - .color: [0, 2.5, 1.75]
- .out:
`,


  rangga_2: `
# Monochrome Memoar
# by Rangga Purnama Aji
# https://ranggapurnamaaji1.wixsite.com/portfolio

- voronoi: [50, 1]
- .luma: 0.5
- .add:
  - shape: [1, 1]
  - .luma: 1
- .modulate:
  - osc: [-1000, -1]
  - .modulate:
    - osc:
    - .luma:
- .blend: o0
- .blend: o0
- .blend: o0
- .blend: o0
- .out:
`,


  rangga_3: `
# Galaxy Trip
# by Rangga Purnama Aji
# https://ranggapurnamaaji1.wixsite.com/portfolio

- shape: [1, 1]
- .mult:
  - voronoi: [1000, 2]
  - .blend: o0
  - .luma:
- .add:
  - shape: [3, 0.125]
  - .rotate: [1, 1]
  - .mult:
    - voronoi: [1000, 1]
    - .luma:
  - .rotate: 1.5
- .scrollX:
  - [0.1, -0.0625, 0.005, 0.00001]
  - 0
- .scrollY:
  - [0.1,-0.0625,0.005,0.00001]
  - 0
- .out:
`,


  rangga_4: `
# Sumet
# by Rangga Purnama Aji
# https://ranggapurnamaaji1.wixsite.com/portfolio

- osc: [0.5, 1.25]
- .mult:
  - shape: [1, 0.09]
  - .rotate: 1.5
- .diff:
  - gradient:
- .add:
  - shape: [2, 2]
  - .blend:
    - gradient: 1
- .modulate:
  - noise:
  - .modulate:
    - noise:
    - .scrollY: [1, 0.0625]
- .blend: o0
- .color: [1, -0.5, -0.75]
- .out:
`,


  marianne_0: `
# port
# by Marianne Teixido
# https://marianneteixido.github.io/

- osc: [5, 0.9, 0.001]
- .kaleid:
  - [3, 4, 5, 7, 8, 9, 10]
  - .fast: 0.1
- .color: [0.5, 0.3]
- .colorama: 0.4
- .rotate:
  - 0.009
  - () => Math.sin(time) * -0.001
- .modulateRotate:
  - o0
  - () => Math.sin(time) * 0.003
- .modulate: [o0, 0.9]
- .scale: 0.9
- .out: o0
`,


  marianne_1: `
# Pixelscape
# Marianne Teixido
# https://github.com/MarianneTeixido

- src: o0
- .saturate: 1.01
- .scale: .999
- .color: [1.01, 1.01, 1.01]
- .hue: .01
- .modulateHue:
  - src: o1
  - .hue: .3
  - .posterize: -1
  - .contrast: .7
  - 2
- .layer:
  - src: o1
  - .luma:
  - .mult:
    - gradient: 1
    - .saturate: .9
- .out: o0

- noise: [1, .2]
- .rotate: 2, .5]
- .layer:
  - src: o0
  - .scrollX: .2
- .out: o1

- render: o0
`,


  naoto_0: `
# @naoto_hieda

- osc: [20, 0.1, 0]
- .color: [0, 1, 2]
- .rotate: =1.57/2
- .out: o1

- osc: [30, 0.01, 0]
- .color: [2, 0.7, 1]
- .modulate: [o1, 0]
- .add: [o1, 1]
- .modulatePixelate: [o1, 1, 10]
- .out: o0
`,


  naoto_1: `
# @naoto_hieda
- solid: [0.2, 0.6, 0.9]
- .layer:
  - osc: [31.4, 0]
  - .thresh: 0.7
  - .luma:
  - .modulate:
    - osc: [4, 1]
    - .rotate: 1
    - 0.05
  - .color: [0, 0, 0]
- .layer:
  - osc: [31.4, 0]
  - .thresh: 0.7
  - .luma:
  - .modulate:
    - osc: [4, 1]
    - .rotate: 1
    - 0.1
- .out:
`,


  ritchse_0: `
# random trypophobia - changes everytime you load it!
# by Ritchse
# instagram.com/ritchse

- r = (min, max) => Math.random() * (max - min) + min

- solid: [1, 1, 1]
- .diff:
  - shape:
    - [4, 4, 4, 24]
    - .smooth:
    - .fast: .5
    - r: [0.6, 0.93]
    - .09
  - .repeat: [20, 10]
- .modulateScale:
  - osc: 8
  - .rotate:
  - $r: [-.5, .5]
  - .52
- .add:
  - src: o0
  - .scale: 0.965
  - .rotate:
    - = .012 * Math.round(r(-2,1))
    - .color:
      - $r: [0, 1]
      - $r: [0, 1]
      - $r: [0, 1]
  - .modulateRotate: [o0, r: [0, 0.5] ]
  - .brightness: .15
  - .7
- .out:
`,


  ritchse_1: `
# corrupted screensaver
# by Ritchse
# instagram.com/ritchse

- voronoi: [350, 0.15]
- .modulateScale:
  - osc: 8
  - .rotate:
    - Math.sin: time
  - .5
- .thresh: .8
- .modulateRotate: [ osc: 7, .4 ]
- .thresh: .7
- .diff:
  - src: o0
  - .scale: 1.8
- .modulateScale:
  - osc: 2
  - .modulateRotate: [o0, .74]
- .diff:
  - src: o0
  - .rotate: [[-.012, .01, -.002, 0]]
  - .scrollY:
    - 0
    - [-1/199800, 0]
    - .fast: 0.7
  - .brightness:
    - [-.02, -.17]
    - .smooth:
    - .fast: .5
- .out:
`,


  ritchse_2: `
# tropical juice
# by Ritchse
# instagram.com/ritchse

- voronoi: [2, 0.3, 0.2]
- .shift: 0.5
- .modulatePixelate: [ voronoi: [4, 0.2], 32, 2 ]
- .scale: () => 1+(Math.sin(time*2.5)*0.05)
- .diff:
  - voronoi: 3
  - .shift: 0.6
- .diff:
  - osc: [2, 0.15, 1.1]
  - .rotate:
- .brightness: 0.1
- .contrast: 1.2
- .saturate: 1.2
- .out:
- $speed: 0.8
`,


  ritchse_3: `
# trying to get closer
# by Ritchse
# instagram.com/ritchse

- osc: [60, -0.015, 0.3]
- .diff:
  - osc: [60, 0.08]
  - .rotate: =Math.PI/2
- .modulateScale:
  - noise: [3.5, 0.25]
  - .modulateScale:
    - osc: 15
    - .rotate: () => Math.sin(time / 2)
  - 0.6
- .color: [1, 0.5, 0.4]
- .contrast: 1.4
- .add:
  - src: o0
  - .modulate: [o0, .04]
  - .6
- .invert:
- .brightness: 0.1
- .contrast: 1.2
- .modulateScale: [ osc: 2, -0.2 ]
- .out:
`,


  ritchse_4: `
# disintegration
# by Ritchse
# instagram.com/ritchse

- osc: [5, .1]
- .modulate: [ noise: 6, .22 ]
- .diff: o0
- .modulateScrollY:
  - osc: 2
  - .modulate:
    - osc:
    - .rotate:
    - .11
- .scale: .72
- .color: [ 0.99, 1.014, 1]
- .out:
`,


  flor_0: `
# Flor de Fuego
# https://flordefuego.github.io/

- osc: [30, 0.01, 1]
- .mult:
  - osc: [20, -0.1, 1]
  - .modulate:
    - noise: [3, 1]
  - .rotate: 0.7
- .posterize:
  - [3, 10, 2]
  - .fast: 0.5
  - .smooth: 1
- .modulateRotate:
  - o0
  - () => mouse.x * 0.003
.out:
`,


  mahalia_0: `
# Mahalia H-R
# IG: @mm_hr_

- shape: [20, 0.1, 0.01]
- .scale: () => Math.sin(time) * 3
- .repeat: () => Math.sin(time) * 10
- .modulateRotate: o0
- .scale: () => Math.sin(time) * 2
- .modulate:
  - noise: [2, 0]
- .rotate: [0.1, 0.9]
- .out: o0

- src: o0
- .modulate:
  - osc: [500, 0, 0]
- .out: o1

- src: o1
- .modulateKaleid:
  - voronoi:
    - () => Math.sin(time) * 3
    - 0.1
    - 0.01
  - () => Math.sin(time) * 3
- .scale: () => Math.sin(time) * 3
- .out: o2

- render: o2
`,


  mahalia_1: `
# Mahalia H-R
# IG: @mm_hr_

- shape: () => Math.sin(time) + 1 * 2
- .rotate: () => Math.PI * mouse.x / 180
- .repeatX: 3
- .repeatY: () => Math.sin(time) * 5
- .scale: () => Math.PI / 4
- .blend:
  - src: o0
  - .color: [1, 0, 0]
- .modulate:
  - osc: [20, 0, .4]
- .kaleid: 2
- .out: o0

- render: o0
`,


  mahalia_2: `
# Velvet Pool
# by Mahalia H-R
# IG: mm_hr_


- noise:
- .color:
  - () => a.fft[2] * 2
  - 0
  - .6
- .modulate:
  - noise: () => a.fft[0] * 10
- .scale: () => a.fft[2] * 5
- .layer:
  - src: o0
  - .mask:
    - osc: 10
    - .modulateRotate: [ osc: , 90, 0 ]
  - .scale: () => a.fft[0] * 2
  - .luma: [0.2, 0.3]
- .blend: o0
- .out: o0

- osc:
- .modulate:
  - noise: () => a.fft[1] + 5
- .color: [1, 0, 0]
- .out: o1

- src: o0
- .modulate: o1
- .layer:
  - src: o1
  - .mask: o1
  - .saturate: 7

- .modulateRotate: o1
- .rotate: (time) => time % 360 * 0.05
- .out: o2

- render: o2
`,


  mahalia_3: `
# by Mahalia H-R
# IG: mm_hr_

- shape:
  - () => Math.sin(time) + 1 * 3
  - .5
  - .01
- .repeat:
  - 5
  - 3
  - () => a.fft[0] * 2
  - () => a.fft[1] * 2
- .scrollY: [.5, 0.1]
- .layer:
  - src: o1
  - .mask: o0
  - .luma: [.01, .1]
  - .invert: .2

- .modulate: [o1, .02]
- .out: o0

- osc: [40, 0.09, 0.9]
- .color: [.9, 0, 5]
- .modulate:
  - osc: 10
  - .rotate: [1, 0.5]
- .rotate: [1, 0.2]
- .out: o1

- render: o0
`,


  mahalia_4: `
# Cellular & Blobular
# by Mahalia H-R
# IG: mm_hr_

- $speed: 0.3

- shape: [20, 0.2, 0.3]
- .color: [0.5, 0.8, 50]
- .scale: () => Math.sin(time) + 1 * 2
- .repeat: () => Math.sin(time) * 10
- .modulateRotate: o0
- .scale: () => Math.sin(time) + 1 * 1.5
- .modulate:
  - noise: [2, 2]
- .rotate: [1, .2]
#- .invert: 2.4
- .out: o0
`,


  andromeda_0: `
# 3.0
# by ΔNDR0M3DΔ
# https://www.instagram.com/androm3_da/

- noise: [3, 0.3, 3]
- .thresh: [0.3, 0.03]
- .diff: [o3, 0.3]
- .out: o1

- gradient: [[0.3,0.3,3]]
- .diff: o0
- .blend: o1
- .out: o3

- voronoi: [33, 3, 30]
- .rotate: [3, 0.3, 0]
- .modulateScale: [o2, 0.3]
- .color: [-3, 3, 0]
- .brightness: 3
- .out: o0

- shape: [30, 0.3, 1]
.invert: ({time}) => Math.sin(time) * 3
- .out: o2

- render: o3
`,


  andromeda_1: `
# 3.3
# by ΔNDR0M3DΔ
# https://www.instagram.com/androm3_da/

- osc:
- .modulateRotate: [o0, 0.3]
- .out:

- osc: [33, 0.3, 0.3]
- .diff: [o3, 3]
- .out: o1

- osc: [3, 0.3, 33]
- .modulateKaleid: [o3, 3]
- .diff: o0
- .out: o2

- src: [o0, 3]
- .mult: [o1, 3]
- .kaleid: 3
- .out: o3

- render: o2
`,


  asdrubal_0: `
# Asdrúbal Gomez

- noise: [3, 0.1, 7]
- .rotate: [1, -1, -2]
- .mask:
  - shape: 20
- .colorama: 0.5
- .modulateScale: o0
- .modulateScale: [o0, 1, ]
- .blend: o0
- .blend: o0
- .blend: o0
- .blend: o0
- .out: o0
`,


  flor_1: `
# Hydra Glitchy Slit Scan
# Flor de Fuego
# https://flordefuego.github.io/

- s0
- .initCam:

- src: s0
- .saturate: 2
- .contrast: 1.3
- .layer:
  - src: o0
  - .mask:
    - shape: [4, 2]
    - .scale: [0.5, 0.7]
    - .scrollX: 0.25
  - .scrollX: 0.001
- .modulate: [o0, 0.001]
- .out: o0
`,


  flor_2: `
# Glitch River
# Flor de Fuego
# https://flordefuego.github.io/

- voronoi: [8, 1]
- .mult:
  - osc:
    - 10
    - 0.1
    - () => Math.sin(time) * 3
  - .saturate: 3
  - .kaleid: 200
- .modulate: [o0, 0.5]
- .add: [o0, 0.8]
- .scrollY: -0.01
- .scale: 0.99
- .modulate:
  - voronoi: [8, 1]
  - 0.008
- .luma: 0.3
- .out:

- $speed: 0.1
`,


  nesso_0: `
# clouds of passage
# by Nesso
# www.nesso.xyz

- shape:
  - [4, 5, 6]
  - .fast: 0.1
  - .smooth: 1
  - 0.000001
  - [0.2, 0.7]
  - .smooth: 1
- .color: [0.2, 0.4, 0.3]
- .scrollX: () => Math.sin(time * 0.27)
- .add:
  - shape:
    - [4, 5, 6]
    - .fast: 0.1
    - .smooth: 1
    - 0.000001
    - [0.2, 0.7, 0.5, 0.3]
    - .smooth: 1
  - .color: [0.6, 0.2, 0.5]
  - .scrollY: 0.35
  - .scrollX: () => Math.sin(time * 0.33)
- .add:
  - shape:
    - [4, 5, 6]
    - .fast: 0.1
    - .smooth: 1
    - 0.000001
    - [0.2, 0.7, 0.3]
    - .smooth: 1
  - .color: [0.2, 0.4, 0.6]
  - .scrollY: -0.35
  - .scrollX: () => Math.sin(time*0.41) * -1
- .add:
  - src: o0
  - .shift: [0.001, 0.01, 0.001]
  - .scrollX:
    - [0.05, -0.05]
    - .fast: 0.1
    - .smooth: 1
  - .scale:
    - [1.05, 0.9]
    - .fast: 0.3
    - .smooth: 1
    - [1.05, 0.9, 1]
    - .fast: 0.29
    - .smooth: 1
  - 0.85
- .modulate:
  - voronoi: [10, 2, 2]
- .out:
`,


  malitzin_0: `
# CNDSD
# http://malitzincortes.net/
# sand spirals

- osc: [3, 0.01, 0.4]
- .color: [1.2, 1.2, 1.3]
- .saturate: 0.4
- .modulateRepeat: [osc: 2, 1, 2, 4, 3]
- .modulateKaleid:
  - osc: [12, 0.05, 0]
  - 1
- .luma: 0.4
- .rotate: [4, 0.1, 0]
- .modulate:
  - o0
  - () => mouse.y * 0.0002
- .scale: 1
- .diff: o1
- .out: o0
`,


  malitzin_1: `
# CNDSD
# http://malitzincortes.net/
# ameba

- osc: [15, 0.01, 0.1]
- .mult:
  - osc: [1, -0.1]
- .modulate:
  - osc: 2
  - .rotate: [4, 1]
  - 20
- .color: [0, 2.4, 5]
- .saturate: 0.4
- .luma:
  - 1
  - 0.1
  - () => 1 + a.fft[3]
- .scale:
  - 0.7
  - () => 0.7 + a.fft[3]
- .diff: o0 # o0
- .out: o0 # o1
`,


  malitzin_2: `
# CNDSD
# http://malitzincortes.net/
# crazy squares

- shape:
  - 4
  - () => 0.2 + a.fft[2]
  - 1
- .mult:
  - osc: [1, 1]
  - .modulate:
    - osc: 5
    - .rotate: [1.4, 1]
    - 3
- .color: [1, 2, 4]
- .saturate: 0.2
- .luma:
  - 1.2
  - 0.05
  - () => 2 + a.fft[3]
- .scale:
  - 0.6
  - () => 0.9 + a.fft[3]
- .diff: o0 # o0
- .out: o0 # o1
`,


  khoparzi_0: `
# Happy Mandala
# By Abhinay Khoparzi
# twitter/github/instagram: @khoparzi

- voronoi: [5, -0.1, 5]
- .add:
  - osc: [1, 0, 1]
- .kaleid: 21
- .scale: [1, 1, 2]
- .colorama:
- .out: o1

- src: o1
- .mult:
  - src: s0
  - .modulateRotate: [o1, 100]
  - -0.5
- .out: o0
`,


  khoparzi_1: `
# Perpetual elevator buttons
# By Khoparzi
# http://khoparzi.com

- shape: 3
- .add:
  - osc: [1, 0.5, 1]
  - 1
- .add:
  - o1
  - () => Math.sin(time / 4) * 0.7 + 0.1
#- .repeat: 5
- .scale: () => Math.sin(time / 16)
- .rotate: [0, -0.1]
- .out: o1

- src: o1
- .rotate: [0, 0.1]
- .out:
`,


  khoparzi_2: `
# Really Love
# by Abhinay Khoparzi
# http://khoparzi.com

- osc: [100, -0.01245, 1]
- .pixelate: 50
- .kaleid: () => Math.sin(time / 8) * 9 + 3
- .rotate: [0, 0.125]
- .modulateRotate:
  - shape: 3
  - .scale: () => Math.cos(time) * 2
  - .rotate: [0, -0.25]
- .diff:
  - src: o0
  - .brightness: 0.3
- .out:
`,


  khoparzi_3: `
# Aqautic blubs
# By Khoparzi
# https://khoparzi.com

- gradient: 0.25
- .add:
  - noise:
  - () => Math.cos(time)
- .modulateRotate:
  - src: o0
  - .rotate: [0, -0.52]
  - 0.2
- .mult: [shape: 360, 0.8]
- .repeat: [10, 5]
- .mult:
  - shape: 360
  - .scale:
    - () => Math.sin(time)
    - 0.8
- .rotate: [0, 0.2]
- .diff:
  - src: o0
  - .rotate: [0, -0.2]
  - 0.2
- .out:
`,


  celeste_0: `
# Puertas II
# por Celeste Betancur
# https://github.com/essteban

- osc: [13, 0, 1]
- .kaleid:
- .mask:
  - shape: [4, 0.3, 1]
- .modulateRotate:
  - shape: [4, 0.1, 1]
- .modulateRotate:
  - shape: [4, 0.1, 0.9]
- .modulateRotate:
  - shape: [4, 0.1, 0.8]
- .scale: 0.3
- .add:
  - shape: [4, 0.2, 1]
  - .color: [0.3, 1, 1, 0.5]
- .rotate: () => time
- .out:
`,


  celeste_1: `
# Puertas III
# por Celeste Betancur
# https://github.com/essteban

- osc: [40, 0.2, 1]
- .modulateScale:
  - osc: [40, 0, 1]
  - .kaleid: 8
- .repeat: [2, 4]
- .modulate: [o0, 0.05]
- .modulateKaleid:
  - shape: [4, 0.1, 1]
- .out: o0
`,


  celeste_2: `
# Puertas
# por Celeste Betancur
# https://github.com/essteban

- osc: [13, 0, 1]
- .modulate:
  - osc: [21, 0.25, 0]
- .modulateScale:
  - osc: 34
- .modulateKaleid: [osc: 55, 0.1, 1]
- .out:
`,


  alexandre_0: `
# "the-wall"
# Alexandre Rangel
# www.alexandrerangel.art.br/hydra.html

- $speed: .0222

- osc: [48, -.1, 0]
- .thresh:
  - [.3, .7]
  - .fast: .75
  - 0
- .color: [0, 0, 1]
- .add:
  - osc: [28, .1, 0]
  - .thresh:
    - [.3, .7]
    - .fast: .75
    - 0
  - .rotate: =3.14/4
  - .color: [1, 0, 0]
  - .modulateScale:
    - osc: [64, -.01, 0]
    - .thresh:
      - [.3, .7]
      - .fast: .75
      - 0
- .diff:
  - osc: [28, .1, 0]
  - .thresh:
    - [.3, .7]
    - .fast: .5
    - 0
  - .rotate: =3.14/2
  - .color: [1, 0, 1]
  - .modulateScale:
    - osc: [64, -.015, 0]
    - .thresh:
      - [.3, .7]
      - .fast: .5
      - 0
- .modulateRotate:
  - osc: [54, -.005, 0]
  - .thresh:
    - [.3, .7]
    - .fast: .25
    - 0
- .modulateScale:
  - osc: [44, -.020, 0]
  - .thresh:
    - [.3, .7]
    - .fast: .25
    - 0
- .colorama: () => Math.sin(time / 27) * .01222 + 9.89
- .scale: 2.122
- .out:
`,


  alexandre_1: `
# "eye of the beholder"
# Alexandre Rangel
# www.alexandrerangel.art.br/hydra.html

- noise: [6, .05]
- .mult:
  - osc:
    - 9
    - 0
    - () => Math.sin(time / 1.5) + 2
- .mult:
  - noise: [9, .03]
  - .brightness: 1.2
  - .contrast: 2
  - .mult:
    - osc:
      - 9
      - 0
      - () => Math.sin(time / 3) + 13
- .diff:
  - noise: [15, .04]
  - .brightness: .2
  - .contrast: 1.3
  - .mult:
    - osc:
      - 9
      - 0
      - () => Math.sin(time / 5) + 13
  - .rotate: () => time / 33
- .scale: () => Math.sin(time / 6.2) * .12 + .15
- .modulateScale:
  - osc: [3, 0, 0]
  - .mult:
    - osc: [3, 0, 0]
    - .rotate: =3.14 / 2
  - .rotate: () => time / 25
  - .scale: .39
  - .scale: [1, .6, 1]
  - .invert:
  - () => Math.sin(time / 5.3) * 1.5 + 3
- .rotate: () => time / 22
- .mult:
  - shape: [100, .9, .01]
  - .scale: [1, .6, 1]
- .out:
`,


  alexandre_2: `
# "egg of the phoenix"
# Alexandre Rangel
# www.alexandrerangel.art.br/hydra.html

- $speed: 1.2

- shape: [99, .15, .5]
- .color: [0, 1, 2]
- .diff:
  - shape: [240, .5, 0]
  - .scrollX: .05
  - .rotate: () => time / 10
  - .color: [1, 0, .75]
- .diff:
  - shape: [99, .4, .002]
  - .scrollX: .10
  - .rotate: () => time / 20
  - .color: [1, 0, .75]
- .diff:
  - shape: [99, .3, .002]
  - .scrollX: .15
  - .rotate: () => time / 30
  - .color: [1, 0, .75]
- .diff:
  - shape: [99, .2, .002]
  - .scrollX: .20
  - .rotate: () => time / 40
  - .color: [1, 0, .75]
- .diff:
  - shape: [99, .1, .002]
  - .scrollX: .25
  - .rotate: () => time / 50
  - .color: [1, 0, .75]

- .modulateScale:
  - shape: [240, .5, 0]
  - .scrollX: .05
  - .rotate: () => time / 10
  - () => (Math.sin(time / 3) * .2) + .2

- .scale: [1.6, .6, 1]
- .out:
`,


  afalfl_0: `
# filet mignon
# AFALFL
# instagram/a_f_alfl

- osc: [100, -0.0018, 0.17]
- .diff:
  - osc: [20, 0.00008]
  - .rotate: =Math.PI / 0.00003
- .modulateScale:
  - noise: [1.5, 0.18]
  - .modulateScale:
    - osc: 13
    - .rotate: () => Math.sin(time / 22)
  - 3
- .color: [11, 0.5, 0.4, 0.9, 0.2, 0.011, 5, 22,  0.5, -1]
- .contrast: 1.4
- .add:
  - src: o0
  - .modulate: [o0, .04]
  - .6
  - .9
#- .pixelate: [0.4, 0.2, 0.1]
- .invert:
- .brightness: [0.0003, 2]
- .contrast: [0.5, 2, 0.1, 2]
- .color: [4, -2, 0.1]
- .modulateScale: [ osc: 2, -0.2, 2, 1, 0.3]
- .posterize: 200
- .rotate: [1, 0.2, 0.01, 0.001]
- .color: [22, -2, 0.5, 0.5, 0.0001,  0.1, 0.2, 8]
- .contrast: [0.18, 0.3, 0.1, 0.2, 0.03, 1]
- .brightness: [0.0001, -1, 10]
- .out:
`,


  eerie_ear_0: `
# ee_2 . MULTIVERSE . time and feedback
# e_e // @eerie_ear

- $pat: () =>
  - solid:
  - .layer:
  - solid:
  - .diff:
    - osc:
      - =(time / 16) * 1
      - =(time / 1000) * 0.2
    - .mult:
      - osc:
        - =(time / 8) * 1
        - =(time / 1006) * 0.2
      - .rotate: 1.57
    - .modulate:
      - shape: [106, 1, 0.05]
    - .mult:
      - shape: [106, 1, 0.05]
  - .modulateScale:
    - osc: [2, 0.125]
    - 0.125

- solid:
- .layer:
  - solid: [1, 1, 1]
  - .mult:
    - pat():
    - .diff:
      - src: o0
      - .scale: 0.2
      - .mult: [ solid: , [0.7, 0.6, 0.4, 0.6] ]
      - .kaleid: 1.01
      - .saturate: 0.3
  - .layer:
    - solid: [1, 1, 1]
    - .mask:
      - noise: [2, 0.05]
      - .invert:
      - .colorama: 2
      - .posterize: [8, 4]
      - .luma: 0.25
      - .thresh: 0.5
      - .modulateRotate:
        - osc: [1, 0.5]
    - .mult:
      - gradient: 0.5
      - .kaleid: 1
      - .colorama: 2
      - .saturate: 1.1
      - .contrast: 1.6
      - .mult: [ solid: , 0.45 ]
- .out:

- $speed: 0.5
`,


  eerie_ear_1: `
# ee_3 //LINES
# e_e // @eerie_ear
# based on
# @naoto_hieda
# https://naotohieda.com/blog/hydra-book/

- $n: 8
- $a: () =>
  - shape[4, 0.25, 0.009]
  - .rotate: () => time / -40
  - .repeat: [n, n]

- a:
- .add:
  - a
  - .scrollX: =0.5 / n
  - .scrollY: [ =0.5 / n, 1 ]
- .modulate: [o1, 0.1]
- .modulate:
  - src: o1
  - .color: [10, 10]
  - .add:
    - solid: [-14, -14]
  - .rotate: () => time / 40
  - 0.005
- .add:
  - src: o1
  - .scrollY:
    - [0.012, 0.02]
    - 0.5
- .out: o1

- src: o1
- .colorama: 1.2
- .posterize: 4
- .saturate: 0.7
- .contrast: 6
- .mult: [ solid: , 0.15 ]
- .out: o0
`,


  eerie_ear_2: `
# ee_5 . FUGITIVE GEOMETRY VHS . audioreactive shapes and gradients
# e_e // @eerie_ear

- $s: () =>
  - shape: 4
  - .scrollX:
    - [-0.5, -0.2, 0.3, -0.1, -0.1]
    - .smooth: 0.1
    - .fast: 0.3
  - .scrollY:
    - [0.25, -0.2, 0.3, -0.1, 0.2]
    - .smooth: 0.9
    - .fast: 0.15

- solid:
  - .add:
    - gradient: [3, 0.05]
    - .rotate: [0.05, -0.2]
    - .posterize: 2
    - .contrast: 0.6
    - [1, 0, 1, 0.5, 0, 0.6]
    - .smooth: 0.9
- .add:
  - s():
- .mult:
  - s():
  - .scale: 0.8
  - .scrollX: 0.01
  - .scrollY: -0.01
  - .rotate: [0.2, 0.06]
  - .add:
    - gradient: 3
    - .contrast: 0.6
    - [1, 0, 1, 0.5]
    - .smooth: 0.9
    - 0.5
  - .mult:
    - src: o0
    - .scale: 0.98
    - () => a.fft[0] * 9
- .diff:
- s():
- .modulate:
  - shape: 500
- .scale:
  - [1.7, 1.2]
  - .smooth: 0.9
  - .fast: 0.05
- .add:
  - gradient: 2
  - .invert:
  - () => a.fft[2]
- .mult:
  - gradient: () => a.fft[3] * 8
- .blend:
  - src:
    - o0
    - () => a.fft[1] * 40
- .add:
  - voronoi:
    - () => a.fft[1]
    - () => a.fft[3]
    - () => a.fft[0]
  - .thresh: 0.7
  - .posterize: [2, 4]
  - .luma: 0.9
  - .scrollY:
    - 1
    - () => a.fft[0] / 30
  - .colorama: 3
  - .thresh: () => a.fft[1]
  - .scale: () => a.fft[3] * 2
  - () => a.fft[0] / 2
- .out:

- $speed: 1

- a:
  - .setSmooth: 0.96
`,


  eerie_ear_3: `
# ee_1 . EYE IN THE SKY
# example of mask and function modulation
# e_e // @eerie_ear

- noise: 18
- .colorama: 1
- .posterize: 2
- .kaleid: 50
- .mask:
  - shape: [25, 0.25]
  - .modulateScale:
    - noise: [400.5, 0.5]
- .mask:
  - shape: [400, 1, 2.125]
- .modulateScale:
  - osc: [6, 0.125, 0.05]
  - .kaleid: 50
- .mult:
  - osc:
    - [20, 0.05, 2.4]
    - .kaleid: 50
    - 0.25
- .scale: [1.75, 0.65, 0.5]
- .modulate:
  - noise: 0.5
- .saturate: 6
- .posterize: [4, 0.2]
- .scale: 1.5
- .out:
`

}

export default examples;
