// Spaces card hover (SPACES_HOVER): the card opens up and down from its bar to 3:4 and shows its
// space in colour (lined up with the background by src/animations/spaces.js), the name moves up and
// fades out while its copy comes in from below, and the name turns from blue to white. Leaving
// plays it backwards; moving to another card hands it over. The background follows the hovered
// card (a spaces:hover event for src/animations/spaces.js), and waves of particles leave it
// (src/components/spaces-ripples.js).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SPACES_HOVER } from '../animations/config.js'
import { lineHeightOf } from '../animations/letters.js'
import { initCardHover } from './card-hover.js'
import { initSpacesRipples } from './spaces-ripples.js'

// Colour pictures by space name (src/assets/images/spaces/<name>-bg-color.jpg), through Vite so the
// build includes them (file names are hashed there, so the cards find theirs by data-space)
const REVEALS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/images/spaces/*-bg-color.jpg', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [path.split('/').pop().replace(/-bg-color\.jpg$/, ''), url]),
)

export function initSpacesCards() {
  const section = document.querySelector('.spaces')
  const cards = [...document.querySelectorAll('.spaces__card')]
  if (!section || !cards.length) return

  // The pictures load once the section is a screen away
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom+=100%',
    once: true,
    onEnter: () =>
      section.querySelectorAll('.spaces__reveal').forEach((img) => {
        const url = REVEALS[img.dataset.space]
        if (url) img.src = url
      }),
  })

  const { duration, ease, textY, nameColor, hoverNameColor } = SPACES_HOVER

  const hovers = cards.map((card) => {
    const name = card.querySelector('.spaces__name')
    const next = card.querySelector('.spaces__name--next')
    const shift = () => textY * lineHeightOf(name)
    const tl = gsap.timeline({ paused: true, defaults: { duration, ease } })
    tl.fromTo(card, { '--open': 0 }, { '--open': 1 }, 0)
    tl.fromTo(card.querySelector('.spaces__reveal'), { opacity: 0 }, { opacity: 1 }, 0)
    tl.fromTo([name, next], { color: nameColor }, { color: hoverNameColor }, 0)
    tl.fromTo(name, { y: 0, opacity: 1 }, { y: () => -shift(), opacity: 0 }, 0)
    tl.fromTo(next, { y: shift, opacity: 0 }, { y: 0, opacity: 1 }, 0)
    return tl
  })

  const ripple = initSpacesRipples(section)
  const onActive = (index) => {
    ripple(index === null ? null : cards[index])
    section.dispatchEvent(
      new CustomEvent('spaces:hover', { detail: { space: index === null ? null : cards[index].dataset.space } }),
    )
  }
  initCardHover(cards, hovers, [], SPACES_HOVER, onActive)
}
