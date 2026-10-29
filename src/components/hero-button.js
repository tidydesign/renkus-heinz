// "Find My Sound": scrolls to the section after the Hero (the same glide as the wheel), and the
// hover animation (HERO_BUTTON_HOVER): the arrow is replaced by its copy from above, a lighter
// circle grows from under the icon, the shadow fades in.

import { gsap } from 'gsap'
import { HERO_BUTTON_HOVER, REDUCED_MOTION_QUERY } from '../animations/config.js'
import { scrollToSection } from '../animations/scenes.js'

const hoverTimeline = (button) => {
  const slots = button.querySelectorAll('.hero__button-icon-slot')
  const fill = button.querySelector('.hero__button-fill')
  const vars = { duration: HERO_BUTTON_HOVER.duration, ease: HERO_BUTTON_HOVER.ease }

  // The CSS offsets are set here again so GSAP keeps them in percent
  gsap.set(fill, { x: 0, y: 0, xPercent: 50, yPercent: -50, scale: 0 })
  gsap.set(slots[1], { y: 0, yPercent: -100 })

  const tl = gsap.timeline({ paused: true })
  // Both arrows move down one circle height: the first leaves, the copy takes its place
  tl.to(slots, { yPercent: '+=100', ...vars }, 0)
  tl.to(fill, { scale: 1, ...vars }, 0)
  tl.to(button, { '--shadow-opacity': 1, ...vars }, 0)
  return tl
}

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

  const hover = hoverTimeline(button)
  // Reduced motion: the hover state switches without movement
  const instant = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
  const enter = () => (instant() ? hover.progress(1).pause() : hover.play())
  const leave = () => (instant() ? hover.progress(0).pause() : hover.reverse())
  button.addEventListener('mouseenter', enter)
  button.addEventListener('mouseleave', leave)
  button.addEventListener('focus', () => button.matches(':focus-visible') && enter())
  button.addEventListener('blur', leave)
}
