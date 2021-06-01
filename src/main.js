import './styles.css'
import Game from './game'
import * as consts from './const'

const DEFAULT_DPI_MULTIPLIER = 2

const main = () => {
  const canvas = document.getElementById('playground')

  // Make canvas dimension bigger than css dimension to increase resolution
  canvas.width = canvas.clientWidth * DEFAULT_DPI_MULTIPLIER
  canvas.height = canvas.clientHeight * DEFAULT_DPI_MULTIPLIER

  // Create and start the game
  const game = new Game(canvas, consts.GAME_MODE_CASUAL)
  game.start()

  // Expose game object and all the constants to the console
  Object.keys(consts).forEach((k) => (window[k] = consts[k]))
  window.game = game
}

window.onload = main
