// Footer link groups: an accordion on Mobile (all groups collapsed by default),
// always-expanded columns from Tablet up.
// Markup ships every group open, so without JS all links stay reachable.

const TABLET_UP = '(min-width: 640px)'

export function initFooterAccordion() {
  const groups = [...document.querySelectorAll('.footer-links')]
  if (!groups.length) return

  const tabletUp = window.matchMedia(TABLET_UP)

  const sync = () => {
    groups.forEach((group) => {
      group.open = tabletUp.matches
      const summary = group.querySelector('summary')
      if (tabletUp.matches) summary.setAttribute('tabindex', '-1')
      else summary.removeAttribute('tabindex')
    })
  }

  // From Tablet up the group titles are plain labels and must not collapse the lists
  groups.forEach((group) => {
    group.querySelector('summary').addEventListener('click', (event) => {
      if (tabletUp.matches) event.preventDefault()
    })
  })

  // Re-sync only when the breakpoint is actually crossed. The resize check backs up
  // the media query "change" event, which some emulated viewports do not fire.
  let wasTabletUp = tabletUp.matches
  const onBreakpointChange = () => {
    if (tabletUp.matches === wasTabletUp) return
    wasTabletUp = tabletUp.matches
    sync()
  }

  sync()
  tabletUp.addEventListener('change', onBreakpointChange)
  window.addEventListener('resize', onBreakpointChange, { passive: true })
}
