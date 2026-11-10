// Spaces card hover (SPACES_HOVER): the photo grows inside the card, the name moves up and fades
// out while its copy comes in from below, and the other cards turn black and white (their grey
// photo copies fade in). Leaving plays it backwards; moving to another card hands the colour over.

import { gsap } from 'gsap'
import { SPACES_HOVER } from '../animations/config.js'
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

  initCardHover(cards, hovers, monos, SPACES_HOVER)
}
