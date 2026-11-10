import './styles/base.css'
import './styles/header.css'
import './styles/split.css'
import './styles/stage.css'
import './styles/hero.css'
import './styles/start.css'
import './styles/why-us.css'
import './styles/spaces.css'
import './styles/pill-link.css'
import './styles/button-hover.css'
import './styles/products.css'
import './styles/about.css'
import './styles/cases.css'
import './styles/contact.css'
import './styles/footer.css'

import { initHeader } from './animations/header.js'
import { initHeroButton } from './components/hero-button.js'
import { initHeroPromo } from './components/hero-promo.js'
import { initStartCards } from './components/start-cards.js'
import { initSpacesCards } from './components/spaces-cards.js'
import { initProductsCards } from './components/products-cards.js'
import { initHeroIntro } from './animations/hero-intro.js'
import { initScenes } from './animations/scenes.js'
import { initProducts } from './animations/products.js'
import { initAbout } from './animations/about.js'
import { initCases } from './animations/cases.js'
import { initContact } from './animations/contact.js'
import { initButtonHovers } from './components/button-hover.js'
import { initFooterLinks } from './components/footer-links.js'
import { REDUCED_MOTION_QUERY } from './animations/config.js'

initHeader()
initHeroButton()
initHeroPromo()
initStartCards()
initSpacesCards()
initProductsCards()
initHeroIntro()
initScenes()
const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches
initProducts(reducedMotion)
initAbout(reducedMotion)
initCases(reducedMotion)
initButtonHovers()
initFooterLinks()
initContact(reducedMotion)
