// Hover of every button but the Hero's own, the same as "Find My Sound" (HERO_BUTTON_HOVER): the
// icon is replaced by its copy, here from the left; a lighter circle grows from under the icon; the
// shadow fades in. Leaving plays it backwards. The fill circle and the icon copies are added here.

import { gsap } from 'gsap'
import { CONTACT, HERO_BUTTON_HOVER, REDUCED_MOTION_QUERY } from '../animations/config.js'

const TARGETS = [
  { trigger: '.why__link', body: '.why__link-body', icon: '.why__link-icon', white: true },
  { trigger: '.pill-link', body: '.pill-link__body', icon: '.pill-link__icon' },
  // The icon stays in place here and only grows
  { trigger: '.contact__social-link', body: '.contact__social-body', icon: '.contact__social-icon', stillIcon: true },
  { trigger: '.footer__social-link', body: '.footer__social-body', icon: '.footer__social-icon', white: true, stillIcon: true },
  { trigger: '.footer__submit', body: '.footer__submit-body', icon: '.footer__submit-icon', white: true },
  // Only the circle is a button here: it carries the shadow, not the whole link with its label
  {
    trigger: '.start__card-link',
    host: '.start__card-link-icon-area',
    body: '.start__card-link-icon-clip',
    icon: '.start__card-link-icon',
  },
]

const slotFor = (icon) => {
  const slot = document.createElement('span')
  slot.className = 'button-hover__slot'
  slot.append(icon)
  return slot
}

const build = (trigger, { host: hostSelector, body: bodySelector, icon: iconSelector, white, stillIcon }) => {
  const host = hostSelector ? trigger.querySelector(hostSelector) : trigger
  const body = trigger.querySelector(bodySelector)
  const icon = trigger.querySelector(iconSelector)
  const area = icon.parentElement

  host.classList.add('button-hover')
  if (white) host.classList.add('button-hover--white')
  area.classList.add('button-hover__area')
  body.classList.add('button-hover__body')
  // Above the fill circle
  if (body !== area) [...body.children].forEach((child) => child.classList.add('button-hover__above'))

  const fill = document.createElement('span')
  fill.className = 'button-hover__fill'
  body.prepend(fill)

  const slots = [slotFor(icon)]
  if (!stillIcon) {
    const copy = icon.cloneNode(true)
    copy.classList.add('button-hover__copy')
    slots.push(slotFor(copy))
  }
  area.append(...slots)

  // Set here so GSAP keeps the offsets in percent
  gsap.set(fill, { x: 0, y: 0, xPercent: 50, yPercent: -50, scale: 0 })
  if (!stillIcon) gsap.set(slots[1], { xPercent: -100 })

  const vars = { duration: HERO_BUTTON_HOVER.duration, ease: HERO_BUTTON_HOVER.ease }
  const tl = gsap.timeline({ paused: true })
  // Both icons move right one circle width: the first leaves, the copy takes its place
  if (stillIcon) tl.to(slots, { scale: CONTACT.socialLinks.hoverIconScale, ...vars }, 0)
  else tl.to(slots, { xPercent: '+=100', ...vars }, 0)
  tl.to(fill, { scale: 1, ...vars }, 0)
  tl.to(host, { '--shadow-opacity': 1, ...vars }, 0)
  return tl
}

export function initButtonHovers() {
  // Reduced motion: the hover state switches without movement
  const instant = () => window.matchMedia(REDUCED_MOTION_QUERY).matches

  TARGETS.forEach((target) => {
    document.querySelectorAll(target.trigger).forEach((trigger) => {
      const hover = build(trigger, target)
      const enter = () => (instant() ? hover.progress(1).pause() : hover.play())
      const leave = () => (instant() ? hover.progress(0).pause() : hover.reverse())
      trigger.addEventListener('mouseenter', enter)
      trigger.addEventListener('mouseleave', leave)
      trigger.addEventListener('focus', () => trigger.matches(':focus-visible') && enter())
      trigger.addEventListener('blur', leave)
    })
  })
}
