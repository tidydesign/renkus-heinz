import './styles/base.css'
import './styles/header.css'
import './styles/split.css'
import './styles/stage.css'
import './styles/hero.css'
import './styles/start.css'

import { initHeader } from './animations/header.js'
import { initHeroButton } from './components/hero-button.js'
import { initHeroIntro } from './animations/hero-intro.js'
import { initScenes } from './animations/scenes.js'

initHeader()
initHeroButton()
initHeroIntro()
initScenes()
