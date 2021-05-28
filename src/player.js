import Snake from './logic/snake'

const DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE = 4

const Player = class {
  constructor(keyCtrl) {
    this.keyCtrl = keyCtrl
    this.directionQueue = []
  }

  join(board) {
    this.snake = new Snake()
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
