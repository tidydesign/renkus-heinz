// All animation timings and easings live here.

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

// Default easing: cubic-bezier(.16, 1, .3, 1)
export const EASE_OUT = CustomEase.create('ease-out-expo', '0.16, 1, 0.3, 1')
// Softer ease-out (easeOutCubic) for long moves that must stay visible to the end
export const EASE_OUT_SOFT = CustomEase.create('ease-out-cubic', '0.33, 1, 0.68, 1')
// CSS keyword equivalent: ease-in-out
export const EASE_IN_OUT = CustomEase.create('ease-in-out', '0.42, 0, 0.58, 1')

export const DURATION = {
  fast: 0.4,
  base: 0.5,
  slow: 0.7,
}

export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

export const HEADER = {
  duration: DURATION.base,
  ease: EASE_OUT,
  // Scroll distance (px) in one direction before the header reacts — filters out jitter
  tolerance: 8,
}

export const HERO_INTRO = {
  photo: {
    fromScale: 1.2,
    duration: DURATION.slow,
    ease: EASE_IN_OUT,
  },
  // Text block scales as a whole (so the gaps between lines scale too),
  // while the lines fade in one after another
  text: {
    fromScale: 1.5,
    // Fade-in of each line
    duration: 0.6,
    // Delay between lines
    stagger: 0.2,
    ease: EASE_OUT,
    // Block scale runs through all lines, so it uses a softer curve
    scaleEase: EASE_OUT_SOFT,
    // Delay after the photo starts
    delay: 0.15,
  },
  // Max wait (s) for the photo and fonts before the intro starts anyway
  maxWait: 2,
}

// Pinned title screens ("What we stand for", "The people behind the sound"): once the title
// reaches the viewport centre, the second line grows from the first line's size and weight to its own
export const TITLE_GROW = {
  duration: DURATION.slow,
  ease: EASE_OUT,
}

// "Who we are" photo strip: endless right-to-left marquee
export const MARQUEE = {
  // Time for the strip to move by one photo plus its gap, on every device
  secondsPerPhoto: 8,
  // Rebuild delay after a resize (ms)
  resizeDebounce: 200,
}

// Scroll-driven text fill: lines fill left to right, one after another
export const TEXT_REVEAL = {
  // ScrollTrigger positions: "<element edge> <viewport edge>"
  // Start when the whole text is on screen: bottom of the last text element hits the viewport bottom
  start: 'bottom bottom',
  // End when the text section is vertically centred in the viewport
  end: 'center center',
  // Catch-up time (s): after scrolling stops, the fill keeps going and slows down to a stop
  scrub: 1,
}
