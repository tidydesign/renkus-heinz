// Spaces card hover (SPACES_HOVER): the photo grows inside the card, the name moves up and fades
// out while its copy comes in from below, and the other cards turn black and white (their grey
// photo copies fade in), and the card's space shows behind the speaker. Leaving plays it backwards;
// moving to another card hands the colour and the background over.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SPACES_BACKGROUND, SPACES_HOVER } from '../animations/config.js'
import { lineHeightOf } from '../animations/letters.js'
import { initCardHover } from './card-hover.js'

export function initSpacesCards() {
  const cards = [...document.querySelectorAll('.spaces__card')]
  if (!cards.length) return

  const { duration, ease, photoScale, textY } = SPACES_HOVER

  const hovers = cards.map((card) => {
    const name = card.querySelector('.spaces__name')
    const next = card.querySelector('.spaces__name--next')
    const shift = () => textY * lineHeightOf(name)
    const tl = gsap.timeline({ paused: true, defaults: { duration, ease } })
    tl.to(card.querySelector('.spaces__photo'), { scale: photoScale }, 0)
    tl.fromTo(name, { y: 0, opacity: 1 }, { y: () => -shift(), opacity: 0 }, 0)
    tl.fromTo(next, { y: shift, opacity: 0 }, { y: 0, opacity: 1 }, 0)
    return tl
  })
  const monos = cards.map((card) => card.querySelector('.spaces__image--mono'))

  initCardHover(cards, hovers, monos, SPACES_HOVER, initBackgrounds(cards))
}

// Background picture URLs by space name (src/assets/images/spaces/<name>-bg.jpg), through Vite so
// the build includes them
const BACKGROUNDS = Object.fromEntries(
  Object.entries(
    import.meta.glob('../assets/images/spaces/*-bg.jpg', { eager: true, query: '?url', import: 'default' }),
  ).map(([path, url]) => [path.split('/').pop().replace(/-bg\.jpg$/, ''), url]),
)

// The hovered card's space fills the background under the speaker (SPACES_BACKGROUND); no card
// hovered, no background. The pictures load once the section is a screen away
const initBackgrounds = (cards) => {
  const section = document.querySelector('.spaces')
  const images = [...document.querySelectorAll('.spaces__background')]
  if (!section || !images.length) return null

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

  // Each card's background: the same data-space (file names are hashed in the build, so not by them)
  const byCard = cards.map((card) => images.find((img) => img.dataset.space === card.dataset.space) ?? null)

  const { duration, ease } = SPACES_BACKGROUND
  return (index, instant) =>
    images.forEach((img) => {
      const opacity = index !== null && byCard[index] === img ? 1 : 0
      gsap.to(img, { opacity, duration: instant ? 0 : duration, ease, overwrite: true })
    })
}
