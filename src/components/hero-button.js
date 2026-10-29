// "Find My Sound" scrolls to the section after the Hero (the same glide as the wheel).

import { REDUCED_MOTION_QUERY } from '../animations/config.js'
import { scrollToSection } from '../animations/scenes.js'

export function initHeroButton() {
  const hero = document.querySelector('.hero')
  const button = hero?.querySelector('.hero__button')
  if (!button) return

  button.addEventListener('click', () => {
    const next = hero.nextElementSibling
    if (!next || scrollToSection(next)) return
    const smooth = !window.matchMedia(REDUCED_MOTION_QUERY).matches
    next.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  })
}
