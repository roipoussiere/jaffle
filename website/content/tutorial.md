---
title: "Tutorial"
---

# Jaffle tutorial for Strudel

This tutorial is based on the [Strudel workshop](https://strudel.cc/workshop/getting-started/), adapted for the Jaffle interface.

Please note that Jaffle is a generic graphical interface, which is not specifically designed to be used with Strudel (to produce sound): it can also be used with [Hydra](https://hydra.ojack.xyz/) (to produce video) or other projects. But making sound with Jaffle is funny, so let's start with that. Other tutorial might be created later.

---

# Welcome

Welcome to the Strudel documentation pages!

You've come to the right place if you want to learn how to make music with code, using a graphical interface.

## What is Strudel?

With Strudel, you can expressively write dynamic music pieces.

It is an official port of the [Tidal Cycles](https://tidalcycles.org/) pattern language to JavaScript.

Jaffle on its side is a graphical interface that generates an execute this JavaScript code, in order to make this more accessible.

You don't need to know JavaScript or Tidal Cycles to make music with Strudel.
This tutorial will guide you through the basics of Strudel.

The best place to actually make music with Strudel is the [Strudel REPL](https://strudel.cc/), and the best place to make music with Jaffle is the [Jaffle editor](https://roipoussiere.frama.io/jaffle/editor/).

## What can you do with Strudel?

- live code music: make music with code in real time;
- algorithmic composition: compose music using tidal's unique approach to pattern manipulation;
- teaching: focussing on a low barrier of entry, Strudel is a good fit for teaching music and code at the same time;
- integrate into your existing music setup: either via MIDI or OSC, you can use Strudel as a really flexible sequencer.

## Example

Here is an example of how strudel can look on Jaffle:

```yml
- stack:
  - s: _bd,[~ <sd!3 sd(3,4,2)>],hh*8
  - .speed:
    - Perlin:
    - .range: [.8, .9] # random sample speed variation

  # bassline
  - _<a1 b1\*2 a1(3,8) e2>
  - .off:
    - 1/8
    - set:
    - .add: 12
    - .degradeBy: .5 # random octave jumps
  - .add:
    - Perlin:
    - .range: [0, .5] # random pitch variation
  - .superimpose:
    - add: .05 # add second, slightly detuned voice
  - .note: # wrap in "note"
  - .decay: .15
  - .sustain: 0 # make each note of equal length
  - .s: sawtooth # waveform
  - .gain: .4 # turn down
  - .cutoff:
    - Sine:
    - .slow: 7
    - .range: [300, 5000] # automate cutoff

  # chords
  - _<Am7!3 <Em7 E7b13 Em7 Ebm7b5>>
  - .voicings: lefthand
  - .superimpose:
    - set: x
    - .add: .04 # add second, slightly detuned voice
  - .add:
    - Perlin:
    - .range: [0, .5] # random pitch variation
  - .note: # wrap in "note"
  - .s: sawtooth # waveform
  - .gain: .16 # turn down
  - .cutoff: 500 # fixed cutoff
  - .attack: 1 # slowly fade in

- .slow: =3/2
```

Which is rendered like this on the node interface:

![](../images/demo.png)

To hear more, go to the [Jaffle editor](https://roipoussiere.frama.io/jaffle/editor/) and select an
example from the menu (top-right button).

## Getting Started

The best way to start learning Strudel with Jaffle is this tutorial.
If you're ready to dive in, let's start with your [first sounds](#first-sounds).

# First Sounds

This is the first chapter of the Jaffle Strudel tutorial, nice to have you on board!

## Code Fields

Unlike the Strudel workshop, this tutorial is not interactive yet: you need to copy-paste code on
the Jaffle editor. Also, copy-pasting Jaffle tunes on the node editor is not possible yet, so you
must switch to the Yaml editor, paste code, then switch to the Node editor. It is recommended have
the Jaffle editor opened on an other tab.

Let's try with this simple code:

```yml
- sound: casio
```

> 1. select the code above, the copy it (`ctrl-c`)
> 2. go to the Jaffle editor
> 3. switch to the Yaml tab
> 4. replace current code with the clipboard content (`ctrl-a`, `ctrl-v`)
> 5. switch to the Node tab

The node editor should display this:

![](../images/intro.png)

Then:

> 6. press `ctrl`+`enter` to play
> 7. change `casio` to `metal`
> 8. press `ctrl`+`enter` to update
> 9. press `ctrl`+`.` to stop

Congratulations, you are now live coding!

## Sounds

We have just played a sound with `sound` like this:

```yml
- sound: casio
```

> `casio` is one of many standard sounds.
> 
> Try out a few other sounds:
> 
> - `insect`
> - `wind`
> - `jazz`
> - `metal`
> - `east`
> - `crow`
> - `casio`
> - `space`
> - `numbers`
>
> You might hear a little pause while the sound is loading.

**Change Sample Number with :**

One Sound can contain multiple samples (audio files).

You can select the sample by appending `:` followed by a number to the name:

```yml
- sound: _casio:1
```

The `_` prefix belongs to the [Jaffle syntax](https://roipoussiere.frama.io/jaffle/syntax/): it is used to specify that the text is a *mini-notation* (more on this later) and to avoid conflicts with the yaml syntax.

> Try different sound / sample number combinations.
>
> Not adding a number is like doing `:0`

Now you know how to use different sounds.
For now we'll stick to this little selection of sounds, but we'll find out how to load your own sounds later.

## Drum Sounds

By default, Strudel comes with a wide selection of drum sounds:

```yml
- sound: _bd hh sd oh
```

> These letter combinations stand for different parts of a drum set:
>
> - `bd` = **b**ass **d**rum
> - `sd` = **s**nare **d**rum
> - `rim` = **rim**shot
> - `hh` = **h**i**h**at
> - `oh` = **o**pen **h**ihat
> 
> Try out different drum sounds!


To change the sound character of our drums, we can use `bank` to change the drum machine:

```yml
- sound: _bd hh sd oh
- .bank: RolandTR909
```

In this example `RolandTR909` is the name of the drum machine that we're using.
It is a famous drum machine for house and techno beats.

> Try changing `RolandTR909` to one of
>
> - `AkaiLinn`
> - `RhythmAce`
> - `RolandTR808`
> - `RolandTR707`
> - `ViscoSpaceDrum`
>
> There are a lot more, but let's keep it simple for now
>
> 🦥 Pro-Tip: Mark a name via double click. Then just copy and paste!

## Sequences

In the last example, we already saw that you can play multiple sounds in a sequence by separating them with a space:

```yml
- sound: _bd hh sd hh
```

> Try adding more sounds to the sequence!

**The longer the sequence, the faster it runs**

```yml
- sound: _bd bd hh bd rim bd hh bd
```

The content of a sequence will be squished into what's called a cycle.

**One way to change the tempo is using `cpm`**

```yml
- sound: _bd bd hh bd rim bd hh bd
- .cpm: 40
```

> cpm = cycles per minute
>
> By default, the tempo is 60 cycles per minute = 1 cycle per second.

We will look at other ways to change the tempo later!

**Add a rests in a sequence with '~'**

```yml
- sound: _bd hh ~ rim
```

**Sub-Sequences with [brackets]**

```yml
- sound: _bd [hh hh] sd [hh bd]
```

> Try adding more sounds inside a bracket!

Similar to the whole sequence, the content of a sub-sequence will be squished to the its own length.

**Multiplication: Speed things up**

```yml
- sound: _bd hh*2 rim hh*3
```

**Multiplication: Speed up sequences**

```yml
- sound: _bd [hh rim]*2
```

**Multiplication: Speeeeeeeeed things up**

```yml
- sound: _bd hh*16 rim hh*8
```

> Pitch = really fast rhythm

**Sub-Sub-Sequences with [[brackets]]**

```yml
- sound: _bd [[rim rim] hh]
```

> You can go as deep as you want!

**Play sequences in parallel with comma**

```yml
- sound: _hh hh hh, bd casio
```

You can use as many commas as you want:

```yml
- sound: _hh hh hh, bd bd, ~ casio
```

Commas can also be used inside sub-sequences:

```yml
- sound: _hh hh hh, bd [bd,casio]
```

> Notice how the 2 above are the same?
>
> It is quite common that there are many ways to express the same idea.

**Multiple Lines**

```yml
- sound: |
    _bd*2, ~ cp, 
     ~ ~ ~ oh, hh*4,
     [~ casio]*2
```

The `|` sign on the first line belongs to the yaml syntax and allows to use a multi-line value, which must be indented with 4 spaces.

**selecting sample numbers separately**

Instead of using ":", we can also use the `n` function to select sample numbers:

```yml
- n: _0 1 [4 2] 3*2
- .sound: jazz
```

This is shorter and more readable than:

```yml
- sound: _jazz:0 jazz:1 [jazz:4 jazz:2] jazz:3*2
```

## Recap

Now we've learned the basics of the so called Mini-Notation, the rhythm language of Tidal.
This is what we've leared so far:

| Concept           | Syntax     | Example                             |
| ----------------- | ---------- | ----------------------------------- |
| Sequence          | *space*    | `- sound: _bd bd sd hh`             |
| Sample Number     | `:x`       | `- sound: _hh:0 hh:1 hh:2 hh:3`     |
| Rests             | `~`        | `- sound: _metal ~ jazz jazz:1`     |
| Sub-Sequences     | `[`, `]`   | `- sound: _bd wind [metal jazz] hh` |
| Sub-Sub-Sequences | `[[`, `]]` | `- sound: _bd [metal [jazz sd]]`    |
| Speed up          | `*`        | `- sound: _bd sd*2 cp*3`            |
| Parallel          | `,`        | `- sound: _bd*2, hh*2 [hh oh]`      |

The Mini-Notation is usually used inside some function. These are the functions we've seen so far:

| Name  | Description                         | Example                               |
| ----- | ----------------------------------- | ------------------------------------- |
| sound | plays the sound of the given name   | `- sound: _bd sd`                     |
| bank  | selects the sound bank              | `[sound: _bd sd, .bank: RolandTR909]` |
| cpm   | sets the tempo in cycles per minute | `[sound: _bd sd, .cpm: 90]`           |
| n     | select sample number                | `[n: _0 1 4 2, .sound: jazz]`         |

## Examples

**Basic rock beat**

```yml
- sound: _bd sd, hh*4
- .bank: RolandTR505
- .cpm: =100/2
```

> Note: the `=` prefix on the last line belongs to the Jaffle syntax: it means that the following text is an arithmetic expression.

**Classic house**

```yml
- sound: _bd*2, ~ cp, [~ hh]*2
- .bank: RolandTR909
```

> Notice that the two patterns are extremely similar.
> Certain drum patterns are reused across genres.

We Will Rock you

```yml
- sound: _bd*2 cp
- .bank: RolandTR707
- .cpm: =81/2
```

**Yellow Magic Orchestra - Firecracker**

```yml
- sound: _bd sd, ~ ~ ~ hh ~ hh ~ ~, ~ perc ~ perc:1*2
- .bank: RolandCompurhythm1000
```

**Imitation of a 16 step sequencer**

```yml
- sound: |
    _[~  ~  oh ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ],
     [hh hh ~  ~ ] [hh ~  hh ~ ] [hh ~  hh ~ ] [hh ~  hh ~ ],
     [~  ~  ~  ~ ] [cp ~  ~  ~ ] [~  ~  ~  ~ ] [cp ~  ~  ~ ],
     [bd ~  ~  ~ ] [~  ~  ~  bd] [~  ~  bd ~ ] [~  ~  ~  bd]
- .cpm: '=90/4'
```

**Another one**

```yml
- sound: |
    _[~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  ~  ~ ] [~  ~  oh:1 ~ ],
     [hh hh hh hh] [hh hh hh hh] [hh hh hh hh] [hh hh ~  ~ ],
     [~  ~  ~  ~ ] [cp ~  ~  ~ ] [~  ~  ~  ~ ] [~  cp ~  ~ ],
     [bd bd ~  ~ ] [~  ~  bd ~ ] [bd bd ~ bd ] [~  ~  ~  ~ ]
- .bank: RolandTR808
- .cpm: =88/4
```

**Not your average drums**

```yml
- s: |
    _jazz*2,
     insect [crow metal] ~ ~,
     ~ space:4 ~ space:1,
     ~ wind
- .cpm: =100/2
```

Now that we know the basics of how to make beats, let's look at how we can play [notes](#first-notes)

# First Notes

Let's look at how we can play notes

## numbers and notes

**play notes with numbers**

```yml
- note: _48 52 55 59
- .sound: piano
```

> Try out different numbers!
>
> Try decimal numbers, like 55.5

**play notes with letters**

```yml
- note: _c e g b
- .sound: piano
```

> Try out different letters (a - g).
>
> Can you find melodies that are actual words? Hint: ☕ 😉 ⚪

**add flats or sharps to play the black keys**

flats `b`:

```yml
- note: _db eb gb ab bb
- .sound: piano
```

sharps `#`:

```yml
- note: _c# d# f# g# a#
- .sound: piano
```

**play notes with letters in different octaves**

```yml
- note: _c2 e3 g4 b5
- .sound: piano
```

> Try out different octaves (1-8)

If you are not comfortable with the note letter system, it should be easier to use numbers instead.
Most of the examples below will use numbers for that reason.
We will also look at ways to make it easier to play the right notes later.

## changing the sound

Just like with unpitched sounds, we can change the sound of our notes with `sound`:

```yml
- note: _36 43, 52 59 62 64
- .sound: piano
```

> Try out different sounds:
>
> - `gm_electric_guitar_muted`
> - `gm_acoustic_bass`
> - `gm_voice_oohs`
> - `gm_blown_bottle`
> - `sawtooth`
> - `square`
> - `triangle`
> - how about `bd`, `sd` or `hh`?
> - remove `.sound: ...` completely

**switch between sounds**

```yml
- note: _48 67 63 [62, 58]
- .sound: _piano gm_electric_guitar_muted
```

**stack multiple sounds**

```yml
- note: _48 67 63 [62, 58]
- .sound: _piano, gm_electric_guitar_muted
```

> The `note` and `sound` patterns are combined!
>
> We will see more ways to combine patterns later..

## Longer Sequences

**Divide sequences with `/` to slow them down**

```yml
- note: _[36 34 41 39]/4
- .sound: gm_acoustic_bass
```

> The `/4` plays the sequence in brackets over 4 cycles (=4s).
> 
> So each of the 4 notes is 1s long.
> 
> Try adding more notes inside the brackets and notice how it gets faster.

Because it is so common to just play one thing per cycle, you can...

**Play one per cycle with `<` and `>`**

```yml
- note: _<36 34 41 39>
- .sound: gm_acoustic_bass
```

> Try adding more notes inside the brackets and notice how it does **not** get faster.

**Play one sequence per cycle**

```yml
- note: _<[36 48]*4 [34 46]*4 [41 53]*4 [39 51]*4>/2
- .sound: gm_acoustic_bass
```

**Alternate between multiple things**

```yml
- note: _60 <63 62 65 63>
- .sound: gm_xylophone
```

This is also useful for unpitched sounds:

```yml
- sound: _bd*2, ~ <sd cp>, [~ hh]*2
- .bank: RolandTR909
```

## Scales

Finding the right notes can be difficult... Scales are here to help:

```yml
- n: _0 2 4 <[6,8] [7,9]>
- .scale: _C:minor
- .sound: piano
```

> Try out different numbers. Any number should sound good!
>
> Try out different scales:
>
> - `C:major`
> - `A2:minor`
> - `D:dorian`
> - `G:mixolydian`
> - `A2:minor:pentatonic`
> - `F:major:pentatonic`

**Automate scales**

Just like anything, we can automate the scale with a pattern:

```yml
- n: _<0 -3>, 2 4 <[6,8] [7,9]>
- .scale: _<C:major D:mixolydian>/4
- .sound: piano
```

> If you have no idea what these scale mean, don't worry.
> These are just labels for different sets of notes that go well together.
>
> Take your time and you'll find scales you like!

## Repeat & Elongate

**Elongate with @**

```yml
- note: _c@3 eb
- .sound: gm_acoustic_bass
```

> Not using `@` is like using `@1`. In the above example, c is 3 units long and eb is 1 unit long.
>
> Try changing that number!

**Elongate within sub-sequences**

```yml
- n: _<[4@2 4] [5@2 5] [6@2 6] [5@2 5]>*2
- .scale: _<C2:mixolydian F2:mixolydian>/4
- .sound: gm_acoustic_bass
```

> This groove is called a `shuffle`.
>
> Each beat has two notes, where the first is twice as long as the second.
>
> This is also sometimes called triplet swing. You'll often find it in blues and jazz.

**Replicate**

```yml
- note: _c!2 [eb,<g a bb a>]
- .sound: piano
```

> Try switching between `!`, `*` and `@`
>
> What's the difference?

## Recap

Let's recap what we've learned in this chapter:

| Concept   | Syntax  | Example               |
| --------- | ------- | --------------------- |
| Slow down | `/`      | `- note: _[c a f e]/2` |
| Alternate | `<`, `>` | `- note: _c <e g>`     |
| Elongate  | `@`      | `- note: _c@3 e`       |
| Replicate | `!`      | `- note: _c!3 e`       |

New functions:

| Name  | Description                         | Example                                            |
| ----- | ----------------------------------- | -------------------------------------------------- |
| note  | set pitch as number or letter       | `[ note: _b g e c, .sound: piano ]`                |
| scale | interpret `n` as scale degree       | `[ n: _6 4 2 0, .scale: _C:minor, .sound: piano ]` |
| stack | play patterns in parallel (read on) | `- stack: [ s: _bd sd, note: _c eb g ]`            |

## Examples

**Classy Bassline**

```yml
- note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
- .sound: gm_synth_bass_1
- .lpf: 800 # <-- we'll learn about this soon
```

**Classy Melody**

```yml
- n: |
    _<[~ 0] 2 [0 2] [~ 2]
      [~ 0] 1 [0 1] [~ 1]
      [~ 0] 3 [0 3] [~ 3]
      [~ 0] 2 [0 2] [~ 2]
    >*2
- .scale: _C4:minor
- .sound: gm_synth_strings_1
```

**Classy Drums**

```yml
- sound: _bd*2, ~ <sd cp>, [~ hh]*2
- .bank: RolandTR909
```

**If there just was a way to play all the above at the same time.......**

> It's called `stack` 😙

```yml
- stack:
  - note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
  - .sound: gm_synth_bass_1
  - .lpf: 800

  - n: |
      _<
      [~ 0] 2 [0 2] [~ 2]
      [~ 0] 1 [0 1] [~ 1]
      [~ 0] 3 [0 3] [~ 3]
      [~ 0] 2 [0 2] [~ 2]
      >*2
  - .scale: _C4:minor
  - .sound: gm_synth_strings_1

  - sound: _bd*2, ~ <sd cp>, [~ hh]*2
  - .bank: RolandTR909
```

This is starting to sound like actual music! We have sounds, we have notes, now the last piece of the puzzle is missing: [effects](#first-effects)

---

# First Effects

We have sounds, we have notes, now let's look at effects!

## Some basic effects

**low-pass filter**

```yml
- note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
- .sound: sawtooth
- .lpf: 800
```

> lpf = **l**ow **p**ass **f**ilter
>
> - Change lpf to 200. Notice how it gets muffled. Think of it as standing in front of the club with the door closed 🚪.
> - Now let's open the door... change it to 5000. Notice how it gets brighter ✨🪩

**pattern the filter**

```yml
- note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
- .sound: sawtooth
- .lpf: _200 1000
```

> - Try adding more values
> - Notice how the pattern in lpf does not change the overall rhythm
>
> We will learn how to automate with waves later...

**vowel**

```yml
- note: _<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>/2
- .sound: sawtooth
- .vowel: _<a e i o>/2
```

**gain**

```yml
- stack:
  - sound: _hh*8
  - .gain: _[.25 1]*2

  - sound: _bd*2,~ sd:1
```

> Rhythm is all about dynamics!
>
> - Remove `.gain(...)` and notice how flat it sounds.
> - Bring it back by undoing (ctrl+z)

**stacks within stacks**

Let's combine all of the above into a little tune:

```yml
- stack:
  - stack:
    - sound: _hh*8
    - .gain: _[.25 1]*2
    - sound: _bd*2,~ sd:1

  - note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
  - .sound: sawtooth
  - .lpf: _200 1000

  - note: _<[c3,g3,e4] [bb2,f3,d4] [a2,f3,c4] [bb2,g3,eb4]>/2
  - .sound: sawtooth
  - .vowel: _<a e i o>/2
```

> Try to identify the individual parts of the stacks, pay attention to where the commas are.
> The 3 parts (drums, bassline, chords) are exactly as earlier, just stacked together, separated by comma.

**shape the sound with an adsr envelope**

```yml
- note: _<c3 bb2 f3 eb3>
- .sound: sawtooth
- .lpf: 600
- .attack: .1
- .decay: .1
- .sustain: .25
- .release: .2
```

> Try to find out what the numbers do... Compare the following
>
> - attack: `.5` vs `0`
> - decay: `.5` vs `0`
> - sustain: `1` vs `.25` vs `0`
> - release: `0` vs `.5` vs `1`
>
> Can you guess what they do?
>
> ---
>
> - attack: time it takes to fade in
> - decay: time it takes to fade to sustain
> - sustain: level after decay
> - release: time it takes to fade out after note is finished
> 
> ![ADSR](../images/adsr.png)

**adsr short notation**

```yml
- note: _<c3 bb2 f3 eb3>
- .sound: sawtooth
- .lpf: 600
- .adsr: _.1:.1:.5:.2
```

**delay**

```yml
- stack:
  - note: _~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]
  - .sound: gm_electric_guitar_muted

  - sound: _<bd rim>
  - .bank: RolandTR707
- .delay: _.5
```

> Try some `delay` values between 0 and 1. Btw, `.5` is short for `0.5`
>
> What happens if you use `.delay: _.8:.125` ? Can you guess what the second number does?
>
> What happens if you use `.delay: _.8:.06:.8` ? Can you guess what the third number does?
>
> ---
>
> `delay: _a:b:c`:
>
> - a: delay volume
> - b: delay time
> - c: feedback (smaller number = quicker fade)

**room aka reverb**

```yml
- n: _<4 [3@3 4] [<2 0> ~@16] ~>/2
- .scale: _D4:minor
- .sound: _gm_accordion:2
- .room: 2
```

> Try different values!
>
> Add a delay too!

**little dub tune**

```yml
- stack:
  - note: _~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]
  - .sound: gm_electric_guitar_muted
  - .delay: .5

  - sound: _<bd rim>
  - .bank: RolandTR707
  - .delay: .5

  - n: _<4 [3@3 4] [<2 0> ~@16] ~>/2
  - .scale: _D4:minor
  - .sound: _gm_accordion:2
  - .room: 2
  - .gain: .5
```

Let's add a bass to make this complete:

```yml
- stack:
  - note: _~ [<[d3,a3,f4]!2 [d3,bb3,g4]!2> ~]
  - .sound: gm_electric_guitar_muted
  - .delay: .5

  - sound: _<bd rim>
  - .bank: RolandTR707
  - .delay: .5

  - n: _<4 [3@3 4] [<2 0> ~@16] ~>/2
  - .scale: _D4:minor
  - .sound: _gm_accordion:2
  - .room: 2
  - .gain: .4

  - n: _<0 [~ 0] 4 [3 2] [0 ~] [0 ~] <0 2> ~>*2
  - .scale: _D2:minor
  - .sound: _sawtooth,triangle
  - .lpf: 800
```

> Try adding `.hush()` at the end of one of the patterns in the stack...

**pan**

```yml
- sound: _numbers:1 numbers:2 numbers:3 numbers:4
- .pan: _0 0.3 .6 1
- .slow: 2
```

**speed**

```yml
- sound: _bd rim
- .speed: _<1 2 -1 -2>
- .room: .2
```

**fast and slow**

We can use `fast` and `slow` to change the tempo of a pattern outside of Mini-Notation:

```yml
- sound: _bd*2,~ rim
- .slow: 2
```

> Change the `slow` value. Try replacing it with `fast`.
>
> What happens if you use a pattern like `.fast("<1 [2 4]>")`?

By the way, inside Mini-Notation, `fast` is `*` and `slow` is `/`.

```yml
- sound: _[bd*2,~ rim]*<1 [2 4]>
```

## automation with signals

Instead of changing values stepwise, we can also control them with signals:

```yml
- sound: _hh*16
- .gain:
  - Sine:
```

Note that on Jaffle, signals are written with a capital first letter.

> The basic waveforms for signals are `Sine`, `Saw`, `Square`, `Tri` 🌊.
>
> Try also random signals `Rand` and `Perlin`!
>
> The gain is visualized as transparency in the pianoroll.

**setting a range**

By default, waves oscillate between 0 to 1. We can change that with `range`:

```yml
- sound: _hh*8
- .lpf:
  - Saw:
  - .range: [500, 2000]
```

> What happens if you flip the range values?

We can change the automation speed with slow / fast:

```yml
- note: _<[c2 c3]*4 [bb1 bb2]*4 [f2 f3]*4 [eb2 eb3]*4>/2
- .sound: sawtooth
- .lpf:
  - Sine:
  - .range: [100, 2000]
  - .slow: 8
```

> The whole automation will now take 8 cycles to repeat.

## Recap

| name  | example                                                  |
| ----- | -------------------------------------------------------- |
| lpf   | `[ note: _c2 c3, .s: sawtooth, .lpf: _<400 2000> ]`      |
| vowel | `[ note: _c3 eb3 g3, .s: sawtooth, .vowel: _<a e i o> ]` |
| gain  | `[ s: _hh*8, .gain: '_[.25 1]*2' ]`                      |
| delay | `[ s: _bd rim, .delay: .5 ]`                             |
| room  | `[ s: _bd rim, .room: .5 ]`                              |
| pan   | `[ s: _bd rim, .pan: _0 1 ]`                             |
| speed | `[ s: _bd rim, .speed: _<1 2 -1 -2> ]`                   |
| range | `[ s: _hh*16, .lpf: [ Saw: , .range: [200, 4000] ] ]`    |

Let us now take a look at some of Tidal's typical [pattern effects](/workshop/pattern-effects).

# Pattern Effects

Up until now, most of the functions we've seen are what other music programs are typically capable of: sequencing sounds, playing notes, controlling effects.

In this chapter, we are going to look at functions that are more unique to tidal.

**reverse patterns with rev**

```yml
- n: _0 1 [4 3] 2
- .sound: jazz
- .rev:
```

**play pattern left and modify it right with jux**

```yml
- n: _0 1 [4 3] 2
- .sound: jazz
- .jux: [ rev: ]
```

This is the same as:

```yml
- stack:
  - n: _0 1 [4 3] 2
  - .sound: jazz
  - .pan: 0

  - n: _0 1 [4 3] 2
  - .sound: jazz
  - .pan: 1
  - .rev:
```

Let's visualize what happens here:

```yml
- stack:

  - n: _0 1 [4 3] 2
  - .sound: jazz
  - .pan: 0
  - .color: cyan

  - n: _0 1 [4 3] 2
  - .sound: jazz
  - .pan: 1
  - .color: majenta
  - .rev:
```

> Try commenting out one of the two by adding `#` before each line of a block

**multiple tempos**

```yml
- note: _c2, eb3 g3 [bb3 c4]
- .sound: piano
- .slow: _1,2,3
```

This is like doing

```yml
- stack:
  - note: _c2, eb3 g3 [bb3 c4]
  - .s: piano
  - .slow: 1
  - .color: cyan

  - note: _c2, eb3 g3 [bb3 c4]
  - .s: piano
  - .slow: 2
  - .color: magenta

  - note: _c2, eb3 g3 [bb3 c4]
  - .s: piano
  - .slow: 3
  - .color: yellow
```

> Try commenting out one or more by adding `#` before each line of a block

**add**

```yml
- note:
  - _c2 [eb3,g3]
  - .add: _<0 <1 -1>>
- .color: _<cyan <magenta yellow>>
- .adsr: _[.1 0]:.2:[1 0]
- .sound: _gm_acoustic_bass
- .room: .5
```

> If you add a number to a note, the note will be treated as if it was a number

We can add as often as we like:

```yml
- note:
  - _c2 [eb3,g3]
  - .add: _<0 <1 -1>>
- .add: _0,7
- .color: _<cyan <magenta yellow>>
- .adsr: _[.1 0]:.2:[1 0]
- .sound: gm_acoustic_bass
- .room: .5
```

**add with scale**

```yml
- n:
  - _<0 [2 4] <3 5> [~ <4 1>]>*2
  - .add: _<0 [0,2,4]>/4
- .scale: _C5:minor
- .release: .5
- .sound: gm_xylophone
- .room: .5
```

**time to stack**

```yml
- stack:
  - n:
    - _<0 [2 4] <3 5> [~ <4 1>]>*2
    - .add: _<0 [0,2,4]>/4
  - .scale: _C5:minor
  - .sound: gm_xylophone
  - .room: .4
  - .delay: .125

  - note:
    - _c2 [eb3,g3]
    - .add: _<0 <1 -1>>
  - .adsr: _[.1 0]:.2:[1 0]
  - .sound: gm_acoustic_bass
  - .room: .5

  - n: _0 1 [2 3] 2
  - .sound: jazz
  - .jux: [ rev: ]
  - .slow: 2
```

**ply**

```yml
- sound: _hh, bd rim
- .bank: RolandTR707
- .ply: 2
```

this is like writing:

```yml
- sound: _hh*2, bd*2 rim*2
- .bank: RolandTR707
```

> Try patterning the `ply` function, for example using `_<1 2 1 3>`

**off**

```yml
- n:
  - _<0 [4 <3 2>] <2 3> [~ 1]>
  - .off: [ =1/8, set: , .add: 4 ]
# - .off: [ =1/4, set: , .add: 7 ]
- .scale: _<C5:minor Db5:mixolydian>/4
- .s: triangle
- .room: .5
- .ds: _.1:0
- .delay: .5
```

`off` is also useful for sounds:

```yml
- s: _bd sd,[~ hh]*2
- .bank: CasioRZ1
- .off: [ =1/8, [ set: , .speed: 1.5, .gain: .25 ] ]
```

| name | description                    | example                                                   |
| ---- | ------------------------------ | --------------------------------------------------------- |
| rev  | reverse                        | `[ n: _0 2 4 6, .scale: _C:minor, .rev: ]`                |
| jux  | split left/right, modify right | `[ n: _0 2 4 6, .scale: _C:minor, .jux: [ rev: ] ]`       |
| add  | add numbers / notes            | `[ n: [ _0 2 4 6, .add: _<0 1 2 1> ], .scale: _C:minor ]` |
| ply  | speed up each event n times    | `[ s: _bd sd, .ply: _<1 2 3> ]`                           |
| off  | copy, shift time & modify      | `[ s: '_bd sd, hh*4', .off: [ =1/8, set: , .speed: 2 ] ]` |

# Workshop Recap

This part is just a listing of all functions covered in the workshop!

## Mini Notation

| Concept           | Syntax    | Example                             |
| ----------------- | --------- | ----------------------------------- |
| Sequence          | *space*   | `- sound: _bd bd sd hh`             |
| Sample Number     | `:x`      | `- sound: _hh:0 hh:1 hh:2 hh:3`     |
| Rests             | `~`       | `- sound: _metal ~ jazz jazz:1`     |
| Sub-Sequences     | `[`, `]`  | `- sound: _bd wind [metal jazz] hh` |
| Sub-Sub-Sequences | `[[`, `]]`| `- sound: _bd [metal [jazz sd]]`    |
| Speed up          | `*`       | `- sound: _bd sd*2 cp*3`            |
| Parallel          | `,`       | `- sound: _bd*2, hh*2 [hh oh]`      |
| Slow down         | `/`       | `- note: _[c a f e]/2`              |
| Alternate         | `<`, `>`  | `- note: _c <e g>`                  |
| Elongate          | `@`       | `- note: _c@3 e`                    |
| Replicate         | `!`       | `- note: _c!3 e`                    |

## Sounds

| Name  | Description                       | Example                                 |
| ----- | --------------------------------- | --------------------------------------- |
| sound | plays the sound of the given name | `[ sound: _bd sd ]`                     |
| bank  | selects the sound bank            | `[ sound: _bd sd, .bank: RolandTR909 ]` |
| n     | select sample number              | `[ n: _0 1 4 2, .sound: jazz ]`         |

## Notes

| Name      | Description                   | Example                                            |
| --------- | ----------------------------- | -------------------------------------------------- |
| note      | set pitch as number or letter | `[ note: _b g e c, .sound: piano ]`                |
| n + scale | set note in scale             | `[ n: _6 4 2 0, .scale: _C:minor, .sound: piano ]` |
| stack     | play patterns in parallel     | `[ stack: [ s: _bd sd, note: _c eb g ] ]`          |

## Audio Effects

| name  | example                                                  |
| ----- | -------------------------------------------------------- |
| lpf   | `[ note: _c2 c3, .s: sawtooth, .lpf: _<400 2000> ]`      |
| vowel | `[ note: _c3 eb3 g3, .s: sawtooth, .vowel: _<a e i o> ]` |
| gain  | `[ s: _hh*8, .gain: '_[.25 1]*2' ]`                      |
| delay | `[ s: _bd rim, .delay: .5 ]`                             |
| room  | `[ s: _bd rim, .room: .5 ]`                              |
| pan   | `[ s: _bd rim, .pan: _0 1 ]`                             |
| speed | `[ s: _bd rim, .speed: _<1 2 -1 -2> ]`                   |
| range | `[ s: _hh*16, .lpf: [Saw: , .range: [200, 4000] ] ]`     |

## Pattern Effects

| name | description                         | example                                                   |
| ---- | ----------------------------------- | --------------------------------------------------------- |
| cpm  | sets the tempo in cycles per minute | `[ sound: _bd sd, .cpm: 90 ]`                             |
| fast | speed up                            | `[ sound: _bd sd, .fast: 2 ]`                             |
| slow | slow down                           | `[ sound: _bd sd, .slow: 2 ]`                             |
| rev  | reverse                             | `[ n: _0 2 4 6, .scale: _C:minor, .rev: ]`                |
| jux  | split left/right, modify right      | `[ n: _0 2 4 6, .scale: _C:minor, .jux: [ rev: ] ]`       |
| add  | add numbers / notes                 | `[ n: [ _0 2 4 6, .add: _<0 1 2 1> ], .scale: _C:minor ]` |
| ply  | speed up each event n times         | `[ s: _bd sd, .ply: _<1 2 3> ]`                           |
| off  | copy, shift time & modify           | `[ s: '_bd sd, hh*4', .off: [ =1/8, set: , .speed: 2 ] ]` |
