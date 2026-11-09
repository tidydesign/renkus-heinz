// About. The page scrolls freely here. While the section crosses the screen the photo slides
// up within it around its middle position (ABOUT.photoShift). Once reached the card's content
// comes in: the logo fades in and rises, the title and the text appear line by line like the
// Hero paragraph, the link like the others.

import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { ABOUT } from './config.js'
import { lineHeightOf, lineRiseTimeline } from './letters.js'
import { addLinkIntro, playWhenReached, primeIntro } from './section-intro.js'

gsap.registerPlugin(ScrollTrigger, SplitText)

const crossing = (section) => ({ trigger: section, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true })

const initPhoto = (section, photo) => {
  // The photo's middle at the section's middle
  const centre = () => (section.offsetHeight - photo.offsetHeight) / 2
  // Half the travel, never so far that an edge of the section shows
  const half = () => Math.min((ABOUT.photoShift * section.offsetHeight) / 2, -centre())
  gsap.fromTo(
    photo,
    { y: () => centre() + half() },
    { y: () => centre() - half(), ease: 'none', scrollTrigger: crossing(section) },
  )
}

const addLines = (intro, text) => {
  const split = SplitText.create(text, { type: 'lines, words, chars', charsClass: 'split-char' })
  const groups = split.lines.map((line) => ({ line, items: split.chars.filter((char) => line.contains(char)) }))
  intro.add(lineRiseTimeline(groups, lineHeightOf(text), { ...ABOUT.text, delay: 0 }), 0)
  gsap.set(text, { visibility: 'visible' })
}

const initIntro = (section, panel) => {
  const intro = gsap.timeline({ paused: true })

  document.fonts.ready.then(() => {
    const logo = panel.querySelector('.about__mark')
    if (logo) {
      intro.fromTo(
        logo,
        { opacity: 0, yPercent: ABOUT.logo.fromYPercent },
        { opacity: 1, yPercent: 0, duration: ABOUT.logo.duration, ease: ABOUT.text.ease },
        0,
      )
    }

    panel.querySelectorAll('.about__title, .about__text').forEach((text) => addLines(intro, text))

    const link = panel.querySelector('.pill-link')
    if (link) {
      addLinkIntro(
        intro,
        {
          link,
          body: link.querySelector('.pill-link__body'),
          label: link.querySelector('.pill-link__label'),
          arrow: link.querySelector('.pill-link__icon'),
        },
        ABOUT,
      )
    }

    primeIntro(intro)
  })

  playWhenReached(intro, section, ABOUT.introStart)
}

export function initAbout(reducedMotion) {
  const section = document.querySelector('.about')
  if (!section || reducedMotion) return

  const photo = section.querySelector('.about__photo')
  const panel = section.querySelector('.about__panel')
  if (photo) initPhoto(section, photo)
  if (panel) initIntro(section, panel)
}
