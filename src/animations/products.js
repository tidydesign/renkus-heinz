// Products. The page scrolls freely here (the free scene before it just goes on). The title comes
// in letter by letter like the other sections' as it rises into view. The cards follow the scroll
// with inertia, the ones closer to the side the page moves towards first, so the columns stretch
// while moving and close up once the scroll stops. The right column also moves faster than the
// left one (parallax); it is at its design position when the section is centred on the screen.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { PRODUCTS } from './config.js'
import { initScrollTitle } from './section-intro.js'

gsap.registerPlugin(ScrollTrigger)

const initCards = (section, items) => {
  const { follow, slowdown, maxLag } = PRODUCTS.inertia

  // Layout offsets (px), measured on refresh; transforms don't count
  let sectionTop = 0
  let sectionHeight = 0
  let tops = []
  const measure = () => {
    sectionTop = section.offsetTop
    sectionHeight = section.offsetHeight
    tops = items.map((item) => item.offsetTop)
  }
  measure()
  ScrollTrigger.addEventListener('refresh', measure)

  // The scroll position each card is following; empty until the section is on the screen
  const followed = items.map(() => null)
  const setters = items.map((item) => gsap.quickSetter(item, 'y', 'px'))

  const update = () => {
    const scroll = window.scrollY
    const frames = gsap.ticker.deltaRatio(60)
    items.forEach((item, i) => {
      let position = followed[i]
      if (!Number.isFinite(position)) position = scroll
      else {
        // Where the card is on the screen, 0 at the top, 1 at the bottom
        const screen = gsap.utils.clamp(0, 1, (sectionTop + tops[i] - scroll) / window.innerHeight)
        const behind = position < scroll ? screen : 1 - screen
        const rate = follow * (1 - slowdown * behind)
        position += (scroll - position) * (1 - Math.pow(1 - rate, frames))
        position = gsap.utils.clamp(scroll - maxLag, scroll + maxLag, position)
      }
      followed[i] = position
      let y = scroll - position
      // Right column (even items in reading order)
      if (i % 2) y += PRODUCTS.parallax * (sectionTop + sectionHeight / 2 - window.innerHeight / 2 - position)
      setters[i](y)
    })
  }

  // Runs while the section is on the screen; starts afresh on each return
  const inView = ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      if (!self.isActive) followed.fill(null)
    },
  })
  gsap.ticker.add(() => inView.isActive && update())
}

export function initProducts(reducedMotion) {
  const section = document.querySelector('.products')
  if (!section || reducedMotion) return

  const title = section.querySelector('.products__title')
  const items = [...section.querySelectorAll('.products__item')]
  if (title) initScrollTitle(title, '.products__title-line', PRODUCTS)
  if (items.length) initCards(section, items)
}
