// Footer link hover (FOOTER_LINKS). In a group the hovered link stays white and the others turn
// grey; leaving the group brings them back. The grey links of the bottom line turn white.

import { gsap } from 'gsap'
import { FOOTER_LINKS, REDUCED_MOTION_QUERY } from '../animations/config.js'

const { duration, ease, white, muted, legal } = FOOTER_LINKS

const paint = (links, color) => {
  if (!links.length) return
  const instant = window.matchMedia(REDUCED_MOTION_QUERY).matches
  gsap.to(links, { color, duration: instant ? 0 : duration, ease, overwrite: 'auto' })
}

const initGroup = (group) => {
  const links = [...group.querySelectorAll('.footer__link')]
  const highlight = (link) => {
    paint([link], white)
    paint(links.filter((other) => other !== link), muted)
  }
  const reset = () => paint(links, white)

  links.forEach((link) => {
    link.addEventListener('mouseenter', () => highlight(link))
    link.addEventListener('focus', () => link.matches(':focus-visible') && highlight(link))
  })
  group.addEventListener('mouseleave', reset)
  group.addEventListener('focusout', (event) => {
    if (!group.contains(event.relatedTarget)) reset()
  })
}

const initLegalLink = (link) => {
  link.addEventListener('mouseenter', () => paint([link], white))
  link.addEventListener('mouseleave', () => paint([link], legal))
  link.addEventListener('focus', () => link.matches(':focus-visible') && paint([link], white))
  link.addEventListener('blur', () => paint([link], legal))
}

export function initFooterLinks() {
  document.querySelectorAll('.footer__links').forEach(initGroup)
  document.querySelectorAll('.footer__legal-links a').forEach(initLegalLink)
}
