// Endless right-to-left marquee for the "Who we are" photo strip.
// The original photos are cloned (aria-hidden) until the strip always covers the viewport,
// then the strip moves left by exactly one set of photos and loops — the copy that slides in
// is identical, so the jump back is invisible. Starts from the static (centred) layout.
// Paused while off screen; disabled with prefers-reduced-motion (static layout stays).

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MARQUEE, REDUCED_MOTION_QUERY } from './config.js'

gsap.registerPlugin(ScrollTrigger)

export function initMarquee(list) {
  if (!list || window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  const originals = [...list.children]
  let tween = null
  let trigger = null

  const build = () => {
    const progress = tween ? tween.progress() : 0
    tween?.kill()
    trigger?.kill()
    list.querySelectorAll('[data-marquee-clone]').forEach((clone) => clone.remove())

    list.classList.add('is-marquee')
    gsap.set(list, { x: 0 })

    const gap = parseFloat(getComputedStyle(list).columnGap) || 0
    // Distance between the same photo in two neighbouring sets
    const setWidth = originals.reduce((width, item) => width + item.offsetWidth + gap, 0)
    const listWidth = list.clientWidth
    // Same start as the static layout: the original set centred in the list
    const startX = (listWidth - (setWidth - gap)) / 2
    // The strip bleeds past the list to the viewport edges
    const bleed = list.getBoundingClientRect().left

    // Enough sets that the right edge stays covered at the end of a loop (x = startX - setWidth)
    const sets = Math.max(2, Math.ceil((listWidth + bleed - startX) / setWidth) + 1)
    for (let i = 1; i < sets; i += 1) {
      originals.forEach((item) => {
        const clone = item.cloneNode(true)
        clone.setAttribute('aria-hidden', 'true')
        clone.dataset.marqueeClone = ''
        list.append(clone)
      })
    }

    tween = gsap.fromTo(
      list,
      { x: startX },
      {
        x: startX - setWidth,
        duration: originals.length * MARQUEE.secondsPerPhoto,
        ease: 'none',
        repeat: -1,
      },
    )
    tween.progress(progress)

    // Run only while the strip is on screen
    trigger = ScrollTrigger.create({
      trigger: list,
      start: 'top bottom',
      end: 'bottom top',
      onToggle: (self) => (self.isActive ? tween.play() : tween.pause()),
    })
    if (!trigger.isActive) tween.pause()
  }

  build()

  let lastWidth = list.clientWidth
  let timer = null
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        if (list.clientWidth === lastWidth) return
        lastWidth = list.clientWidth
        build()
      }, MARQUEE.resizeDebounce)
    },
    { passive: true },
  )
}
