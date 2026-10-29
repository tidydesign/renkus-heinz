// Image sequences on the stage canvas (src/assets/images/scene-*/, 1920×1080 transparent PNGs).
// The stage draws one or more layers at once, each a sequence at a 0–1 progress; frames load on
// first use, and the canvas redraws as they arrive.

import { SCENE_START } from './config.js'

// Frame URLs by folder name ("scene-01-in"), in frame order
const sequences = Object.entries(
  import.meta.glob('../assets/images/scene-*/*.png', { eager: true, query: '?url', import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b))
  .reduce((all, [path, url]) => {
    const name = path.split('/').at(-2)
    ;(all[name] ??= []).push(url)
    return all
  }, {})

export const createStage = (canvas) => {
  const ctx = canvas.getContext('2d')
  const frames = new Map()
  let layers = []

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    layers.forEach(({ name, progress }) => {
      const list = framesOf(name)
      const img = list[Math.round(progress * (list.length - 1))]
      if (img?.complete && img.naturalWidth) ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
    })
  }

  const framesOf = (name) => {
    if (!frames.has(name)) {
      frames.set(
        name,
        (sequences[name] ?? []).map((url) => {
          const img = new Image()
          img.decoding = 'async'
          // Redraw once a frame arrives, in case it is the one on show
          img.addEventListener('load', draw, { once: true })
          img.src = url
          return img
        }),
      )
    }
    return frames.get(name)
  }

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, SCENE_START.sequence.maxPixelRatio)
    canvas.width = Math.round(canvas.clientWidth * ratio)
    canvas.height = Math.round(canvas.clientHeight * ratio)
    draw()
  }
  resize()
  window.addEventListener('resize', resize, { passive: true })

  return {
    // Layers: [{ name: 'scene-01-in', progress: 0–1 }], drawn bottom to top
    show(next) {
      layers = next
      draw()
    },
    preload: (names) => names.forEach(framesOf),
    names: Object.keys(sequences),
  }
}
