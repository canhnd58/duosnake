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

const INITIAL_SELF_LOVE = 0.3
const LOVE_STEAL_MULTIPLIER = 5
const LOVE_VALUES = {
  [CELL_FOOD]: 0.1,
  [CELL_CORPSE]: 0.01,
  [CELL_SNAKE_BODY]: 0.4,
}

const Snake = class {
  constructor() {
    this.body = []
    this.stomach = 0
    this.love = {}
  }

  // called when the snake is added to a board
  prepare() {
    this.love[this.id] = INITIAL_SELF_LOVE
  }

  toDebugStr() {
    const loveStr =
      Object.keys(this.love)
        .map((id) => `${this.love[id].toString().padStart(5)}(love-${id})`)
        .join(' ') || ''
    return `${this.id}: ${this.body.length}(len) ${loveStr}`
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

  getLove(who) {
    return this.love[who] || 0
  }

  adjustLove(who, diff) {
    this.love[who] = this.getLove(who) + diff
    this.love[who] = Math.min(1, this.love[who])
    this.love[who] = Math.max(-1, this.love[who])
    this.love[who] = round(this.love[who])
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
    this.adjustStomach(
      (cnts[this.board.getNoOwnerId()] +
        cnts[this.id] +
        cnts['other'] * STOMACH_STEAL_MULTIPLIER) *
        STOMACH_VALUES[type]
    )

    // Stealing others' food makes oneself hated
    // Do what you are supposed to do, others will continue to love you
    this.board.getOtherSnakes(this.id).forEach((snake) => {
      snake.adjustLove(
        this.id,
        -LOVE_VALUES[type] *
          headCell.get(type, snake.id) *
          LOVE_STEAL_MULTIPLIER
      )
      snake.adjustLove(this.id, LOVE_VALUES[type] * headCell.get(type, this.id))
    })

    // The more the snake grows, the more he faces existential crisis
    this.adjustLove(this.id, -headCell.get(type) * LOVE_VALUES[type])

    // Each time a snake eats, others feel less lonely
    this.board.getOtherSnakes(this.id).forEach((snake) => {
      snake.adjustLove(
        snake.id,
        (headCell.get(type) * LOVE_VALUES[type]) /
          (this.board.snakes.length - 1 || 1)
      )
    })
  }

  bite(type) {
    if (type == null) {
      ;[CELL_SNAKE_HEAD, CELL_SNAKE_BODY].forEach((t) => this.bite(t))
      return
    }
    const headCell = this.board.at(this.getHead())

    this.board.snakes
      .filter((snake) => type != CELL_SNAKE_HEAD || snake.id != this.id)
      .filter((snake) => headCell.get(type, snake.id) > 0)
      .filter((snake) => this.getLove(snake.id) < 0) // Don't bite loved ones
      .forEach((snake) => {
        const bodyIdx = snake.indexOf(
          this.getHead(),
          snake.id == this.id ? 1 : 0
        ) // Don't bite its own head
        snake.turnIntoCorpse(bodyIdx + 1)
        if (type == CELL_SNAKE_BODY) {
          headCell.remove(CELL_SNAKE_BODY, snake.id, 1)
          snake.body.pop()
        }
        snake.adjustLove(
          this.id,
          -LOVE_VALUES[CELL_SNAKE_BODY] * LOVE_STEAL_MULTIPLIER
        )
      })
  }

  isStealing(id) {
    return id != this.id && id != this.board.getNoOwnerId()
  }

  indexOf({ x, y }, start = 0) {
    return this.body.findIndex(
      (pos, i) => i >= start && pos.x == x && pos.y == y
    )
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
