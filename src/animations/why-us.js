// Why Us 01–04.
// On the way from the second screen to Why Us 01 the stage speaker turns into an image sequence
// of the speaker turning (hero-rotate-light), scrubbed to the scroll (src/animations/scenes.js
// drives it and grows the speaker). Why Us 01 holds a copy fixed to the screen: the dark background
// and the same turn in dark (hero-rotate-dark), drawn at the same frame in the same place. The
// section clips it, so as the section rises over the stage the dark scene is revealed like a mask.
// Once Why Us 01 is reached that copy goes and the section's own sequence (why-us-01) loops; the
// turn comes back as soon as the page moves up again.
// Every section's background is its sequence (data-sequence), looping while the section is in view.
// Background and content are fixed to the screen and clipped by the section (why-us.css), so the
// next section covers the current one like a mask. The content block moves with a parallax,
// scrubbed: it comes up from below while its section comes in and rises while it leaves.
// Intro, once the glide into a section is WHY_US.arriveAt through (played by the navigation in
// src/animations/scenes.js, backwards when leaving upwards): the icon circle fades in and rises,
// the title comes in letter by letter like the Hero title, the text like the Hero paragraph, and
// the link like "Find My Sound": it fades in and rises, opens from a circle on the left, its label
// comes in like the texts and its arrow turns to point right.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { WHY_US } from './config.js'
import { lettersTimeline, lineHeightOf, lineRiseTimeline } from './letters.js'
import { createStage, preloadSequences, sequenceLength } from './sequences.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const ROTATE_LIGHT = 'hero-rotate-light'
const ROTATE_DARK = 'hero-rotate-dark'

// A section's looping background; reduced motion shows its first frame only
const createLoop = (section, reducedMotion) => {
  const canvas = section.querySelector('.why__loop')
  const name = section.dataset.sequence
  const length = sequenceLength(name)
  if (!canvas || !length) return null

  const stage = createStage(canvas)
  const state = { frame: 0 }
  const show = () => stage.show([{ name, frame: Math.floor(state.frame) % length }])
  const tween = gsap.to(state, {
    frame: length,
    duration: length / WHY_US.loop.fps,
    ease: 'none',
    repeat: -1,
    paused: true,
    onUpdate: show,
  })

  return {
    play: () => (reducedMotion ? show() : tween.play()),
    pause: () => tween.pause(),
    // From the first frame: it continues the turn
    restart: () => {
      tween.pause(0)
      show()
      if (!reducedMotion) tween.play()
    },
  }
}

// Scrubbed over the section's way across the screen: from one screen below to one screen above
const parallax = (section) => {
  const panel = section.querySelector('.why__panel')
  if (!panel) return
  const offset = () => WHY_US.parallax * section.offsetHeight
  gsap
    .timeline({
      defaults: { ease: 'none', duration: 1 },
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
    })
    .fromTo(panel, { y: offset }, { y: 0 })
    .to(panel, { y: () => -offset() })
}

// Lines of a split text: letters grouped by line
const linesOf = (split) => split.lines.map((line) => split.chars.filter((char) => line.contains(char)))

// Duration of a one-line WHY_US.text run with this many letters
const lineSpan = (letters, { duration, stagger }) => duration + stagger * Math.max(0, letters - 1)

