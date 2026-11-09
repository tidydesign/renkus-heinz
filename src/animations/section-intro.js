// Shared parts of the section intros

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { SCENE_START } from './config.js'
import { lettersTimeline, lineHeightOf, lineRiseTimeline, spreadGradient } from './letters.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Run a filled paused intro through once, so everything is in its start state before it plays,
// not only as each part's turn comes
export const primeIntro = (intro) => {
  if (!intro.isActive()) intro.progress(1).progress(0).pause()
}

// For freely scrolled sections: plays the intro when reached; going back up it leaves fast, like
// what leaves the scenes
export const playWhenReached = (intro, trigger, start) =>
  ScrollTrigger.create({
    trigger,
    start,
    onEnter: () => intro.timeScale(1).play(),
    onLeaveBack: () => {
      if (intro.time() > 0) intro.timeScale(intro.time() / (SCENE_START.scroll.duration * SCENE_START.leaveBy)).reverse()
    },
  })

// Section title of separate lines, for freely scrolled sections: comes in letter by letter when it
// rises into view. Settings: { title, titleStart }
export const initScrollTitle = (title, lineSelector, { title: vars, titleStart }) => {
  const intro = gsap.timeline({ paused: true })
  document.fonts.ready.then(() => {
    const lines = [...title.querySelectorAll(lineSelector)]
    const groups = lines.map((line) => SplitText.create(line, { type: 'words, chars', charsClass: 'split-char' }).chars)
    lines.forEach((line, i) => {
      if (line.classList.contains('text-gradient')) spreadGradient(line, groups[i])
    })
    gsap.set(title, { visibility: 'visible' })
    intro.add(lettersTimeline(groups, lineHeightOf(title), { ...vars, delay: 0 }), 0)
    primeIntro(intro)
  })
  playWhenReached(intro, title, titleStart)
}

// Duration of a one-line text run with this many letters
const lineSpan = (letters, { duration, stagger }) => duration + stagger * Math.max(0, letters - 1)

// Pill link, like "Find My Sound": fades in and rises, opens from a circle on the left, its label
// comes in like the texts and its arrow turns to point right. Added to the intro at its start
export const addLinkIntro = (intro, { link, body, label, arrow }, { button, text }) => {
  const { width, height } = link.getBoundingClientRect()
  // Collapsed: only a circle as wide as the link is tall shows on the left
  const collapse = width - height
  const span = lineSpan(label.textContent.replace(/\s/g, '').length, text)
  const expandAt = span * button.expand.at
  const expandVars = { duration: button.expand.duration, ease: button.ease }

  intro.fromTo(link, { opacity: 0, y: button.fromY * height }, { opacity: 1, y: 0, duration: span, ease: button.ease }, 0)
  intro.fromTo(body, { x: -collapse }, { x: 0, ...expandVars }, expandAt)
  // The label holds still while the pill slides under it
  intro.fromTo(label, { x: collapse }, { x: 0, ...expandVars }, expandAt)
  intro.fromTo(arrow, { rotation: button.iconFromRotation }, { rotation: 0, ...expandVars }, expandAt)
  const split = SplitText.create(label, { type: 'words, chars', charsClass: 'split-char' })
  intro.add(lineRiseTimeline([{ line: label, items: split.chars }], lineHeightOf(label), { ...text, delay: 0 }), expandAt)
}
