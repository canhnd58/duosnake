import { round } from '../util'

import {
  CELL_SNAKE_HEAD,
  CELL_SNAKE_BODY,
  CELL_FOOD,
  CELL_CORPSE,
  DIRECTION_DIFF_X,
  DIRECTION_DIFF_Y,
} from '../const'

const STOMACH_STEAL_MULTIPLIER = 2
const STOMACH_VALUES = {
  [CELL_FOOD]: 1,
  [CELL_CORPSE]: 0.25,
}

const SANITY_STEAL_MULTIPLIER = 5
const SANITY_VALUES = {
  [CELL_FOOD]: 0.1,
  [CELL_CORPSE]: 0.01,
  [CELL_SNAKE_BODY]: 0.4,
}

const Snake = class {
  constructor() {
    this.body = []
    this.stomach = 0
    this.sanity = 1
  }

  toDebugStr() {
    return `snake=${this.id} len=${this.body.length} stomach=${this.stomach} sanity=${this.sanity}`
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

  fillStomach(diff) {
    this.stomach += diff
    this.stomach = round(this.stomach)
  }

  fillSanity(diff) {
    this.sanity += diff
    this.sanity = Math.min(1, this.sanity)
    this.sanity = Math.max(-1, this.sanity)
    this.sanity = round(this.sanity)
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
      this.fillStomach(-1)
    }
  }

  eat(type) {
    if (type == null) {
      ;[CELL_FOOD, CELL_CORPSE].forEach((t) => this.eat(t))
      return
    }

    const headCell = this.board.at(this.getHead())
    const cnts = headCell.getAndGroup(type, [
      this.board.getNoOwnerId(),
      this.id,
    ])
    this.fillStomach(
      (cnts[this.board.getNoOwnerId()] +
        cnts[this.id] +
        cnts['other'] * STOMACH_STEAL_MULTIPLIER) *
        STOMACH_VALUES[type]
    )

    headCell
      .getOwnerIds(type)
      .filter((id) => this.isStealing(id))
      .map((id) => this.board.getSnake(id))
      .forEach((otherSnake) =>
        otherSnake.fillSanity(
          -SANITY_VALUES[type] *
            headCell.get(type, otherSnake.id) *
            SANITY_STEAL_MULTIPLIER
        )
      )
  }

  enjoy(type) {
    if (type == null) {
      ;[CELL_FOOD, CELL_CORPSE].forEach((t) => this.enjoy(t))
      return
    }
    this.fillSanity(
      this.board.at(this.getHead()).get(type) * SANITY_VALUES[type]
    )
  }

  bite(type) {
    if (type == null) {
      ;[CELL_SNAKE_HEAD, CELL_SNAKE_BODY].forEach((t) => this.bite(t))
      return
    }
    const headCell = this.board.at(this.getHead())
    headCell
      .getOwnerIds(type)
      .filter((id) => this.isStealing(id))
      .forEach((id) => {
        const otherSnake = this.board.getSnake(id)
        const bodyIdx = otherSnake.indexOf(this.getHead())
        otherSnake.turnIntoCorpse(bodyIdx + 1)
        if (type == CELL_SNAKE_BODY) {
          headCell.remove(CELL_SNAKE_BODY, otherSnake.id, 1)
          otherSnake.body.pop()
        }
        otherSnake.fillSanity(
          -SANITY_VALUES[CELL_SNAKE_BODY] * SANITY_STEAL_MULTIPLIER
        )
      })
  }

  isStealing(id) {
    return id != this.id && id != this.board.getNoOwnerId()
  }

  indexOf({ x, y }) {
    return this.body.findIndex((pos) => pos.x == x && pos.y == y)
  }

  turnIntoCorpse(startIdx) {
    for (let i = startIdx; i < this.body.length; i++) {
      const pos = this.body[i]
      this.board.at(pos).add(CELL_CORPSE, this.id)
      this.board.at(pos).remove(CELL_SNAKE_BODY, this.id, 1)
    }
    this.body.splice(startIdx)
  }

  getNewPos({ x, y }, direction) {
    const { w, h } = this.board.getDim()
    return {
      x: (x + w + DIRECTION_DIFF_X[direction]) % w,
      y: (y + h + DIRECTION_DIFF_Y[direction]) % h,
    }
  }
}

export default Snake
