import Board from './logic/board'
import Palette from './ui/palette'
import { draw } from './ui/graphic'
import Player from './player'

import {
  CELL_FOOD,
  DIRECTION_UP,
  DIRECTION_DOWN,
  DIRECTION_LEFT,
  DIRECTION_RIGHT,
} from './const'

const DEFAULT_NCOLS = 45
const DEFAULT_NROWS = 27

const DEFAULT_NEXT_MOVE_DELAY = 1000 // ms

const INITIAL_GAME_SPEED = 4

const DEFAULT_COLORS = [
  'rgb(244, 208, 63)', // yellow
  'rgb(30, 130, 76)', // green
  'rgb(214, 69, 65)', // red
]

const PLAYER_KEY_CTRLS = [
  {
    w: DIRECTION_UP,
    s: DIRECTION_DOWN,
    a: DIRECTION_LEFT,
    d: DIRECTION_RIGHT,
  },
  {
    o: DIRECTION_UP,
    l: DIRECTION_DOWN,
    k: DIRECTION_LEFT,
    ';': DIRECTION_RIGHT,
  },
]

const Game = class {
  constructor(canvas, mode) {
    this.canvas = canvas
    this.mode = mode

    this.player_1 = new Player(PLAYER_KEY_CTRLS[0])
    this.player_2 = new Player(PLAYER_KEY_CTRLS[1])

    this.quit = false
    this.reset()

    this.pauseHandler = this.pause.bind(this)
    this.unpauseHandler = this.unpause.bind(this)
    this.keydownHandler = this.handleKeyEvents.bind(this)

    window.addEventListener('focus', this.unpauseHandler)
    window.addEventListener('blur', this.pauseHandler)
    window.addEventListener('keydown', this.keydownHandler)

    this.animationRequestId = null
  }

  finalize() {
    // This method must be called manually
    this.quit = true
    window.removeEventListener('focus', this.unpauseHandler)
    window.removeEventListener('blur', this.pauseHandler)
    window.removeEventListener('keydown', this.keydownHandler)
  }

  reset() {
    this.board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS)
    this.palette = new Palette(DEFAULT_COLORS)

    this.player_1.join(this.board, this.mode)
    this.player_2.join(this.board, this.mode)

    draw(this.canvas, this.board, this.palette)

    this.speed = INITIAL_GAME_SPEED
    this.lastMove = 0
    this.startTime = null
    this.pauseTime = null
    this.unpauseTime = null

    if (this.animationRequestId) {
      window.cancelAnimationFrame(this.animationRequestId)
    }
  }

  start() {
    if (this.startTime == null) {
      this.board.generate(CELL_FOOD)
      this.loop()
    }
  }

  loop() {
    const redraw = () => {
      if (this.quit || this.pausing()) {
        window.cancelAnimationFrame(this.animationRequestId)
        return
      }

      if (this.gameover()) {
        this.reset()
        this.start()
      }

      if (this.startTime == null) {
        this.startTime = performance.now()
      }

      const elapsed = performance.now() - this.startTime
      const paused = this.unpauseTime - this.pauseTime || 0
      const nextMove =
        this.lastMove + paused + DEFAULT_NEXT_MOVE_DELAY / this.speed

      if (elapsed >= nextMove) {
        this.player_1.move()
        this.player_2.move()
        this.board.tick()
        this.lastMove = nextMove
        this.pauseTime = null
        this.unpauseTime = null
      }

      draw(this.canvas, this.board, this.palette)
      this.animationRequestId = window.requestAnimationFrame(redraw)
    }

    this.animationRequestId = window.requestAnimationFrame(redraw)
  }

  gameover() {
    return this.board.snakes.some((snake) => snake.dead)
  }

  pausing() {
    return (
      this.pauseTime != null &&
      (this.unpauseTime == null || this.unpauseTime <= this.pauseTime)
    )
  }

  pause() {
    this.pauseTime = performance.now()
    console.log('pause')
  }

  unpause() {
    if (this.pauseTime != null) {
      this.unpauseTime = performance.now()
      this.loop()
      console.log('unpause')
    }
  }

  handleKeyEvents(e) {
    this.player_1.handleKeyEvents(e)
    this.player_2.handleKeyEvents(e)
  }
}

export default Game
