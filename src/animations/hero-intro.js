// Hero intro on page load. The speaker rises at once; the texts and divider start together once
// the fonts are ready.
// Title: split into letters, each rises from HERO_TITLE.fromY line heights below and fades in,
// one after another. The second line starts once the first is nextLineAt through. The accent
// line's gradient is re-applied per letter, because background-clip: text on the line does not
// paint children that get their own transform layer.
// Divider: grows from 0 to full width (scaleX, from the left).
// Tagline and paragraph (HERO_TEXT): letters fade in one by one, while each whole line rises one
// line height for as long as its letters take. The tagline's blue dot fades first; the paragraph's
// lines overlap like the title's.
// Hint "Scroll Down to Explore": like the paragraph.
// "Find My Sound" (HERO_BUTTON): fades in and rises like the hint's line, then opens from a circle
// on the left to full width (the pill slides out from under the left cap), the label comes in
// like the texts and the arrow turns to point down.
// RHAON III card (HERO_PROMO): mask reveal left to right, the photo under its own mask slides in
// from the left, the text fades in and stays attached to the photo's right edge.

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { lettersTimeline, lineHeightOf, lineRiseTimeline, spreadGradient } from './letters.js'
import {
  HERO_BUTTON,
  HERO_DIVIDER,
  HERO_PROMO,
  HERO_SPEAKER,
  HERO_TEXT,
  HERO_TITLE,
  REDUCED_MOTION_QUERY,
} from './config.js'

gsap.registerPlugin(SplitText)


const initTitle = (title) => {
  const accent = title.querySelector('.hero__title-line--accent')
  const lines = [...title.querySelectorAll('.hero__title-line')]

  SplitText.create(lines, {
    type: 'words, chars',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self) {
      if (accent) spreadGradient(accent, self.chars.filter((char) => accent.contains(char)))
      gsap.set(title, { visibility: 'visible' })
      const groups = lines.map((line) => self.chars.filter((char) => line.contains(char)))
      // Returned so a re-split on resize keeps the animation's progress
      return lettersTimeline(groups, lineHeightOf(lines[0]), HERO_TITLE)
    },
  })
}

const initTagline = (tagline) => {
  const dot = tagline.querySelector('.hero__tagline-dot')
  const label = tagline.querySelector('.hero__tagline-text')
  if (!label) return

  SplitText.create(label, {
    type: 'words, chars',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self) {
      gsap.set(tagline, { visibility: 'visible' })
      // One line: the dot first, then the letters; the whole tagline rises
      const items = dot ? [dot, ...self.chars] : self.chars
      return lineRiseTimeline([{ line: tagline, items }], lineHeightOf(tagline), HERO_TEXT)
    },
  })
}

// Paragraph-style text: letters fade one by one, each line rises as a whole
const initLineText = (text) => {
  SplitText.create(text, {
    type: 'lines, words, chars',
    charsClass: 'split-char',
    autoSplit: true,
    onSplit(self) {
      gsap.set(text, { visibility: 'visible' })
      const groups = self.lines.map((line) => ({
        line,
        items: self.chars.filter((char) => line.contains(char)),
      }))
      return lineRiseTimeline(groups, lineHeightOf(text), HERO_TEXT)
    },
  })
}

// Duration of a one-line HERO_TEXT run with this many letters
const lineSpan = (letters, { duration, stagger }) => duration + stagger * Math.max(0, letters - 1)

