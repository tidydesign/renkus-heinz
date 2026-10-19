// Mission and A California Identity, Laptop and up: the photo mask starts as wide as 12 columns
// of the page grid and expands to the full width once 75% of the section is on screen.
// Scrolling back up reverses it. Same timing and curve as the title grow.
//
// Transforms only: the mask is scaled horizontally and its inner layer gets the inverse scale on
// every frame, so the photo is revealed from under the mask instead of being stretched.
// Elements marked [data-expand-shift] (the Identity card) move with the mask's left edge,
// keeping the same distance from the photo edge at every moment.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REDUCED_MOTION_QUERY, SECTION_EXPAND } from './config.js'

gsap.registerPlugin(ScrollTrigger)

const cssNumber = (el, name) => parseFloat(getComputedStyle(el).getPropertyValue(name))

// Share of the section width taken by N columns of the page grid
function columnsScale(section) {
  const width = section.clientWidth
  const columns = cssNumber(section, '--grid-columns')
  const margin = cssNumber(section, '--space-margin')
  const gutter = cssNumber(section, '--space-gutter')
  const columnWidth = (width - 2 * margin - (columns - 1) * gutter) / columns
  const span = Math.min(SECTION_EXPAND.columns, columns)
  return (span * columnWidth + (span - 1) * gutter) / width
}

function initSection(section) {
  const mask = section.querySelector('.expand-mask')
  const inner = mask?.querySelector('.expand-mask__inner')
  if (!inner) return

  const followers = section.querySelectorAll('[data-expand-shift]')
  const state = { scale: 1 }

  const render = () => {
    const leftEdge = (section.clientWidth * (1 - state.scale)) / 2
    gsap.set(mask, { scaleX: state.scale })
    gsap.set(inner, { scaleX: 1 / state.scale })
    gsap.set(followers, { x: leftEdge })
  }

  const expand = gsap.fromTo(
    state,
    { scale: () => columnsScale(section) },
    {
      scale: 1,
      duration: SECTION_EXPAND.duration,
      ease: SECTION_EXPAND.ease,
      paused: true,
      onUpdate: render,
    },
  )

  ScrollTrigger.create({
    trigger: section,
    start: SECTION_EXPAND.start,
    animation: expand,
    toggleActions: 'play none none reverse',
    invalidateOnRefresh: true,
    onRefresh: render,
  })

  render()
}

export function initSectionExpand() {
  const mm = gsap.matchMedia()
  // Leaving Laptop+ (or turning on reduced motion) reverts everything created here
  mm.add(`${SECTION_EXPAND.media} and (prefers-reduced-motion: no-preference)`, () => {
    document.querySelectorAll('[data-expand]').forEach(initSection)
  })
}
