import './styles.css'
import Game from './game'

const DEFAULT_DPI_MULTIPLIER = 2

const main = () => {
  const canvas = document.getElementById('playground')

  // Make canvas dimension bigger than css dimension to increase resolution
  canvas.width = canvas.clientWidth * DEFAULT_DPI_MULTIPLIER
  canvas.height = canvas.clientHeight * DEFAULT_DPI_MULTIPLIER

  // Create and start the game
  const game = new Game(canvas)
  document.addEventListener('keydown', (e) => game.handleKeyEvents(e))
  game.start()
}

window.onload = main
