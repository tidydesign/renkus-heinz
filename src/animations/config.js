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

// Hero title on page load: letters rise from below and fade in one after another
export const HERO_TITLE = {
  // Start offset of each letter, in line heights
  fromY: 0.5,
  // One letter's rise and fade (s)
  duration: 0.5,
  // Delay (s) between neighbouring letters of a line
  stagger: 0.018,
  // The next line starts once the previous line's animation is this far through (0–1)
  nextLineAt: 0.25,
  ease: 'power1.out',
  // Wait (s) after fonts are ready
  delay: 0.1,
}

// Hero tagline and paragraph: the same letter rise as the title, one line height deep.
// Smaller letters, so a shorter step between them keeps the pace close to the title's
export const HERO_TEXT = {
  fromY: 1,
  duration: HERO_TITLE.duration,
  stagger: 0.01,
  nextLineAt: HERO_TITLE.nextLineAt,
  ease: HERO_TITLE.ease,
  delay: HERO_TITLE.delay,
}

// Hero speaker: rises from one screen height below, straight away on load (doesn't wait for fonts)
export const HERO_SPEAKER = {
  // Start offset, in screen heights
  fromY: 1,
  duration: 2,
  // Quint out: a sharp start and a long, soft landing
  ease: 'power4.out',
}

// Hero RHAON III card, starts with the title: the card is unmasked left to right, the photo
// under its own mask slightly later while it slides in from the left; the text fades in.
// The whole card also fades in over the card's duration
export const HERO_PROMO = {
  card: { duration: 0.5 },
  photo: {
    delay: 0.05,
    duration: 0.5,
    // Photo start offset, in photo widths (to the left)
    fromX: 0.5,
  },
  text: { delay: 0.15, duration: 0.4 },
  ease: HERO_TITLE.ease,
}

// Hero "Find My Sound" button, starts with the hint ("Scroll Down to Explore", animated as HERO_TEXT).
// The whole button fades in and rises like the hint's line; meanwhile it opens from a circle
// on the left to full width, the label comes in like the texts, and the arrow turns from -90° to 0°
export const HERO_BUTTON = {
  // Start offset, in button heights
  fromY: 0.5,
  expand: {
    // Starts once the button's fade and rise are this far through (0–1); 0 = together
    at: 0,
    duration: 0.6,
  },
  iconFromRotation: -90,
  ease: HERO_TITLE.ease,
}

// "Find My Sound" hover: the arrow moves down one circle height while its copy comes in from
// above, a lighter circle grows from under the icon to 220% of the button width, the shadow fades in.
// Leaving plays it backwards
export const HERO_BUTTON_HOVER = {
  duration: 0.3,
  ease: 'power1.inOut',
}

// Hero divider: grows left to right, starts with the title, same curve
export const HERO_DIVIDER = {
  duration: 1,
  ease: HERO_TITLE.ease,
}

// "Where Do You Start?" card switch on hover (src/components/start-cards.js).
// The new active card grows to fit its link and turns white; the link rises from one link height
// below, its circle fades in and grows from 0, its label fades in letter by letter.
// The card left behind shrinks back while its link fades out
export const START_CARDS = {
  // The card itself: height and white fade, both ways (s)
  cardDuration: 0.6,
  // The link: rise, circle and label (s)
  duration: 0.4,
  ease: EASE_OUT,
  // One label letter's fade (s); the letters are spread so the label finishes with the card
  letterDuration: 0.2,
  // Fade-out of the link on the card left behind (s)
  leaveFade: 0.2,
}

// Scroll from the Hero to "Where Do You Start?"
export const SCENE_START = {
  // One wheel turn, swipe or key press glides the page to the whole next (or previous) screen
  scroll: {
    duration: 1.2,
    ease: 'power3.inOut',
    // Wheel or swipe distance (px) that counts as a step — filters out jitter
    tolerance: 10,
  },
  // Parallax: while gliding down, the RHAON III card, the hint and the button rise this far
  // beyond the scroll, in RHAON III card heights
  parallax: 3,
  // The title and cards start once the glide down is this far through (0–1)
  arriveAt: 0.5,
  // Going back up, the arrivals play backwards together with the glide, sped up to be gone once
  // the glide is this far through (0–1). The sequence's last-played frames are the nearly empty
  // ones, so its objects are already gone while the Hero only starts to come into view
  leaveBy: 0.5,
  // Image sequence (src/assets/images/scene-01-in). Its first ~third of frames are almost empty,
  // so it starts with the glide (at: 0–1 of it) and the objects show up about halfway down
  sequence: { at: 0, duration: 2, maxPixelRatio: 2 },
  // On this screen the speaker and the sequence sit this far above the screen centre (screen heights)
  raise: 0.1,
  // Title: the same letter rise as the Hero title
  title: HERO_TITLE,
  // Cards slide up from below the screen, one after another
  cards: {
    duration: 0.8,
    stagger: 0.1,
    ease: 'power3.out',
  },
}
