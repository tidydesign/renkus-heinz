// Pinned title screens ("What we stand for", "The people behind the sound"): the whole title
// starts at the size and weight of the first line. When the title reaches the viewport centre
// (the section is sticky there), the second line grows to its full size and weight.
// Scrolling back up reverses it.
//
// The first line must not move while the second one grows. So the final layout stays as in
// the static design, the second line scales from its top edge (it only grows downwards), and
// the whole title is shifted down once, so that the small starting state sits at the centre.
// Font-weight is animated directly (DM Sans is variable) — an agreed exception to the
// "transform and opacity only" rule.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { REDUCED_MOTION_QUERY, TITLE_GROW } from './config.js'

gsap.registerPlugin(ScrollTrigger)

function initSection(section) {
  const title = section.querySelector('.display-title')
  const lead = title?.querySelector('.display-title__lead')
  const main = title?.querySelector('.display-title__main')
  if (!lead || !main) return

  // Final weight comes from CSS, read before GSAP sets inline styles
  const finalWeight = getComputedStyle(main).fontWeight
  const leadWeight = () => getComputedStyle(lead).fontWeight

  // Font sizes change per breakpoint, so these are recomputed on every refresh
  const startScale = () =>
    parseFloat(getComputedStyle(lead).fontSize) / parseFloat(getComputedStyle(main).fontSize)
  // Half of the height the second line gains: centres the small starting state
  const centreOffset = () => (main.offsetHeight * (1 - startScale())) / 2

  gsap.set(main, { transformOrigin: 'center top' })

  const grow = gsap.fromTo(
    main,
    { scale: startScale, fontWeight: leadWeight },
    {
      scale: 1,
      fontWeight: finalWeight,
      duration: TITLE_GROW.duration,
      ease: TITLE_GROW.ease,
      paused: true,
    },
  )

  ScrollTrigger.create({
    trigger: section,
    // The section's sticky top: the moment it pins, the title is at the viewport centre
    start: () => `top ${parseFloat(getComputedStyle(section).top)}px`,
    animation: grow,
    toggleActions: 'play none none reverse',
    invalidateOnRefresh: true,
    onRefresh: () => gsap.set(title, { y: centreOffset() }),
  })
}

export function initTitleGrow() {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return
  document.querySelectorAll('.pin-stack__title').forEach(initSection)
}
