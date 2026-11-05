// Spaces. The section is taller than the screen; its layers (the Hero gradient with the speaker,
// the title, the cards) are fixed to the screen and clipped by the section (spaces.css).
// Coming in from Why Us 04 it covers the screen like a mask while the speaker turns back
// (hero-rotate-light backwards) at three screen widths, the Hero speaker's size, scrubbed to the
// scroll; once the section is reached the canvas makes way for the Hero speaker image.
// Then the title comes in letter by letter like the second screen's (played by the navigation in
// src/animations/scenes.js), and from there the page scrolls freely: the title goes up with the
// page, the cards come in from the right and move on sideways (see the cards below).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { SPACES } from './config.js'
import { lettersTimeline, lineHeightOf, spreadGradient } from './letters.js'
import { createStage } from './sequences.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const ROTATE_LIGHT = 'hero-rotate-light'

const titleTimeline = (title) => {
  const lines = [...title.querySelectorAll('.spaces__title-line')]
  const groups = lines.map((line) => SplitText.create(line, { type: 'words, chars', charsClass: 'split-char' }).chars)
  lines.forEach((line, i) => {
    if (line.classList.contains('text-gradient')) spreadGradient(line, groups[i])
  })
  gsap.set(title, { visibility: 'visible' })
  return lettersTimeline(groups, lineHeightOf(title), { ...SPACES.title, delay: 0 })
}

export function initSpaces(reducedMotion) {
  const section = document.querySelector('.spaces')
  if (!section) return null

  const canvas = section.querySelector('.spaces__rotate')
  const heading = section.querySelector('.spaces__heading')
  const title = section.querySelector('.spaces__title')
  const rail = section.querySelector('.spaces__rail')
  const cards = [...section.querySelectorAll('.spaces__item')]
  const stage = canvas && createStage(canvas)

  // Row layout (px), measured on refresh: where the row starts (the rail's padding), the step
  // from one card to the next, and the card width. Layout offsets, so the transforms don't count
  const row = { left: 0, slot: 0, width: 0 }
  const measure = () => {
    if (!rail || !cards.length) return
    row.left = parseFloat(getComputedStyle(rail).paddingLeft) || 0
    row.width = cards[0].offsetWidth
    row.slot = cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : row.width
  }
  // Scroll distance (px) until the row is in place: the first card comes in from the right edge
  const enter = () => window.innerWidth - row.left
  // Then on until the last card ends where the title box would end
  const travel = () => Math.max(0, row.slot * (cards.length - 1) + row.width - (window.innerWidth - row.left * 2))
  const distance = () => enter() + travel()

  // Tall enough for that, on top of the screen it covers when reached
  const setHeight = () => {
    measure()
    section.style.height = `${window.innerHeight + distance()}px`
  }
  setHeight()
  ScrollTrigger.addEventListener('refreshInit', setHeight)

  // Coming in: the speaker turns back at its full size, scrubbed to the section's way up the screen
  const turn = { progress: 1 }
  const showTurn = () => {
    const turning = turn.progress > 0
    section.classList.toggle('is-rotating', turning)
    stage?.show(turning ? [{ name: ROTATE_LIGHT, progress: turn.progress }] : [])
  }
  showTurn()
  gsap.fromTo(
    turn,
    { progress: 1 },
    {
      progress: 0,
      ease: 'none',
      onUpdate: showTurn,
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'top top', scrub: true },
    },
  )

  // Once reached, the title goes up with the scroll, one screen height
  if (heading) {
    gsap.fromTo(
      heading,
      { y: 0 },
      {
        y: () => -window.innerHeight,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => `top top-=${window.innerHeight}`,
          scrub: true,
          invalidateOnRefresh: true,
        },
      },
    )
  }

  // Cards: the row moves left with the scroll, from just off the right edge. Past the right edge
  // of the content (where the title box would end) the gaps open up with the distance beyond it,
  // so off-screen cards come in SPACES.startGap times the design's gap apart and close up as they
  // come in. Each card follows its place with inertia; the closer to the side the row moves
  // towards, the faster, so the row stretches while it moves and closes up once the scroll stops
  const { follow, slowdown, minGap } = SPACES.inertia
  const placed = cards.map(() => null)
  const setters = cards.map((card) => gsap.quickSetter(card, 'x', 'px'))

  const targetOf = (i, scrolled) => {
    const shift = enter() - scrolled
    const at = row.left + row.slot * i + shift
    const edge = window.innerWidth - row.left
    const gap = row.slot - row.width
    return shift + (gap * (SPACES.startGap - 1) * Math.max(0, at - edge)) / row.slot
  }

  const update = () => {
    const scrolled = gsap.utils.clamp(0, distance(), window.scrollY - section.offsetTop)
    const frames = gsap.ticker.deltaRatio(60)
    const gap = row.slot - row.width
    cards.forEach((card, i) => {
      const target = targetOf(i, scrolled)
      let x = placed[i]
      // First frame (or after a layout change left nothing usable): straight to its place
      if (!Number.isFinite(x) || reducedMotion) x = target
      else {
        // Where the card is on the screen, 0 at the side it moves towards, 1 at the other
        const screen = gsap.utils.clamp(0, 1, (row.left + row.slot * i + x) / window.innerWidth)
        const behind = target < x ? screen : 1 - screen
        const rate = follow * (1 - slowdown * behind)
        x += (target - x) * (1 - Math.pow(1 - rate, frames))
      }
      // Never closer to the card before than half the design's gap
      if (i > 0) x = Math.max(x, placed[i - 1] - gap * (1 - minGap))
      placed[i] = x
      setters[i](x)
    })
  }
  update()
  ScrollTrigger.addEventListener('refresh', update)

  // Runs while the section is on the screen
  const inView = ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top' })
  gsap.ticker.add(() => inView.isActive && update())

  // Paused, for the navigation; filled once the fonts are ready (letters are measured)
  const intro = reducedMotion ? null : gsap.timeline({ paused: true })
  if (intro && title) document.fonts.ready.then(() => intro.add(titleTimeline(title), 0))

  return { section, intro }
}
