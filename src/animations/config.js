// All animation timings and easings live here.

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'

gsap.registerPlugin(CustomEase)

// Default easing: cubic-bezier(.16, 1, .3, 1)
export const EASE_OUT = CustomEase.create('ease-out-expo', '0.16, 1, 0.3, 1')

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
    duration: 1,
    ease: CustomEase.create('hero-photo', '0.26, 1, 0.48, 1'),
  },
  // Three text layers start together. Each scales around the centre of the text block,
  // so the gaps between the layers scale too
  text: {
    fromScale: 2,
    scaleEase: CustomEase.create('hero-text-scale', '0.84, 0, 0.16, 1'),
    opacityEase: CustomEase.create('hero-text-opacity', '0.76, 0, 0.64, 1'),
    // Duration (s) per layer
    durations: {
      lead: 0.66,
      main: 0.83,
      text: 1,
    },
    // Delay after the photo starts
    delay: 0.02,
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

// Mission and A California Identity (Laptop and up): the photo mask expands from 12 columns
// to the full width once 75% of the section is on screen — same timing and curve as the title grow
export const SECTION_EXPAND = {
  columns: 12,
  // ScrollTrigger start: the point 75% down the section reaches the viewport bottom
  start: '75% bottom',
  duration: TITLE_GROW.duration,
  ease: TITLE_GROW.ease,
  media: '(min-width: 1200px)',
}

// Parallax backgrounds (Hero, A California Identity, Mission). The travel distance comes from
// the CSS token --parallax-offset (the extra photo height above and below the section).
export const PARALLAX = {
  // true = locked to the scroll position, a number = smoothing in seconds
  scrub: true,
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
