import './styles/base.css'
import './styles/header.css'
import './styles/split.css'
import './styles/stage.css'
import './styles/hero.css'
import './styles/start.css'

import { initHeader } from './animations/header.js'
import { initHeroButton } from './components/hero-button.js'
import { initHeroPromo } from './components/hero-promo.js'
import { initStartCards } from './components/start-cards.js'
import { initHeroIntro } from './animations/hero-intro.js'
import { initScenes } from './animations/scenes.js'

initHeader()
initHeroButton()
initHeroPromo()
initStartCards()
initHeroIntro()
initScenes()
