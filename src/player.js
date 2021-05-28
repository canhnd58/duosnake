import { createSnake } from './logic/snake'
import {
  GAME_MODE_ADVENTURE,
  GAME_MODE_CLASSIC,
  SNAKE_TYPE_CLASSIC,
  SNAKE_TYPE_SENSITIVE,
} from './const'

const DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE = 4

const GAME_MODE_TO_SNAKE_TYPE = {
  [GAME_MODE_CLASSIC]: SNAKE_TYPE_CLASSIC,
  [GAME_MODE_ADVENTURE]: SNAKE_TYPE_SENSITIVE,
}

const Player = class {
  constructor(keyCtrl) {
    this.keyCtrl = keyCtrl
    this.directionQueue = []
  }

  join(board, mode) {
    this.snake = createSnake(GAME_MODE_TO_SNAKE_TYPE[mode])
    board.addSnake(this.snake)
  }

  move() {
    while (
      this.directionQueue.length > 0 &&
      !this.snake.setDirection(this.directionQueue[0])
    ) {
      this.directionQueue.shift()
    }
  }

  handleKeyEvents(e) {
    if (Object.keys(this.keyCtrl).includes(e.key)) {
      const direction = this.keyCtrl[e.key]
      if (
        this.directionQueue.push(direction) >
        DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE
      ) {
        this.directionQueue.shift()
      }
    }
  }
}

export default Player
