import { round } from '../../util'

import {
  CELL_SNAKE_HEAD,
  CELL_SNAKE_BODY,
  CELL_FOOD,
  DIRECTION_DIFF_X,
  DIRECTION_DIFF_Y,
} from '../../const'

const STOMACH_VALUES = {
  [CELL_FOOD]: 1,
}

const ClassicSnake = class {
  constructor() {
    this.body = []
    this.stomach = 0
    this.dead = false
  }

  // called when the snake is added to a board
  prepare() {}

  toDebugStr() {
    return `${this.id}: ${this.body.length}(len)`
  }

  getHead() {
    return this.body[0]
  }

  getTail() {
    return this.body[this.body.length - 1]
  }

  setDirection(direction) {
    if (this.direction != direction && this.direction + direction != 3) {
      this.direction = direction
      return true
    }
    return false
  }

  adjustStomach(diff) {
    this.stomach += diff
    this.stomach = round(this.stomach)
  }

  move() {
    const head = this.getHead()
    this.board.at(head).remove(CELL_SNAKE_HEAD, this.id)
    if (this.body.length > 1) {
      this.board.at(head).add(CELL_SNAKE_BODY, this.id)
    }

    const newHead = this.getNewPos(head, this.direction)
    this.board.at(newHead).add(CELL_SNAKE_HEAD, this.id)
    this.body.unshift(newHead)
  }

  grow() {
    if (this.stomach < 1) {
      const tail = this.getTail()
      this.board.at(tail).remove(CELL_SNAKE_BODY, this.id, 1)
      this.body.pop()
    } else {
      this.adjustStomach(-1)
    }
  }

  eat() {
    const headCell = this.board.at(this.getHead())
    this.adjustStomach(
      (headCell.get(CELL_FOOD, this.id) +
        headCell.get(CELL_FOOD, this.board.getNoOwnerId())) *
        STOMACH_VALUES[CELL_FOOD]
    )
  }

  bite() {
    const headCell = this.board.at(this.getHead())
    if (
      headCell.get(CELL_SNAKE_HEAD) > headCell.get(CELL_SNAKE_HEAD, this.id) ||
      headCell.get(CELL_SNAKE_BODY) > 0
    ) {
      this.dead = true
    }
  }

  getNewPos({ x, y }, direction) {
    const { w, h } = this.board.getDim()
    return {
      x: (x + w + DIRECTION_DIFF_X[direction]) % w,
      y: (y + h + DIRECTION_DIFF_Y[direction]) % h,
    }
  }
}

export default ClassicSnake
