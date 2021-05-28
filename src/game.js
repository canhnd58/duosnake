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

    this.reset()
  }

  reset() {
    this.board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS)
    this.palette = new Palette(DEFAULT_COLORS)

    this.player_1.join(this.board, this.mode)
    this.player_2.join(this.board, this.mode)

    this.speed = INITIAL_GAME_SPEED
    this.lastMove = 0
    this.startTime = null
  }

  start() {
    this.board.generate(CELL_FOOD)
    this.loop()
  }

  loop() {
    const redraw = () => {
      if (this.gameover()) {
        this.reset()
        this.board.generate(CELL_FOOD)
      }

      if (this.startTime == null) {
        this.startTime = performance.now()
      }

      const elapsed = performance.now() - this.startTime
      const nextMove = this.lastMove + DEFAULT_NEXT_MOVE_DELAY / this.speed

      // TODO: Issue occurs when the tab loses user's focus for a while
      if (elapsed >= nextMove) {
        this.player_1.move()
        this.player_2.move()
        this.board.tick()
        this.lastMove = nextMove
      }

      draw(this.canvas, this.board, this.palette)
      window.requestAnimationFrame(redraw)
    }

    window.requestAnimationFrame(redraw)
  }

  gameover() {
    return this.board.snakes.some((snake) => snake.dead)
  }

  handleKeyEvents(e) {
    this.player_1.handleKeyEvents(e)
    this.player_2.handleKeyEvents(e)
  }
}

export default Game
