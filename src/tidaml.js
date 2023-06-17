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

function readStackItem(stackItem) {
  let js = '';

  // const entries = Object.keys(stackItem).filter(key => key[0] == key[0].toUpperCase())
  // if (entries.length != 1) {
  //   throw new Error('stack item should have exactly one entry.')
  // }

  if ('N' in stackItem) {
    js += `\n  n("${ stackItem.N.trim() }")`
  } else if ('Note' in stackItem) {
    js += `\n  note("${ stackItem.Note.trim() }")`
  } else if ('Sound' in stackItem) {
    js += `\n  sound("${ stackItem.Sound.trim() }")`
  } else {
    throw new Error('No main property.')
  }

  if ('sound' in stackItem) {
    js += `\n    .sound("${ stackItem.sound }")`
  }
  if ('delay' in stackItem) {
    js += `\n    .delay(${ stackItem.delay })`
  }
  if ('scale' in stackItem) {
    js += `\n    .scale("${ stackItem.scale }")`
  }
  if ('bank' in stackItem) {
    js += `\n    .bank("${ stackItem.bank }")`
  }
  if ('lpf' in stackItem) {
    js += `\n    .lpf(${ stackItem.lpf })`
  }
  if ('room' in stackItem) {
    js += `\n    .room(${ stackItem.lpf })`
  }
  if ('gain' in stackItem) {
    js += `\n    .gain(${ stackItem.lpf })`
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
