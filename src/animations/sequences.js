// Image sequences on canvases (src/assets/images/<name>/, 1920×1080 frames, PNG or WebP).
// A stage draws one or more layers at once, each a sequence at a 0–1 progress (or at a frame
// index); frames load on first use, are shared between stages, and the stages redraw as they arrive.

import { SCENE_START } from './config.js'

// Frame URLs by folder name ("scene-01-in"), in frame order
const sequences = Object.entries(
  import.meta.glob('../assets/images/*/*.{png,webp}', { eager: true, query: '?url', import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((all, [path, url]) => {
    const name = path.split('/').at(-2)
    ;(all[name] ??= []).push(url)
    return all
  }, {})

// The frames' own size: a canvas never gets more pixels than that, however large it is shown
const FRAME_WIDTH = 1920

const frames = new Map()
const redraws = new Set()

const framesOf = (name) => {
  if (!frames.has(name)) {
    frames.set(
      name,
      (sequences[name] ?? []).map((url) => {
        const img = new Image()
        img.decoding = 'async'
        // Redraw once a frame arrives, in case it is the one on show
        img.addEventListener('load', () => redraws.forEach((draw) => draw()), { once: true })
        img.src = url
        return img
      }),
    )
  }
  return frames.get(name)
}

export const sequenceLength = (name) => sequences[name]?.length ?? 0

export const preloadSequences = (names) => names.forEach(framesOf)

export const sequenceNames = Object.keys(sequences)

export const createStage = (canvas) => {
  const ctx = canvas.getContext('2d')
  let layers = []

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    layers.forEach(({ name, progress, frame }) => {
      const list = framesOf(name)
      const img = list[frame ?? Math.round(progress * (list.length - 1))]
      if (img?.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    })
  }
  redraws.add(draw)

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, SCENE_START.sequence.maxPixelRatio)
    const scale = Math.min(1, FRAME_WIDTH / (canvas.clientWidth * ratio || 1))
    canvas.width = Math.round(canvas.clientWidth * ratio * scale)
    canvas.height = Math.round(canvas.clientHeight * ratio * scale)
    draw()
  }
  resize()
  window.addEventListener('resize', resize, { passive: true })

  return {
    // Layers: [{ name: 'scene-01-in', progress: 0–1 }] or [{ name, frame: index }], bottom to top
    show(next) {
      layers = next
      draw()
    },
    clear() {
      layers = []
      draw()
    },
  }
}
