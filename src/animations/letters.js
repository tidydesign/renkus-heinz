// Letter-by-letter text animation helpers, shared by the Hero intro and the scroll scenes.

import { gsap } from 'gsap'

// Each accent letter shows its slice of one gradient spanning the whole line. Letters carry
// padding (see split.css) so descenders stay inside the painted area; the gradient covers the
// line grown by the same padding.
export const spreadGradient = (line, chars) => {
  if (!chars.length) return
  const { paddingTop, paddingLeft } = getComputedStyle(chars[0])
  const padY = parseFloat(paddingTop)
  const padX = parseFloat(paddingLeft)
  const box = line.getBoundingClientRect()
  const originX = box.left - padX
  const originY = box.top - padY
  line.style.setProperty('--line-width', `${box.width + padX * 2}px`)
  line.style.setProperty('--line-height', `${box.height + padY * 2}px`)
  chars.forEach((char) => {
    const { left, top } = char.getBoundingClientRect()
    char.style.setProperty('--char-x', `${left - originX}px`)
    char.style.setProperty('--char-y', `${top - originY}px`)
  })
}

// Letters of each line rise and fade in turn; the next line starts once the previous one is
// `nextLineAt` through. `lines` is a list of letter groups, `lineHeight` is in px.
export const lettersTimeline = (lines, lineHeight, { fromY, duration, stagger, nextLineAt, ease, delay }) => {
  const tl = gsap.timeline({ delay })
  let start = 0
  lines.forEach((items) => {
    if (!items.length) return
    tl.from(items, { y: fromY * lineHeight, opacity: 0, duration, ease, stagger }, start)
    start += (duration + stagger * (items.length - 1)) * nextLineAt
  })
  return tl
}

// Same rhythm, but letters only fade; each line element rises as a whole while its letters appear.
// `lines` is a list of { line, items }.
export const lineRiseTimeline = (lines, lineHeight, { fromY, duration, stagger, nextLineAt, ease, delay }) => {
  const tl = gsap.timeline({ delay })
  let start = 0
  lines.forEach(({ line, items }) => {
    if (!items.length) return
    const span = duration + stagger * (items.length - 1)
    tl.from(items, { opacity: 0, duration, ease, stagger }, start)
    tl.from(line, { y: fromY * lineHeight, duration: span, ease }, start)
    start += span * nextLineAt
  })
  return tl
}

export const lineHeightOf = (el) => parseFloat(getComputedStyle(el).lineHeight)