const initButton = (button, hint) => {
  const body = button.querySelector('.hero__button-body')
  const label = button.querySelector('.hero__button-label')
  const icon = button.querySelector('.hero__button-icon')
  const { fromY, expand, iconFromRotation, ease } = HERO_BUTTON

  // Fade and rise last as long as the hint's line
  const hintLetters = hint ? hint.textContent.replace(/\s/g, '').length : 0
  const span = lineSpan(hintLetters, HERO_TEXT)
  const expandAt = span * expand.at

  const { width, height } = button.getBoundingClientRect()
  // Collapsed: only a circle as wide as the button is tall shows on the left
  const collapse = width - height
  const expandVars = { duration: expand.duration, ease }

  const tl = gsap.timeline({ delay: HERO_TEXT.delay })
  tl.fromTo(button, { opacity: 0, y: fromY * height }, { opacity: 1, y: 0, duration: span, ease }, 0)
  tl.fromTo(body, { x: -collapse }, { x: 0, ...expandVars }, expandAt)
  // The label holds still while the pill slides under it
  tl.fromTo(label, { x: collapse }, { x: 0, ...expandVars }, expandAt)
  tl.fromTo(icon, { rotation: iconFromRotation }, { rotation: 0, ...expandVars }, expandAt)

  SplitText.create(label, {
    type: 'words, chars',
    charsClass: 'split-char',
    onSplit(self) {
      tl.add(
        lineRiseTimeline([{ line: label, items: self.chars }], lineHeightOf(label), { ...HERO_TEXT, delay: 0 }),
        expandAt,
      )
    },
  })
}

// Mask reveal with transforms only: the mask slides in from the left, its inner layer slides
// the opposite way by the same amount, so the content holds still while it is uncovered
const revealFromLeft = (tl, mask, inner, vars, position) => {
  // x: 0 drops the CSS pre-hide offset, which GSAP would otherwise read in as px on top of xPercent
  tl.fromTo(mask, { x: 0, xPercent: -100 }, { xPercent: 0, ...vars }, position)
  tl.fromTo(inner, { xPercent: 100 }, { xPercent: 0, ...vars }, position)
}

const initPromo = (promo) => {
  const { card, photo, text, ease } = HERO_PROMO
  const tl = gsap.timeline({ delay: HERO_TITLE.delay })

  tl.fromTo(promo, { opacity: 0 }, { opacity: 1, duration: card.duration, ease }, 0)
  revealFromLeft(tl, promo.querySelector('.hero__promo-mask'), promo.querySelector('.hero__promo-card'), {
    duration: card.duration,
    ease,
  }, 0)

  const mediaVars = { duration: photo.duration, ease }
  revealFromLeft(
    tl,
    promo.querySelector('.hero__promo-media-mask'),
    promo.querySelector('.hero__promo-media-inner'),
    mediaVars,
    photo.delay,
  )
  tl.fromTo(
    promo.querySelector('.hero__promo-img'),
    { xPercent: -photo.fromX * 100 },
    { xPercent: 0, ...mediaVars },
    photo.delay,
  )

  // The text rides on the photo's right edge while the photo mask opens
  const content = promo.querySelector('.hero__promo-content')
  const mediaWidth = promo.querySelector('.hero__promo-media').offsetWidth
  tl.fromTo(content, { x: -mediaWidth }, { x: 0, ...mediaVars }, photo.delay)

  tl.fromTo(
    content,
    { opacity: 0 },
    { opacity: 1, duration: text.duration, ease },
    text.delay,
  )
}

export async function initHeroIntro() {
  const hero = document.querySelector('.hero')
  if (!hero || window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  const speaker = document.querySelector('.stage__speaker')
  if (speaker) {
    gsap.fromTo(
      speaker,
      { y: () => HERO_SPEAKER.fromY * window.innerHeight },
      { y: 0, duration: HERO_SPEAKER.duration, ease: HERO_SPEAKER.ease },
    )
  }

  await document.fonts.ready

  const divider = hero.querySelector('.hero__divider')
  if (divider) {
    gsap.fromTo(
      divider,
      { scaleX: 0 },
      { scaleX: 1, duration: HERO_DIVIDER.duration, ease: HERO_DIVIDER.ease, delay: HERO_TITLE.delay },
    )
  }

  const title = hero.querySelector('.hero__title')
  const tagline = hero.querySelector('.hero__tagline')
  const text = hero.querySelector('.hero__text')
  const hint = hero.querySelector('.hero__hint')
  const button = hero.querySelector('.hero__button')
  if (title) initTitle(title)
  if (tagline) initTagline(tagline)
  if (text) initLineText(text)
  if (hint) initLineText(hint)
  if (button) initButton(button, hint)

  const promo = hero.querySelector('.hero__promo')
  if (promo) initPromo(promo)
}
