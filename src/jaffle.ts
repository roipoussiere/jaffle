/* eslint-disable @typescript-eslint/no-explicit-any */

import * as yaml from 'js-yaml';

import { EditorView, keymap } from '@codemirror/view';
import { solarizedLight } from '@uiw/codemirror-theme-solarized';
import { yaml as yamlMode } from '@codemirror/legacy-modes/mode/yaml';
import { StreamLanguage, LanguageSupport } from '@codemirror/language';

import * as core from '@strudel.cycles/core';
import * as mini from '@strudel.cycles/mini';
import * as webaudio from '@strudel.cycles/webaudio';
import * as tonal from '@strudel.cycles/tonal';
import { registerSoundfonts } from '@strudel.cycles/soundfonts';

const TUNES_PATH = './tunes/';
const TUNES = ['ws2_stack', 'ws3_delay', 'ws3_dub_tune', 'ws3_stack_in_stack', 'ws4_add_stack',
  'barry_harris', 'giant_steps', 'sample_drums', 'zelda_rescue'];
  // 'blippy_rhodes', 'caverave', 'festival_of_fingers', 'swimming', 'wavy_kalimba' ];
const SIGNALS_FN = ['Saw', 'Sine', 'Cosine', 'Tri', 'Square', 'Rand', 'Perlin',
  'Saw2', 'Sine2', 'Cosine2', 'Tri2', 'Square2', 'Rand2'];
const LAMBDA_PARAMS_NAME = ['a', 'b', 'c'];

const domSelectTune = <HTMLSelectElement> document.getElementById('select_tune');
const domBtnStart = <HTMLInputElement> document.getElementById('start');
const domBtnStop = <HTMLInputElement> document.getElementById('stop');

const yamlLang = new LanguageSupport(StreamLanguage.define(yamlMode));
const editor = new EditorView({
  extensions: [
    solarizedLight,
    yamlLang,
    keymap.of([
      { key: 'Ctrl-Enter', run: () => onPlay() },
      { key: 'Ctrl-.', run: () => onStop() },
    ]),
  ],
  parent: <HTMLElement> document.getElementById('input'),
});

const ctx = webaudio.getAudioContext();

initAudio();

const { evaluate, stop } = core.repl({
  defaultOutput: webaudio.webaudioOutput,
  getTime: () => ctx.currentTime,
  transpiler,
});

window.addEventListener('DOMContentLoaded', onDomLoaded);
domBtnStart.addEventListener('click', onPlay);
domBtnStop.addEventListener('click', onStop);
domSelectTune.addEventListener('change', (event) => {
  loadTune((<HTMLSelectElement> event.target).value);
});

function loadTune(tuneName: string): void {
  // eslint-disable-next-line no-console
  console.log(`Loading tune ${tuneName}...`);
  fetch(`${TUNES_PATH}${tuneName} + .yml`)
    .then((response) => response.text())
    .then((data) => {
      editor.dispatch({
        changes: {
          from: 0,
          to: editor.state.doc.length,
          insert: data,
        },
      });
    });
  domSelectTune.value = tuneName;
  window.location.hash = `#${tuneName}`;
}

function onDomLoaded(): void {
  TUNES.forEach((tune) => {
    const domTuneItem = document.createElement('option');
    domTuneItem.value = tune;
    domTuneItem.innerHTML = tune.replace(/_/g, ' ');
    domSelectTune.append(domTuneItem);
  });

  loadTune(window.location.hash.substring(1)
    || TUNES[Math.floor(Math.random() * TUNES.length)]);
}

function initAudio(): void {
  webaudio.samples(
    'https://strudel.tidalcycles.org/vcsl.json',
    'github:sgossner/VCSL/master/',
    { prebake: true },
  );
  webaudio.samples(
    'https://strudel.tidalcycles.org/piano.json',
    'https://strudel.tidalcycles.org/piano/',
    { prebake: true },
  );
  webaudio.samples(
    'https://strudel.tidalcycles.org/tidal-drum-machines.json',
    'github:ritchse/tidal-drum-machines/main/machines/',
    { prebake: true, tag: 'drum-machines' },
  );
  webaudio.samples(
    'https://strudel.tidalcycles.org/EmuSP12.json',
    'https://strudel.tidalcycles.org/EmuSP12/',
    { prebake: true, tag: 'drum-machines' },
  );

  webaudio.initAudioOnFirstClick();
  webaudio.registerSynthSounds();
  registerSoundfonts();
  core.evalScope(core.controls, core, mini, webaudio, tonal);
}

