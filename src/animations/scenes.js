// Scroll scenes of the first screens.
// The page moves by whole screens: one wheel turn, swipe or key press glides it to the next or
// previous section (native scrolling there is taken over). A scroll that bypasses that (the
// scrollbar, say) settles on the nearer section once it stops.
// Hero → "Where Do You Start?": during the glide the speaker on the fixed stage scales from
// 3 screen widths down to 1 and moves to the vertical screen centre, while the RHAON III card,
// the hint and the button rise faster than the page for a parallax (scrubbed to the scroll).
// The image sequence starts with the glide (its first frames are nearly empty, so the objects show
// up about halfway down) and plays over the speaker; halfway down the title comes in letter by
// letter like the Hero title, and the cards slide up from below the screen. On this screen the
// speaker and the sequence sit slightly above the screen centre.
// Going back up, these play backwards together with the glide but much faster, so the sequence is
// gone before the Hero comes into view.
// Scenes: card N stands for scene N (src/assets/images/scene-0N-in and -out). The arrival plays
// the active card's scene-0N-in. Hovering another card switches the scene: the old scene's "in"
// plays backwards while the new scene's "out" plays forward, both drawn on the same canvas.
// Hovers during a switch or during the arrival wait, and only the last one is played after it.

import { gsap } from 'gsap'
import { Observer } from 'gsap/Observer'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { REDUCED_MOTION_QUERY, SCENE_START } from './config.js'
import { lettersTimeline, lineHeightOf, spreadGradient } from './letters.js'
import { createStage } from './sequences.js'

gsap.registerPlugin(Observer, ScrollToPlugin, ScrollTrigger, SplitText)

// Set once the section navigation is running; see scrollToSection
let navigateTo = null

// Glides to a section the same way as the wheel does. Returns false when the navigation is off
// (reduced motion), so the caller can scroll natively
export const scrollToSection = (section) => {
  if (!navigateTo) return false
  navigateTo(section)
  return true
}

const sceneName = (index, part) => `scene-${String(index + 1).padStart(2, '0')}-${part}`

// Scene switching on the stage for the cards; returns the arrival tween (the active scene's "in")
// and a hook to settle a running switch before the arrival plays backwards
const createScenes = (stage, list, reducedMotion) => {
  const cards = [...list.querySelectorAll('.start__card')]
  let active = Math.max(0, cards.findIndex((card) => card.classList.contains('is-active')))
  // The scene of the last hovered card
  let wanted = active
  let switching = null

  const introState = { progress: 0 }
  const showIntro = () => stage.show([{ name: sceneName(active, 'in'), progress: introState.progress }])

  const switchTo = (index) => {
    wanted = index
    if (switching || index === active) return
    // Not on the section yet: the arrival will simply play this scene
    if (introState.progress === 0 && !intro?.isActive()) {
      active = index
      if (reducedMotion) showIntro()
      return
    }
    // Arrival still running: its end picks up the wanted scene
    if (intro && (intro.progress() < 1 || intro.reversed())) return
    if (reducedMotion) {
      active = index
      showIntro()
      return
    }

    const from = active
    const state = { progress: 0 }
    switching = gsap.to(state, {
      progress: 1,
      duration: SCENE_START.switch.duration,
      ease: SCENE_START.switch.ease,
      onUpdate: () =>
        stage.show([
          { name: sceneName(from, 'in'), progress: 1 - state.progress },
          { name: sceneName(index, 'out'), progress: state.progress },
        ]),
      onComplete: () => {
        active = index
        switching = null
        switchTo(wanted)
      },
    })
  }

  const intro = reducedMotion
    ? null
    : gsap.to(introState, {
        progress: 1,
        duration: SCENE_START.sequence.duration,
        ease: SCENE_START.sequence.ease,
        paused: true,
        onUpdate: showIntro,
        onComplete: () => switchTo(wanted),
      })

  list.addEventListener('start:select', (event) => switchTo(event.detail.index))

  // The active scene's arrival first, the rest once the page has loaded
  stage.preload([sceneName(active, 'in')])
  const preloadRest = () => stage.preload(stage.names)
  if (document.readyState === 'complete') preloadRest()
  else window.addEventListener('load', preloadRest, { once: true })

  return {
    intro,
    // Reduced motion: the active scene's last frame on or off
    showStill: (visible) => {
      introState.progress = visible ? 1 : 0
      showIntro()
    },
    // Before the arrival plays backwards: jump a running switch to the wanted scene
    settle: () => {
      if (!switching) return
      switching.kill()
      switching = null
      active = wanted
    },
  }
}

// The speaker's start position comes from stage.css; this is the move to the end position
const speakerTween = (wrap) =>
  gsap.fromTo(
    wrap,
    { scale: 1, y: 0 },
    {
      scale: 1 / 3,
      // From the Hero position (centre 32px + 60% of the screen) to the screen centre, raised
      y: () => -(32 + window.innerHeight * (0.1 + SCENE_START.raise)),
      ease: 'none',
      immediateRender: false,
    },
  )

const titleTimeline = (title) => {
  const accent = title.querySelector('.text-gradient')
  const split = SplitText.create(title, { type: 'words, chars', charsClass: 'split-char' })
  if (accent) spreadGradient(accent, split.chars.filter((char) => accent.contains(char)))
  // One line: all letters in a row
  return lettersTimeline([split.chars], lineHeightOf(title), { ...SCENE_START.title, delay: 0 })
}

