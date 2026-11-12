// Spaces. The section is taller than the screen; its layers (the Hero gradient with the
// backgrounds, the title, the cards) are fixed to the screen and clipped by the section (spaces.css).
// Coming in from Why Us 04 it covers the screen like a mask.
// Then the title comes in letter by letter like the second screen's (played by the navigation in
// src/animations/scenes.js), and from there the page scrolls freely: the title goes up with the
// page, the cards come in from the right and move on sideways until the last one is in the middle
// of the screen (see the cards below). Once the scroll stops, the navigation draws the card nearest
// to the middle there (snap); the background shows the space of the card in the middle, or of
// the hovered card while one is hovered (src/components/spaces-cards.js tells it by a spaces:hover event).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { SPACES, SPACES_BACKGROUND } from './config.js'
import { lettersTimeline, lineHeightOf, spreadGradient } from './letters.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

// Background picture URLs by space name (src/assets/images/spaces/<name>-bg.jpg), through Vite so
// the build includes them (file names are hashed there, so the pictures are found by data-space)
const BACKGROUNDS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/images/spaces/*-bg.jpg', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [path.split('/').pop().replace(/-bg\.jpg$/, ''), url]),
)

// The space of the card in the middle (or the hovered one) fills the background; none of them,
// no background. The pictures load once the section is a screen away. Returns a setter
// taking the card's data-space or null
const initBackgrounds = (section, reducedMotion) => {
  const images = [...section.querySelectorAll('.spaces__background')]
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom+=100%',
    once: true,
    onEnter: () =>
      images.forEach((img) => {
        const url = BACKGROUNDS[img.dataset.space]
        if (url) img.src = url
      }),
  })

  const { duration, ease } = SPACES_BACKGROUND
  return (space) =>
    images.forEach((img) => {
      const opacity = img.dataset.space === space ? 1 : 0
      gsap.to(img, { opacity, duration: reducedMotion ? 0 : duration, ease, overwrite: true })
    })
}

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

  const heading = section.querySelector('.spaces__heading')
  const title = section.querySelector('.spaces__title')
  const backdrop = section.querySelector('.spaces__backdrop')
  const items = [...section.querySelectorAll('.spaces__item')]
  const cards = items.map((item) => item.querySelector('.spaces__card'))
  const reveals = cards.map((card) => card?.querySelector('.spaces__reveal'))
  const setBackground = initBackgrounds(section, reducedMotion)

  // Row layout (px), measured on refresh: each card's left and top on the screen (the rail is fixed
  // at the screen's top left; layout offsets, so the transforms don't count) and the card width
  const row = { lefts: [], tops: [], width: 0, slot: 0 }
  const measure = () => {
    if (!cards.length) return
    row.lefts = items.map((item) => item.offsetLeft)
    // The cards only move sideways, so their screen top is their layout top
    row.tops = cards.map((card) => card.getBoundingClientRect().top)
    row.width = items[0].offsetWidth
    row.slot = cards.length > 1 ? row.lefts[1] - row.lefts[0] : row.width
    // The colour pictures in the cards are as large as the background
    if (backdrop) {
      section.style.setProperty('--spaces-view-width', `${backdrop.clientWidth}px`)
      section.style.setProperty('--spaces-view-height', `${backdrop.clientHeight}px`)
    }
    reveals.forEach((reveal, i) => reveal && gsap.set(reveal, { y: -row.tops[i] }))
  }
  // Scroll distance (px) until the row is in place: the first card comes in from the right edge
  const enter = () => window.innerWidth - (row.lefts[0] ?? 0)
  // Scroll (px, from the section top) at which card i is in the middle of the screen
  const centredAt = (i) => (window.innerWidth + row.width) / 2 + (row.lefts[i] ?? 0) - (row.lefts[0] ?? 0)
  // The cards move until the last one is in the middle
  const distance = () => (cards.length ? centredAt(cards.length - 1) : 0)

  // Tall enough for that, on top of the screen it covers when reached, plus a stretch at the end
  // where the cards hold still before the next section comes up
  const setHeight = () => {
    measure()
    section.style.height = `${window.innerHeight * (1 + SPACES.endHold) + distance()}px`
  }
  setHeight()
  ScrollTrigger.addEventListener('refreshInit', setHeight)

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

  // Cards: the row moves left with the scroll, from just off the right edge. Each card follows its
  // place with inertia; the closer to the side the row moves towards, the faster, so the row
  // stretches while it moves and closes up once the scroll stops
  const { follow, slowdown, minGap } = SPACES.inertia
  const placed = items.map(() => null)
  const setters = items.map((item) => gsap.quickSetter(item, 'x', 'px'))
  // The colour pictures move the other way, so they stay lined up with the background
  const revealSetters = reveals.map((reveal) => reveal && gsap.quickSetter(reveal, 'x', 'px'))
  // The spaces of the card in the middle and of the hovered card; the hovered one wins
  let centred = null
  let hovered = null
  let shown
  const showBackground = () => {
    const space = hovered ?? centred
    if (space === shown) return
    shown = space
    setBackground(space)
  }
  section.addEventListener('spaces:hover', (event) => {
    hovered = event.detail.space
    showBackground()
  })

  const update = () => {
    const scrolled = gsap.utils.clamp(0, distance(), window.scrollY - section.offsetTop)
    const frames = gsap.ticker.deltaRatio(60)
    const gap = row.slot - row.width
    const middle = window.innerWidth / 2
    let nearest = null
    let nearestOff = row.slot / 2
    items.forEach((item, i) => {
      const target = enter() - scrolled
      let x = placed[i]
      // First frame (or after a layout change left nothing usable): straight to its place
      if (!Number.isFinite(x) || reducedMotion) x = target
      else {
        // Where the card is on the screen, 0 at the side it moves towards, 1 at the other
        const screen = gsap.utils.clamp(0, 1, (row.lefts[i] + x) / window.innerWidth)
        const behind = target < x ? screen : 1 - screen
        const rate = follow * (1 - slowdown * behind)
        x += (target - x) * (1 - Math.pow(1 - rate, frames))
      }
      // Never closer to the card before than half the design's gap
      if (i > 0) x = Math.max(x, placed[i - 1] - gap * (1 - minGap))
      placed[i] = x
      setters[i](x)
      const left = row.lefts[i] + x
      revealSetters[i]?.(-left)
      // The card in the middle: within half a step of it
      const off = Math.abs(left + row.width / 2 - middle)
      if (off < nearestOff) {
        nearest = i
        nearestOff = off
      }
    })
    centred = nearest === null ? null : cards[nearest].dataset.space
    showBackground()
  }
  update()
  ScrollTrigger.addEventListener('refresh', update)

  // Runs while the section is on the screen
  const inView = ScrollTrigger.create({ trigger: section, start: 'top bottom', end: 'bottom top' })
  gsap.ticker.add(() => inView.isActive && update())

  // Where the scroll should settle once it stops (for the navigation): the card nearest to the
  // middle, drawn there, while a card is within half a step of the middle; elsewhere it stays
  const snap = (y) => {
    if (!cards.length) return null
    const scrolled = y - section.offsetTop
    const first = centredAt(0)
    if (scrolled < first - row.slot / 2 || scrolled > distance()) return null
    const index = gsap.utils.clamp(0, cards.length - 1, Math.round((scrolled - first) / row.slot))
    return section.offsetTop + centredAt(index)
  }

  // Paused, for the navigation; filled once the fonts are ready (letters are measured)
  const intro = reducedMotion ? null : gsap.timeline({ paused: true })
  if (intro && title) document.fonts.ready.then(() => intro.add(titleTimeline(title), 0))

  return { section, intro, snap }
}
