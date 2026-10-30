// "What Are You Listening For?" cards: hovering a card (or focusing inside it) makes it the active one
// and the others inactive. Leaving it changes nothing — the last hovered card stays active.
// The switch (START_CARDS): the new card grows to fit its link and fades to white; the link
// rises from one link height below, its circle fades in and grows from 0, its label fades in
// letter by letter. The previous card shrinks back while its link fades out.
// The cards container fires "start:select" (detail: { index, card }) on each change, for the
// scene switch to follow later.

import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { REDUCED_MOTION_QUERY, START_CARDS } from '../animations/config.js'

gsap.registerPlugin(SplitText)

const { cardDuration, duration, ease, letterDuration, leaveFade } = START_CARDS

// Animates the card from its current height to the height its content now takes
const resize = (card, from) => {
  gsap.set(card, { height: 'auto' })
  const to = card.offsetHeight
  return gsap.fromTo(
    card,
    { height: from },
    { height: to, duration: cardDuration, ease, onComplete: () => gsap.set(card, { clearProps: 'height' }) },
  )
}

const linkParts = (card) => {
  const link = card.querySelector('.start__card-link')
  if (!link) return null
  const label = link.querySelector('.start__card-link-label')
  const chars = label ? SplitText.create(label, { type: 'words, chars', charsClass: 'split-char' }).chars : []
  return { link, icon: link.querySelector('.start__card-link-icon-area'), chars }
}

const showLink = ({ link, icon, chars }) => {
  gsap.killTweensOf([link, icon, ...chars])
  const tl = gsap.timeline()
  tl.fromTo(link, { opacity: 1, y: link.offsetHeight }, { y: 0, duration, ease }, 0)
  tl.fromTo(icon, { opacity: 0, scale: 0 }, { opacity: 1, scale: 1, duration, ease }, 0)
  if (chars.length) {
    // Spread so the last letter finishes with the link
    const stagger = chars.length > 1 ? (duration - letterDuration) / (chars.length - 1) : 0
    tl.fromTo(chars, { opacity: 0 }, { opacity: 1, duration: letterDuration, stagger, ease: 'none' }, 0)
  }
  return tl
}

export function initStartCards() {
  const list = document.querySelector('.start__cards')
  const cards = list ? [...list.querySelectorAll('.start__card')] : []
  if (!cards.length) return

  const reducedMotion = () => window.matchMedia(REDUCED_MOTION_QUERY).matches
  const parts = new Map(cards.map((card) => [card, linkParts(card)]))
  gsap.set(cards, { '--active': (i, card) => (card.classList.contains('is-active') ? 1 : 0) })

  const activate = (card) => {
    const from = card.offsetHeight
    card.classList.remove('is-leaving')
    card.classList.add('is-active')
    // Only the switch's own tweens: the arrival may still be sliding the card in
    gsap.killTweensOf(card, 'height,--active')
    resize(card, from)
    gsap.to(card, { '--active': 1, duration: cardDuration, ease })
    const link = parts.get(card)
    if (link) showLink(link)
  }

  const deactivate = (card) => {
    const from = card.offsetHeight
    card.classList.remove('is-active')
    // Only the switch's own tweens: the arrival may still be sliding the card in
    gsap.killTweensOf(card, 'height,--active')
    // The link stays in place while the card closes over it
    resize(card, from).eventCallback('onComplete', () => {
      card.classList.remove('is-leaving')
      gsap.set(card, { clearProps: 'height' })
    })
    card.classList.add('is-leaving')
    gsap.to(card, { '--active': 0, duration: cardDuration, ease })
    const link = parts.get(card)
    if (link) {
      gsap.killTweensOf(link.link)
      gsap.to(link.link, { opacity: 0, duration: leaveFade, ease })
    }
  }

  const select = (card) => {
    if (card.classList.contains('is-active')) return
    const previous = cards.find((other) => other.classList.contains('is-active'))

    if (reducedMotion()) {
      cards.forEach((other) => other.classList.toggle('is-active', other === card))
      gsap.set(cards, { '--active': (i, other) => (other === card ? 1 : 0) })
    } else {
      if (previous) deactivate(previous)
      activate(card)
    }

    list.dispatchEvent(new CustomEvent('start:select', { detail: { index: cards.indexOf(card), card } }))
  }

  cards.forEach((card) => {
    card.addEventListener('pointerenter', (event) => event.pointerType === 'mouse' && select(card))
    card.addEventListener('focusin', () => select(card))
  })
}
