// Cases. The page scrolls freely here. The title comes in letter by letter like the other sections'
// as it rises into view. The cards run from right to left in an endless loop while the section is
// on the screen: copies of the row follow it, and one row's width later the loop starts over.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CASES } from './config.js'
import { initScrollTitle } from './section-intro.js'

gsap.registerPlugin(ScrollTrigger)

const initMarquee = (section, list) => {
  const originals = [...list.children]
  list.classList.add('cases__list--marquee')

  // One copy to measure the row with: the distance from a card to its own copy
  const addCopy = () => {
    originals.forEach((item) => {
      const copy = item.cloneNode(true)
      copy.setAttribute('aria-hidden', 'true')
      copy.querySelectorAll('a').forEach((link) => link.setAttribute('tabindex', '-1'))
      list.append(copy)
    })
  }
  addCopy()
  const rowWidth = list.children[originals.length].offsetLeft - originals[0].offsetLeft

  // Enough rows for the largest window on this screen, with one row out of view on each side
  const screenWidth = Math.max(window.innerWidth, window.screen.width)
  for (let rows = 2; rows < Math.ceil(screenWidth / rowWidth) + 2; rows += 1) addCopy()

  // The row's place in the design, centred, moved back whole rows so the left edge is always covered
  const rowLength = rowWidth - parseFloat(getComputedStyle(list).columnGap)
  const start = () => {
    const centred = (window.innerWidth - rowLength) / 2
    return centred > 0 ? centred - rowWidth * Math.ceil(centred / rowWidth) : centred
  }

  const tween = gsap.fromTo(
    list,
    { x: start },
    { x: () => start() - rowWidth, duration: rowWidth / CASES.marquee.speed, ease: 'none', repeat: -1, paused: true },
  )
  ScrollTrigger.addEventListener('refresh', () => tween.invalidate())

  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
  })
}

export function initCases(reducedMotion) {
  const section = document.querySelector('.cases')
  if (!section || reducedMotion) return

  const title = section.querySelector('.cases__title')
  const list = section.querySelector('.cases__list')
  if (title) initScrollTitle(title, '.cases__title-line', CASES)
  if (list) initMarquee(section, list)
}
