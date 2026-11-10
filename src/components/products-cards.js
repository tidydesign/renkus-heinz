// Products card hover (PRODUCTS_HOVER): the photo grows inside the card, the name turns brand blue
// and the other cards turn black and white.

import { gsap } from 'gsap'
import { PRODUCTS_HOVER } from '../animations/config.js'
import { initCardHover } from './card-hover.js'

export function initProductsCards() {
  const cards = [...document.querySelectorAll('.products__card')]
  if (!cards.length) return

  const { duration, ease, photoScale, nameColor } = PRODUCTS_HOVER
  const hovers = cards.map((card) => {
    const tl = gsap.timeline({ paused: true, defaults: { duration, ease } })
    tl.to(card.querySelector('.products__photo'), { scale: photoScale }, 0)
    tl.to(card.querySelector('.products__name'), { color: nameColor }, 0)
    return tl
  })
  const monos = cards.map((card) => card.querySelector('.products__image--mono'))

  initCardHover(cards, hovers, monos, PRODUCTS_HOVER)
}