export function initScenes() {
  const hero = document.querySelector('.hero')
  const start = document.querySelector('.start')
  const wrap = document.querySelector('.stage__speaker-wrap')
  const canvas = document.querySelector('.stage__sequence')
  if (!hero || !start) return

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches

  // A reload would otherwise land between two screens; the page starts at the Hero intro
  // (ScrollTrigger manages history.scrollRestoration itself, so it is set through ScrollTrigger)
  if (!reducedMotion) {
    ScrollTrigger.clearScrollMemory('manual')
    window.scrollTo(0, 0)
  }

  // Scrubbed over the scroll from the Hero to the next section: the speaker, and the parallax
  // of the Hero's lower corners (their containers, the intro animates what is inside)
  const promo = hero.querySelector('.hero__promo')
  const corners = [promo, hero.querySelector('.hero__actions')].filter(Boolean)
  const scrub = gsap.timeline()
  if (wrap) scrub.add(speakerTween(wrap), 0)
  if (corners.length && !reducedMotion) {
    scrub.fromTo(
      corners,
      { y: 0 },
      { y: () => -SCENE_START.parallax * (promo?.offsetHeight ?? 0), ease: 'none', immediateRender: false },
      0,
    )
  }

  ScrollTrigger.create({
    trigger: hero,
    // The page top, not the Hero top: the header sits above the Hero in the flow
    start: 0,
    endTrigger: start,
    end: 'top top',
    scrub: true,
    animation: scrub,
    invalidateOnRefresh: true,
  })

  const list = start.querySelector('.start__cards')
  const scenes = canvas && list && createScenes(createStage(canvas), list, reducedMotion)

  if (reducedMotion) {
    // No arrival motion and native scrolling: the active scene shows its last frame once reached
    if (scenes) {
      ScrollTrigger.create({
        trigger: start,
        start: 'top center',
        onToggle: (self) => scenes.showStill(self.isActive || self.progress > 0),
      })
    }
    return
  }

  const arrival = gsap.timeline({ paused: true })

  const title = start.querySelector('.start__title')
  if (title) document.fonts.ready.then(() => arrival.add(titleTimeline(title), 0))

  const cards = start.querySelectorAll('.start__card')
  if (cards.length) {
    const { duration, stagger, ease } = SCENE_START.cards
    arrival.from(
      cards,
      {
        // From just below the screen bottom (the section fills the screen once reached)
        y: (i, card) => start.offsetHeight - card.offsetTop,
        duration,
        stagger,
        ease,
      },
      0,
    )
  }

  const intro = scenes?.intro

  initNavigation([
    // The Hero's screen starts at the page top, above the header
    { el: hero, top: () => 0 },
    {
      el: start,
      beforeLeave: scenes?.settle,
      // Each starts this far through the glide down (0–1)
      arrivals: [
        { animation: intro, at: SCENE_START.sequence.at },
        { animation: arrival, at: SCENE_START.arriveAt },
      ].filter((item) => item.animation),
    },
  ])
}

// Whole-screen navigation between the scenes; each may have arrival animations that play on the
// way down into it and play backwards before leaving it upwards
const initNavigation = (scenes) => {
  const { duration, ease, tolerance } = SCENE_START.scroll
  const topOf = (scene) => (scene.top ? scene.top() : scene.el.getBoundingClientRect().top + window.scrollY)

  let current = 0
  let busy = false

  const glide = (scene) =>
    gsap.to(window, { scrollTo: { y: () => topOf(scene), autoKill: false }, duration, ease })

  const goTo = (index) => {
    index = gsap.utils.clamp(0, scenes.length - 1, index)
    if (busy || index === current) return
    busy = true

    const from = scenes[current]
    const to = scenes[index]
    const tl = gsap.timeline({
      onComplete: () => {
        current = index
        busy = false
      },
    })

    if (index > current) {
      tl.add(glide(to))
      to.arrivals?.forEach(({ animation, at }) => tl.call(() => animation.timeScale(1).play(), null, duration * at))
    } else {
      from.beforeLeave?.()
      // The arrivals play backwards while gliding, fast enough to be gone early in the glide
      const leaveIn = duration * SCENE_START.leaveBy
      from.arrivals?.forEach(({ animation }) => {
        if (animation.time() > 0) animation.timeScale(animation.time() / leaveIn).reverse()
      })
      tl.add(glide(to))
    }
  }

  navigateTo = (el) => {
    const index = scenes.findIndex((scene) => scene.el === el)
    if (index >= 0) goTo(index)
  }

  Observer.create({
    target: window,
    type: 'wheel,touch',
    // Content moving up (wheel down, swipe up) is "up" for Observer
    wheelSpeed: -1,
    tolerance,
    preventDefault: true,
    onUp: () => goTo(current + 1),
    onDown: () => goTo(current - 1),
  })

  const keySteps = { ArrowDown: 1, PageDown: 1, ArrowUp: -1, PageUp: -1 }
  window.addEventListener('keydown', (event) => {
    if (event.target.closest('input, textarea, select, [contenteditable]')) return
    let step = keySteps[event.key]
    if (event.key === ' ' && !event.target.closest('button, a')) step = event.shiftKey ? -1 : 1
    if (event.key === 'Home') step = -scenes.length
    if (event.key === 'End') step = scenes.length
    if (!step) return
    event.preventDefault()
    goTo(current + step)
  })

  // A scroll that bypassed the navigation (scrollbar, focus, find in page): settle on the nearer scene
  ScrollTrigger.addEventListener('scrollEnd', () => {
    if (busy) return
    const y = window.scrollY
    const distances = scenes.map((scene) => Math.abs(topOf(scene) - y))
    const nearest = distances.indexOf(Math.min(...distances))
    if (nearest !== current) goTo(nearest)
    else if (distances[nearest] > 1) {
      busy = true
      glide(scenes[nearest]).eventCallback('onComplete', () => (busy = false))
    }
  })
}
