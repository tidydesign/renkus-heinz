// Hero intro on page load: the photo fades in and scales down; shortly after, the three text
// layers (title lead, title main line, paragraph) fade in and scale down from 200%, all starting
// together with their own durations. Every layer scales around the centre of the text block,
// so the spacing between the layers scales with them instead of the lines piling up.

import { gsap } from 'gsap'
import { HERO_INTRO, REDUCED_MOTION_QUERY } from './config.js'

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

// Transform origin that puts the pivot at the centre of `block`, in `el`'s own coordinates
const originAtCentreOf = (el, block) => {
  const a = el.getBoundingClientRect()
  const b = block.getBoundingClientRect()
  return `${b.left + b.width / 2 - a.left}px ${b.top + b.height / 2 - a.top}px`
}

export async function initHeroIntro() {
  const hero = document.querySelector('.hero')
  if (!hero) return

  const photo = hero.querySelector('.hero__photo')
  const content = hero.querySelector('.hero__content')
  const layers = {
    lead: content.querySelector('.display-title__lead'),
    main: content.querySelector('.display-title__main'),
    text: content.querySelector('.hero__text'),
  }

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  // Start once the photo is decoded and fonts are ready, but never wait longer than maxWait
  await Promise.race([
    Promise.all([photo?.decode().catch(() => {}), document.fonts.ready]),
    wait(HERO_INTRO.maxWait),
  ])

  const { photo: photoAnim, text: textAnim } = HERO_INTRO

  const tl = gsap
    .timeline()
    .fromTo(
      photo,
      { opacity: 0, scale: photoAnim.fromScale },
      { opacity: 1, scale: 1, duration: photoAnim.duration, ease: photoAnim.ease },
    )

  Object.entries(layers).forEach(([name, el]) => {
    if (!el) return
    const duration = textAnim.durations[name]
    gsap.set(el, { transformOrigin: originAtCentreOf(el, content) })
    tl.fromTo(
      el,
      { scale: textAnim.fromScale },
      { scale: 1, duration, ease: textAnim.scaleEase },
      textAnim.delay,
    ).fromTo(
      el,
      { opacity: 0 },
      { opacity: 1, duration, ease: textAnim.opacityEase },
      textAnim.delay,
    )
  })
}
