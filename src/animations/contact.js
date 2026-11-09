// Contact, the last section. Built from the page's own moves, as one cascade once the section
// rises into view (backwards, fast, when going back up):
// - the divider grows from the left like the Hero's, the tagline comes in like the Hero tagline;
// - the company (with its gradient), the address, the phone numbers and "Get in touch" come in
//   letter by letter like the section titles, the smaller texts line by line like the Hero paragraph;
// - the form's fields arrive like the Spaces and Products cards: strung out with inertia, closing up;
// - the social buttons grow from circles of nothing, their icons turn like the arrow of "Find My
//   Sound", and "Send Request" finishes the cascade the way the other section links come in.

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { CONTACT } from './config.js'
import { lettersTimeline, lineHeightOf, lineRiseTimeline, spreadGradient } from './letters.js'
import { addLinkIntro, playWhenReached, primeIntro } from './section-intro.js'

gsap.registerPlugin(SplitText)

const split = (el, type) => SplitText.create(el, { type, charsClass: 'split-char' })
const linesOf = ({ lines, chars }) => lines.map((line) => chars.filter((char) => line.contains(char)))

// Whole lines rise while their letters fade in
const addRise = (intro, el, at) => {
  const text = split(el, 'lines, words, chars')
  const groups = text.lines.map((line, i) => ({ line, items: linesOf(text)[i] }))
  intro.add(lineRiseTimeline(groups, lineHeightOf(el), { ...CONTACT.text, delay: 0 }), at)
}

// Each letter rises on its own
const addLetters = (intro, el, at) => {
  intro.add(lettersTimeline(linesOf(split(el, 'lines, words, chars')), lineHeightOf(el), { ...CONTACT.letters, delay: 0 }), at)
}

const addInfo = (intro, section) => {
  const { at } = CONTACT
  const one = (selector) => section.querySelector(selector)

  intro.fromTo(one('.contact__divider'), { scaleX: 0 }, { scaleX: 1, ...CONTACT.divider }, at.divider)

  const tagline = one('.contact__tagline')
  const tagChars = split(tagline.querySelector('span'), 'words, chars').chars
  intro.add(
    lineRiseTimeline([{ line: tagline, items: [one('.contact__tagline-dot'), ...tagChars] }], lineHeightOf(tagline), { ...CONTACT.text, delay: 0 }),
    at.tagline,
  )

  const company = one('.contact__company')
  const companyChars = split(company, 'words, chars').chars
  spreadGradient(company, companyChars)
  intro.add(lettersTimeline([companyChars], lineHeightOf(company), { ...CONTACT.letters, delay: 0 }), at.company)

  addLetters(intro, one('.contact__street'), at.street)
  addRise(intro, one('.contact__hours'), at.hours)

  section.querySelectorAll('.contact__phone').forEach((phone, i) => {
    const start = at.phones + i * at.phoneStep
    addRise(intro, phone.querySelector('.contact__phone-label'), start)
    addLetters(intro, phone.querySelector('.contact__phone-number'), start)
  })

  addRise(intro, one('.contact__social-title'), at.social)

  const { duration, stagger, ease, iconFromRotation } = CONTACT.socialLinks
  const links = section.querySelectorAll('.contact__social-link')
  const icons = section.querySelectorAll('.contact__social-icon:not(.button-hover__copy)')
  intro.fromTo(links, { scale: 0 }, { scale: 1, duration, stagger, ease }, at.social)
  intro.fromTo(icons, { rotation: iconFromRotation }, { rotation: 0, duration, stagger, ease }, at.social)
}

const addForm = (intro, section) => {
  const { at, fields: fieldVars } = CONTACT

  addLetters(intro, section.querySelector('.contact__title'), at.formTitle)
  addRise(intro, section.querySelector('.contact__text'), at.formText)

  // By rows, the further down the further out, so the rows close up as they land
  const fields = [...section.querySelectorAll('.contact__field')]
  const rows = [...new Set(fields.map((field) => field.offsetTop))]
  fields.forEach((field) => {
    const row = rows.indexOf(field.offsetTop)
    intro.fromTo(
      field,
      { opacity: 0, y: (row + 1) * fieldVars.step },
      { opacity: 1, y: 0, duration: fieldVars.duration, ease: fieldVars.ease },
      at.fields + row * fieldVars.stagger,
    )
  })

  const link = section.querySelector('.pill-link')
  const linkIntro = gsap.timeline()
  addLinkIntro(
    linkIntro,
    {
      link,
      body: link.querySelector('.pill-link__body'),
      label: link.querySelector('.pill-link__label'),
      arrow: link.querySelector('.pill-link__icon:not(.button-hover__copy)'),
    },
    CONTACT,
  )
  intro.add(linkIntro, at.send)
}

export function initContact(reducedMotion) {
  const section = document.querySelector('.contact')
  if (!section || reducedMotion) return

  const intro = gsap.timeline({ paused: true })
  document.fonts.ready.then(() => {
    addInfo(intro, section)
    addForm(intro, section)
    primeIntro(intro)
    gsap.set(section.querySelectorAll(CONTACT.hidden), { visibility: 'visible' })
  })
  playWhenReached(intro, section, CONTACT.introStart)
}
