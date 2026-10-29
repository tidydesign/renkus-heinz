// Hero RHAON III card hover (HERO_PROMO_HOVER): the title fades to brand blue, the photo grows
// under its mask and the shadow fades in. Leaving plays it backwards.

import { gsap } from 'gsap'
import { HERO_PROMO_HOVER, REDUCED_MOTION_QUERY } from '../animations/config.js'

export function initHeroPromo() {
  const promo = document.querySelector('.hero__promo')
  if (!promo) return

  const { duration, ease, photoScale } = HERO_PROMO_HOVER
  const tl = gsap.timeline({ paused: true })
  // The shadow and the blue title copy follow --hover
  tl.to(promo, { '--hover': 1, duration, ease }, 0)
  // Scale only: the intro slides the same photo with xPercent
  tl.to(promo.querySelector('.hero__promo-img'), { scale: photoScale, duration, ease }, 0)

  // Reduced motion: the hover state switches without movement
  const instant = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
  const enter = () => (instant() ? tl.progress(1).pause() : tl.play())
  const leave = () => (instant() ? tl.progress(0).pause() : tl.reverse())
  promo.addEventListener('mouseenter', enter)
  promo.addEventListener('mouseleave', leave)
  promo.addEventListener('focus', () => promo.matches(':focus-visible') && enter())
  promo.addEventListener('blur', leave)
}
