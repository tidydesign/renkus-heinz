// Hero intro on page load: photo fades in and scales down, then the text lines follow.

import { gsap } from 'gsap'
import { HERO_INTRO, REDUCED_MOTION_QUERY } from './config.js'

const wait = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000))

export async function initHeroIntro() {
  const hero = document.querySelector('.hero')
  if (!hero) return

  const photo = hero.querySelector('.hero__photo')
  // The whole text block scales, so the spacing between lines scales with it
  const content = hero.querySelector('.hero__content')
  const lines = content.querySelectorAll('.display-title__lead, .display-title__main, .hero__text')

  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return

  // Start once the photo is decoded and fonts are ready, but never wait longer than maxWait
  await Promise.race([
    Promise.all([photo?.decode().catch(() => {}), document.fonts.ready]),
    wait(HERO_INTRO.maxWait),
  ])

  const { photo: photoAnim, text: textAnim } = HERO_INTRO
  // The block keeps scaling until the last line has faded in
  const contentDuration = textAnim.duration + textAnim.stagger * (lines.length - 1)

  gsap
    .timeline()
    .fromTo(
      photo,
      { opacity: 0, scale: photoAnim.fromScale },
      { opacity: 1, scale: 1, duration: photoAnim.duration, ease: photoAnim.ease },
    )
    .fromTo(
      content,
      { scale: textAnim.fromScale },
      { scale: 1, duration: contentDuration, ease: textAnim.scaleEase },
      textAnim.delay,
    )
    .fromTo(
      lines,
      { opacity: 0 },
      { opacity: 1, duration: textAnim.duration, ease: textAnim.ease, stagger: textAnim.stagger },
      textAnim.delay,
    )
}
