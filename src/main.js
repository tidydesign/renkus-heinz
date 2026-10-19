import './styles/tokens.css'
import './styles/base.css'
import './styles/display-title.css'
import './styles/header.css'
import './styles/hero.css'
import './styles/who.css'
import './styles/people.css'
import './styles/team.css'
import './styles/button.css'
import './styles/identity.css'
import './styles/next-step.css'
import './styles/footer.css'
import './styles/text-reveal.css'

import { initHeader } from './animations/header.js'
import { initHeroIntro } from './animations/hero.js'
import { initPeopleTitle } from './animations/people.js'
import { initTextReveal } from './animations/text-reveal.js'
import { initFooterAccordion } from './components/footer-accordion.js'

initHeader()
initHeroIntro()
initTextReveal(document.querySelector('.who__content'), '.who__title, .who__text')
initPeopleTitle()
initFooterAccordion()
