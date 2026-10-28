// Scroll-driven text fill: the text starts light grey, and a mask fills it line by line,
// left to right, in its original colour. The next line starts only after the previous one
// is filled. The mask moves with transforms only: the fill window slides in from the left
// while its content slides the opposite way, so the coloured text stays in place.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { REDUCED_MOTION_QUERY, TEXT_REVEAL } from './config.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const addFill = (line) => {
  const fill = document.createElement('span')
  fill.className = 'text-reveal__fill'
  fill.setAttribute('aria-hidden', 'true')

  const inner = document.createElement('span')
  inner.className = 'text-reveal__fill-inner'
  inner.textContent = line.textContent

  fill.append(inner)
  line.append(fill)
  return { fill, inner }
}

/**
 * @param {Element} trigger  Text section: the fill ends when it is centred in the viewport
 * @param {string} selector  Text elements inside `trigger`, filled in DOM order;
 *                           the fill starts when the last one is fully on screen
 */
export function initTextReveal(trigger, selector) {
  if (!trigger || window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  const targets = trigger.querySelectorAll(selector)
  if (!targets.length) return

  // Keep each element's own colour for the fill before the base grey is applied
  targets.forEach((el) => {
    el.style.setProperty('--text-reveal-fill', getComputedStyle(el).color)
    el.classList.add('text-reveal')
  })

  SplitText.create(targets, {
    type: 'lines',
    linesClass: 'text-reveal__line',
    // Re-split on resize and after fonts load; the returned timeline is rebuilt each time
    autoSplit: true,
    onSplit(self) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: targets[targets.length - 1],
          start: TEXT_REVEAL.start,
          endTrigger: trigger,
          end: TEXT_REVEAL.end,
          scrub: TEXT_REVEAL.scrub,
        },
      })

      // Steps run in sequence, so each line waits for the previous one.
      // Step length is proportional to line width, so the fill moves at an even speed.
      self.lines.forEach((line) => {
        const { fill, inner } = addFill(line)
        const duration = line.offsetWidth
        tl.fromTo(fill, { xPercent: -100 }, { xPercent: 0, duration, ease: 'none' })
          .fromTo(inner, { xPercent: 100 }, { xPercent: 0, duration, ease: 'none' }, '<')
      })

      return tl
    },
  })
}
