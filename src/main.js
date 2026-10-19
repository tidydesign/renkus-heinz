import './styles/tokens.css'
import './styles/base.css'
import './styles/display-title.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/who.css'
import './styles/title-screen.css'
import './styles/values.css'
import './styles/mission.css'
import './styles/pin-stack.css'
import './styles/team.css'
import './styles/button.css'
import './styles/identity.css'
import './styles/next-step.css'
import './styles/footer.css'
import './styles/text-reveal.css'
import './styles/parallax.css'
import './styles/expand-mask.css'

import { initHeader } from './animations/header.js'
import { initHeroIntro } from './animations/hero.js'
import { initTitleGrow } from './animations/title-grow.js'
import { initTextReveal } from './animations/text-reveal.js'
import { initMarquee } from './animations/marquee.js'
import { initParallax } from './animations/parallax.js'
import { initSectionExpand } from './animations/expand.js'
import { initFooterAccordion } from './components/footer-accordion.js'

initHeader()
initHeroIntro()
initTextReveal(document.querySelector('.who__content'), '.who__title, .who__text')
initParallax()
initSectionExpand()
initMarquee(document.querySelector('.who__gallery'))
initTitleGrow()
initFooterAccordion()
