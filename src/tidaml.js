import * as yaml from 'js-yaml'

import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';

import { EditorView, keymap } from '@codemirror/view';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import * as yamlMode from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from '@codemirror/language'

const TUNES_PATH = './tunes/'
const TUNES = [
  // 'dev',
  'ws1_multi-lines',
  'ws2_stack',
  'ws3_delay',
  'ws3_dub_tune',
  'ws3_stack_in_stack',
  'ws4_add_stack'
];
const JS_HEADER = `return `
const JS_FOOTER = `\n`
const SIGNALS_FN = [ 'Saw', 'Sine', 'Cosine', 'Tri', 'Square', 'Rand', 'Perlin',
  'Saw2', 'Sine2', 'Cosine2', 'Tri2', 'Square2', 'Rand2' ]

const ctx = webaudio.getAudioContext();

const yamlLang = new LanguageSupport(StreamLanguage.define(yamlMode.yaml));
const domSelectTune = document.getElementById('select_tune');
const editor = new EditorView({
  extensions: [
    solarizedLight,
    yamlLang,
    keymap.of([
      { key: 'Ctrl-Enter', run: () => onPlay() },
      { key: 'Ctrl-.', run: () => onStop() },
    ])
  ],
  parent: document.getElementById('input')
});

initAudio();

window.addEventListener('DOMContentLoaded', () => {
  TUNES.map( tune => {
    const domTuneItem = document.createElement('option');
    domTuneItem.value = tune;
    domTuneItem.innerHTML = tune.replaceAll('_', ' ');
    domSelectTune.append(domTuneItem);
  });

  loadTune(window.location.hash.substring(1)
    || TUNES[Math.floor(Math.random() * TUNES.length)]);
});

domSelectTune.addEventListener('change', event => {
  loadTune(event.target.value);
});

const { evaluate, stop } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler
});

function loadTune(tuneName) {
  console.log(`Loading tune ${tuneName}...`)
  fetch(TUNES_PATH + tuneName + '.yml')
  .then(response => response.text())
  .then((data) => {
    editor.dispatch({
      changes: {
        from: 0,
        to: editor.state.doc.length,
        insert: data
      }
    })
  });
  domSelectTune.value = tuneName
  window.location.hash = `#${ tuneName }`
}

document.getElementById('start').addEventListener('click', onPlay);
document.getElementById('stop').addEventListener('click', onStop);

function initAudio() {
  webaudio.samples('https://strudel.tidalcycles.org/vcsl.json',
    'github:sgossner/VCSL/master/', { prebake: true })
  webaudio.samples('https://strudel.tidalcycles.org/piano.json',
    'https://strudel.tidalcycles.org/piano/', { prebake: true }),
  webaudio.samples('https://strudel.tidalcycles.org/tidal-drum-machines.json',
    'github:ritchse/tidal-drum-machines/main/machines/', { prebake: true, tag: 'drum-machines' }),
  webaudio.samples('https://strudel.tidalcycles.org/EmuSP12.json',
    'https://strudel.tidalcycles.org/EmuSP12/', { prebake: true, tag: 'drum-machines' })
  
  webaudio.initAudioOnFirstClick();
  webaudio.registerSynthSounds();
  registerSoundfonts();
  core.evalScope(core.controls, core, mini, webaudio, tonal);  
}

function transpiler(inputYaml) {
  const tune = yaml.load(inputYaml)
  let outputJs = JS_HEADER + readBlock(tune) + JS_FOOTER
  console.log(outputJs);
  return outputJs
}

function readBlock(block, indentLvl=0) {
  let js = ''

  if (block instanceof Array) {
    js += block.map(item => readBlock(item, indentLvl + 2)).join(',')
  } else if (block instanceof Object) {
    js += readObject(block, indentLvl)
  } else {
    js += valueToString(block)
  }

  return js
}

function getMainAttr(obj) {
  const mainAttrs = Object.keys(obj).filter(key => key[0] == key[0].toUpperCase() || key[0] == '^')
  let mainAttr = ''

  if (mainAttrs.length == 0) {
    console.error('Main attribute not found.')
  } else if (mainAttrs.length > 1) {
    console.error('Too many main attributes.')
  } else {
    mainAttr = mainAttrs[0]
  }
  return mainAttr
}

function valueToString(value) {
  if (value === null) {
    value = ''
  } else if (isNaN(value)) {
    value = value[0] === '_' ? value.substring(1) : value
    value = `mini('${ value.trim() }')`
  } else {
    value = `${ value }`
  }
  return value
}

function indent(lvl) {
  return lvl == 0 ? '' : '\n' + '  '.repeat(lvl)
}

function readObject(obj, indentLvl) {
  let js;
  const mainAttr = getMainAttr(obj)

  if (mainAttr === 'M') {
    js = readBlock(obj[mainAttr])
  } else {
    const prefix = mainAttr[0] == '^' ? ('await ' + mainAttr.substring(1)) : mainAttr
    const value = readBlock(obj[mainAttr])

    js = indent(indentLvl) + prefix.toLowerCase()
    js += value == '' && SIGNALS_FN.includes(mainAttr) ? '' : `(${ value })`
  }

  const attrs = Object.keys(obj).filter(key => key[0] == key[0].toLowerCase() && key[0] != '^')
  for (const attr of attrs) {
    js += indent(indentLvl + 1) + `.${ attr }(${ readBlock(obj[attr]) })`
  }

  return js;
}

function onPlay() {
  ctx.resume();
  evaluate(editor.contentDOM.innerText);
}

function onStop() {
  stop();
}
