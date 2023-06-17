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


const DEFAULT_TUNE = './tunes/workshop1.yml';

const yaml_lang = new LanguageSupport(StreamLanguage.define(yamlMode.yaml));
let editor;
const ctx = webaudio.getAudioContext();

initAudio();

const { evaluate, stop } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler,
});

fetch(DEFAULT_TUNE)
  .then(response => response.text())
  .then((data) => editor = getEditor(data));

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

function getEditor(data) {
  const editor = new EditorView({
    doc: data,
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
  return editor;
}

function transpiler(input_yaml) {
  const tune = yaml.load(input_yaml)
  let output_js = readRoot(tune)
  console.log('Playing tune:');
  console.log(output_js);
  output_js = _transpiler(output_js) // todo: remove
  return output_js
}

function readRoot(root) {
  let rootJS = ''

  if ('stack' in root) {
    rootJS += readStack(root.stack);
  }

  return rootJS
}

function readStack(stack) {
  let stackItems = []

  stack.forEach(stackItem => {
    stackItems.push(readStackItem(stackItem))
  });

  return `stack(${ stackItems.join(',\n') }\n)`
}

function getMainAttr(stackItem) {
  const mainAttrs = Object.keys(stackItem).filter(key => key[0] == key[0].toUpperCase())
  let mainAttr = ''

  if (mainAttrs.length == 0) {
    console.error('Stack items should have at least one main attribute.')
  } else if (mainAttrs.length > 1) {
    console.error('Stack items should have only one main attribute.')
  } else {
    mainAttr = mainAttrs[0]
  }
  return mainAttr
}

function valueToString(value) {
  return '"' + `${ value }`.trim() + '"'
}

function readStackItem(stackItem) {
  const mainAttr = getMainAttr(stackItem)
  let js = `\n  ${ mainAttr.toLowerCase() }(${ valueToString(stackItem[mainAttr]) })`

  const attrs = Object.keys(stackItem).filter(key => key[0] == key[0].toLowerCase())
  for (const attr of attrs) {
    js += `\n    .${ attr }(${ valueToString(stackItem[attr]) })`
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
