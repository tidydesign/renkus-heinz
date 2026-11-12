// Spaces card hover ripples (SPACES_RIPPLES), drawn on a canvas fixed to the screen under the cards.
// While a card is hovered, a wave leaves the card every so often and spreads out like rings on
// water: the card's rounded rectangle grown outwards (so its corners grow round as the wave goes).
// A wave is a few rows of particles: the middle row has the most, the rows towards the edges fewer
// (a bell curve), and the rows part a little as the wave goes. Each particle moves straight out
// from the card's centre along its own ray, so the particles part as the wave grows and never
// slide along it; the rays are spread so the particles lie evenly halfway out.
// The waves fade smoothly; the next starts while the last one still fades. Waves stay where they
// started; leaving the card lets the running ones finish. Reduced motion: none.

import { gsap } from 'gsap'
import { REDUCED_MOTION_QUERY, SPACES_RIPPLES } from '../animations/config.js'

// The card's corner radius (spaces.css)
const RADIUS = 4
// Shifts each row's particles along the outline, so the rows' particles don't line up
const GOLDEN = 0.618034

// A card's box as its centre and the half sizes of its core: the box without the rounded corners.
// The outline r px out is that core grown by r
const shapeOf = ({ left, top, right, bottom }) => ({
  cx: (left + right) / 2,
  cy: (top + bottom) / 2,
  a: (right - left) / 2 - RADIUS,
  b: (bottom - top) / 2 - RADIUS,
})

const outlineLength = ({ a, b }, r) => 4 * (a + b) + 2 * Math.PI * r

// The point at `at` (px) along the outline r px out, clockwise from the top left end of the top side
const pointAlong = ({ cx, cy, a, b }, r, at) => {
  const arc = (Math.PI / 2) * r
  const corner = (x, y, from, along) => {
    const angle = from + (along / arc) * (Math.PI / 2)
    return [cx + x + Math.cos(angle) * r, cy + y + Math.sin(angle) * r]
  }
  if (at < 2 * a) return [cx - a + at, cy - b - r]
  if ((at -= 2 * a) < arc) return corner(a, -b, -Math.PI / 2, at)
  if ((at -= arc) < 2 * b) return [cx + a + r, cy - b + at]
  if ((at -= 2 * b) < arc) return corner(a, b, 0, at)
  if ((at -= arc) < 2 * a) return [cx + a - at, cy + b + r]
  if ((at -= 2 * a) < arc) return corner(-a, b, Math.PI / 2, at)
  if ((at -= arc) < 2 * b) return [cx - a - r, cy + b - at]
  return corner(-a, -b, Math.PI, Math.min(at - 2 * b, arc))
}

// How far from the centre the ray (dx, dy) (a unit vector) meets the outline r px out
const reachOf = ({ a, b }, r, dx, dy) => {
  const x = Math.abs(dx)
  const y = Math.abs(dy)
  // A straight side
  if (x > 0 && (a + r) * y <= b * x) return (a + r) / x
  if (y > 0 && (b + r) * x <= a * y) return (b + r) / y
  // A corner: the circle of radius r around the core's corner (a, b)
  const along = x * a + y * b
  return along + Math.sqrt(Math.max(0, along * along - a * a - b * b + r * r))
}

// The rows of a wave: their place in the band (from the middle row, in rows), share of the middle
// row's particles (a bell curve) and the rays of their particles, spread evenly halfway out
const createRows = (shape) => {
  const { rows, falloff, spacing, distance } = SPACES_RIPPLES
  const middle = (rows - 1) / 2
  const r = RADIUS + distance / 2
  const length = outlineLength(shape, r)
  return Array.from({ length: rows }, (_, j) => {
    const weight = Math.exp(-0.5 * ((j - middle) / falloff) ** 2)
    const count = Math.max(1, Math.round((length / spacing) * weight))
    const shift = (j * GOLDEN) % 1
    const rays = new Float32Array(count * 2)
    for (let k = 0; k < count; k++) {
      const [x, y] = pointAlong(shape, r, ((k + shift) / count) * length)
      const dx = x - shape.cx
      const dy = y - shape.cy
      const norm = Math.hypot(dx, dy) || 1
      rays[k * 2] = dx / norm
      rays[k * 2 + 1] = dy / norm
    }
    return { place: j - middle, weight, rays }
  })
}

export function initSpacesRipples(section) {
  const canvas = section?.querySelector('.spaces__ripples')
  const context = canvas?.getContext('2d')
  if (!context) return () => {}

  const { color, interval, life, distance, rowGap, size, shrink, opacity, fadeIn } = SPACES_RIPPLES
  const ease = gsap.parseEase(SPACES_RIPPLES.ease)

  let ratio = 1
  const resize = () => {
    ratio = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(canvas.clientWidth * ratio)
    canvas.height = Math.round(canvas.clientHeight * ratio)
  }
  resize()
  window.addEventListener('resize', resize)

  let card = null
  let lastWave = -Infinity
  let waves = []
  let running = false

  const spawn = (time) => {
    const shape = shapeOf(card.getBoundingClientRect())
    waves.push({ born: time, shape, rows: createRows(shape) })
  }

  const draw = (time) => {
    if (card && time - lastWave >= interval) {
      spawn(time)
      lastWave = time
    }
    waves = waves.filter((wave) => time - wave.born < life)

    context.setTransform(ratio, 0, 0, ratio, 0, 0)
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = `rgb(${color})`
    waves.forEach(({ born, shape, rows }) => {
      const progress = (time - born) / life
      const out = ease(progress)
      // Eases in, then out smoothly all the way to the end
      const into = Math.min(1, progress / fadeIn)
      const fade = Math.sin((into * Math.PI) / 2) * Math.pow(Math.cos((progress * Math.PI) / 2), 2)
      const gap = rowGap[0] + (rowGap[1] - rowGap[0]) * out
      const scale = 1 - shrink * progress

      rows.forEach(({ place, weight, rays }) => {
        const r = Math.max(0, RADIUS + out * distance + place * gap)
        // The edge rows a little smaller and fainter than the middle one
        const radius = size * scale * (0.6 + 0.4 * weight)
        context.globalAlpha = opacity * fade * (0.5 + 0.5 * weight)
        context.beginPath()
        for (let k = 0; k < rays.length; k += 2) {
          const dx = rays[k]
          const dy = rays[k + 1]
          const reach = reachOf(shape, r, dx, dy)
          const x = shape.cx + dx * reach
          const y = shape.cy + dy * reach
          context.moveTo(x + radius, y)
          context.arc(x, y, radius, 0, Math.PI * 2)
        }
        context.fill()
      })
    })
    context.globalAlpha = 1

    // Nothing left to draw: stop until the next hover
    if (!card && !waves.length) {
      gsap.ticker.remove(tick)
      running = false
    }
  }
  const tick = (time) => draw(time)

  // The hovered card, or null
  return (next) => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return
    if (next !== card) lastWave = -Infinity
    card = next
    if (card && !running) {
      running = true
      gsap.ticker.add(tick)
    }
  }
}
