import * as yaml from 'js-yaml'

import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';
import { transpiler as _transpiler } from '@strudel.cycles/transpiler';

import { EditorView, keymap } from '@codemirror/view';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import * as yamlMode from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from "@codemirror/language"

const TUNES_PATH = './tunes/'
const TUNES = [
  'ws1_multi-lines',
  'ws2_stack',
  'ws3_delay',
  'ws3_dub_tune',
  'ws3_stack_in_stack',
  'ws4_add_stack'
];

const ctx = webaudio.getAudioContext();

const yaml_lang = new LanguageSupport(StreamLanguage.define(yamlMode.yaml));
const domSelectTune = document.getElementById('select_tune');
const editor = new EditorView({
  extensions: [
    solarizedLight,
    yaml_lang,
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
  const randomTune = TUNES[Math.floor(Math.random() * TUNES.length)];
  loadTune(randomTune)
  console.log(randomTune)
  domSelectTune.value = randomTune
});

domSelectTune.addEventListener('change', event => {
  loadTune(event.target.value);
});

const { evaluate, stop } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler
});

function loadTune(tune_name) {
  console.log('loading tune:', tune_name)
  fetch(TUNES_PATH + tune_name + '.yml')
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

function transpiler(input_yaml) {
  const tune = yaml.load(input_yaml)
  let output_js = readBlock(tune) + '\n\n'
  console.log(output_js);
  output_js = _transpiler(output_js) // todo: remove
  return output_js
}

function readBlock(block, indent_lvl=0) {
  let js = ''

  if (block instanceof Array) {
    js += block.map(item => readBlock(item, indent_lvl + 2)).join(',')
  } else if (block instanceof Object) {
    js += readObject(block, indent_lvl)
  } else {
    js += valueToString(block)
  }

  return js
}

function getMainAttr(obj) {
  const mainAttrs = Object.keys(obj).filter(key => key[0] == key[0].toUpperCase())
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
  value = `${ value }`.trim()
  value = value[0] === '_' ? value.substring(1) : value
  return `"${ value }"`
}

function indent(lvl) {
  return '\n' + '  '.repeat(lvl)
}

function readObject(obj, indent_lvl) {
  const mainAttr = getMainAttr(obj)
  let js = indent(indent_lvl) + `${ mainAttr.toLowerCase() }(${ readBlock(obj[mainAttr]) })`

  const attrs = Object.keys(obj).filter(key => key[0] == key[0].toLowerCase())
  for (const attr of attrs) {
    js += indent(indent_lvl + 1) + `.${ attr }(${ readBlock(obj[attr]) })`
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