// Paused intro of a section; filled once the fonts are ready (texts are measured)
const createIntro = (section) => {
  const intro = gsap.timeline({ paused: true })
  const { icon: iconVars, title: titleVars, text: textVars, button } = WHY_US

  document.fonts.ready.then(() => {
    const icon = section.querySelector('.why__icon-area')
    if (icon) {
      intro.fromTo(
        icon,
        { opacity: 0, y: textVars.fromY * lineHeightOf(section.querySelector('.why__text') ?? icon) },
        { opacity: 1, y: 0, duration: iconVars.duration, ease: textVars.ease },
        0,
      )
    }

    const title = section.querySelector('.why__title')
    if (title) {
      const split = SplitText.create(title, { type: 'lines, words, chars', charsClass: 'split-char' })
      intro.add(lettersTimeline(linesOf(split), lineHeightOf(title), { ...titleVars, delay: 0 }), 0)
      gsap.set(title, { visibility: 'visible' })
    }

    const text = section.querySelector('.why__text')
    if (text) {
      const split = SplitText.create(text, { type: 'lines, words, chars', charsClass: 'split-char' })
      const groups = split.lines.map((line, i) => ({ line, items: linesOf(split)[i] }))
      intro.add(lineRiseTimeline(groups, lineHeightOf(text), { ...textVars, delay: 0 }), 0)
      gsap.set(text, { visibility: 'visible' })
    }

    const link = section.querySelector('.why__link')
    if (link) {
      const body = link.querySelector('.why__link-body')
      const label = link.querySelector('.why__link-label')
      const arrow = link.querySelector('.why__link-icon')
      const { width, height } = link.getBoundingClientRect()
      // Collapsed: only a circle as wide as the link is tall shows on the left
      const collapse = width - height
      const span = lineSpan(label.textContent.replace(/\s/g, '').length, textVars)
      const expandAt = span * button.expand.at
      const expandVars = { duration: button.expand.duration, ease: button.ease }

      intro.fromTo(link, { opacity: 0, y: button.fromY * height }, { opacity: 1, y: 0, duration: span, ease: button.ease }, 0)
      intro.fromTo(body, { x: -collapse }, { x: 0, ...expandVars }, expandAt)
      // The label holds still while the pill slides under it
      intro.fromTo(label, { x: collapse }, { x: 0, ...expandVars }, expandAt)
      intro.fromTo(arrow, { rotation: button.iconFromRotation }, { rotation: 0, ...expandVars }, expandAt)
      const split = SplitText.create(label, { type: 'words, chars', charsClass: 'split-char' })
      intro.add(lineRiseTimeline([{ line: label, items: split.chars }], lineHeightOf(label), { ...textVars, delay: 0 }), expandAt)
    }
  })

  return intro
}

// Returns the turn (draws both copies at a 0–1 progress), the dark copy's box to move along with
// the stage speaker, and the sections
export function initWhyUs(reducedMotion) {
  const sections = [...document.querySelectorAll('.why')]
  if (!sections.length) return null

  const [first] = sections
  const stage = document.querySelector('.stage--speaker')
  const light = document.querySelector('.stage__rotate')
  const dark = first.querySelector('.why__rotate')
  const lightStage = light && createStage(light)
  const darkStage = dark && createStage(dark)

  // Each section's intro, for the navigation
  const intros = reducedMotion ? [] : sections.map(createIntro)
  if (!reducedMotion) sections.forEach(parallax)

  sections.forEach((section, index) => {
    const loop = createLoop(section, reducedMotion)
    if (!loop) return

    // Frames load one screen ahead of the section
    ScrollTrigger.create({
      trigger: section,
      start: 'top bottom+=100%',
      once: true,
      onEnter: () => preloadSequences([section.dataset.sequence]),
    })

    if (index === 0) {
      // Reached (1px early, the glide may stop a fraction short): the copy goes, the loop starts
      ScrollTrigger.create({
        trigger: section,
        start: 'top top+=1',
        end: 'bottom top',
        onEnter: () => {
          section.classList.add('is-reached')
          loop.restart()
        },
        onLeaveBack: () => {
          section.classList.remove('is-reached')
          loop.pause()
        },
        onLeave: loop.pause,
        onEnterBack: loop.play,
      })
    } else {
      ScrollTrigger.create({
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
      })
    }
  })

  // The turn is needed right after the second screen
  const preloadTurn = () => preloadSequences([ROTATE_LIGHT, ROTATE_DARK])
  if (document.readyState === 'complete') preloadTurn()
  else window.addEventListener('load', preloadTurn, { once: true })

  return {
    sections,
    intros,
    wrap: first.querySelector('.why__rotate-wrap'),
    turn: (progress) => {
      // The light turn replaces the speaker image as soon as it starts
      stage?.classList.toggle('is-rotating', progress > 0)
      lightStage?.show(progress > 0 ? [{ name: ROTATE_LIGHT, progress }] : [])
      darkStage?.show([{ name: ROTATE_DARK, progress }])
    },
  }
}