function transpiler(inputYaml: string): string {
  const tune = yaml.load(inputYaml);
  let outputJs = parseOutro(tune);
  outputJs += `return ${parseNode(tune instanceof Array ? { Stack: tune } : tune)}\n`;
  // eslint-disable-next-line no-console
  console.log(outputJs);
  return outputJs;
}

function parseNode(node: any, indentLvl = 0): string {
  if (node instanceof Array) {
    return node.map((item) => parseNode(item, indentLvl + 2)).join(', ');
  }
  if (node instanceof Object) {
    return parseObject(node, indentLvl);
  }
  return valueToString(node);
}

function getMainAttribute(node: any): string {
  const mainAttrs = Object.keys(node).filter((key) => key[0] !== key[0].toLowerCase());

  if (mainAttrs.length === 0) {
    throw new Error('Main attribute not found.');
  }
  if (mainAttrs.length > 1) {
    throw new Error(`Too many main attributes: ${mainAttrs.join(', ')}`);
  }
  return mainAttrs[0];
}

function getOutroAttributes(node: any): string[] {
  return Object.keys(node).filter((key) => key[0] === '.');
}

function getOtherAttributes(node: any): string[] {
  return Object.keys(node).filter((key) => key[0] === key[0].toLowerCase() && key[0] !== '.');
}

function valueToString(value: any): string {
  if (value === null) {
    return '';
  } if (!value.isNaN()) {
    return `${value}`;
  } if (value[0] === '=') {
    return value.substring(1).replaceAll(/[^a-c0-9.+\-*/()]/g, '');
  } if (value[0] === ':') {
    return `'${value.substring(1)}'`;
  } if (value[0] === '/') {
    return `mini('${value.substring(1).trim()}')`;
  }
  return `mini('${value.trim()}')`;
}

function indent(lvl: number): string {
  return lvl === 0 ? '' : `\n' + ${'  '.repeat(lvl)}`;
}

function parseOutro(node: any): string {
  let js = '';
  getOutroAttributes(node).forEach((attr) => {
    const newAttr = attr.split('^')[0];
    const prefix = attr[1] === '.' ? `await ${newAttr.substring(2)}` : newAttr.substring(1);
    js += `${prefix}(${getValue(attr, node, 0)})\n`;
  });
  return js;
}

function getValue(attr: string, node: any, indentLvl: number): string {
  const serialize = attr.split('^')[1];

  if (serialize === undefined) {
    return parseNode(node[attr], indentLvl);
  } if (serialize === '') {
    return JSON.stringify(node[attr], null, '  ').replace(/_/g, ' ');
  }
  const paramId = parseInt(serialize, 10) - 1;
  return node[attr].map((child: any, id: number) => (
    id === paramId
      ? JSON.stringify(child, null, '  ').replace(/_/g, ' ')
      : valueToString(child)
  ));
}

function parseObject(node: any, indentLvl: number): string {
  let js: string;
  let value: string;
  const mainAttr = getMainAttribute(node);

  if (mainAttr === 'M') {
    js = valueToString(node[mainAttr]);
  } else if (mainAttr === 'Set') {
    if (node[mainAttr] === null) {
      js = 'x => x';
    } else {
      const paramNames = LAMBDA_PARAMS_NAME.slice(0, node[mainAttr]);
      js = `(x, ${paramNames.join(', ')}) => x`;
    }
  } else {
    const newAttr = mainAttr.split('^')[0];
    js = indent(indentLvl) + newAttr[0].toLowerCase() + newAttr.substring(1);
    if (node[mainAttr] !== null && !SIGNALS_FN.includes(newAttr)) {
      value = getValue(mainAttr, node, indentLvl);
      js += `(${value})`;
    }
  }

  getOtherAttributes(node).forEach((attr) => {
    const newAttr = attr.split('^')[0];
    value = getValue(attr, node, indentLvl);
    js += `${indent(indentLvl + 1)}.${newAttr}(${value})`;
  });

  return js;
}

function onPlay(): boolean {
  ctx.resume();
  evaluate(editor.contentDOM.innerText);
  return false;
}

function onStop(): boolean {
  stop();
  return false;
}
