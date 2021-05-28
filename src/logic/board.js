import {
  CELL_SNAKE_HEAD,
  CELL_SNAKE_BODY,
  CELL_FOOD,
  CELL_CORPSE,
  DIRECTION_RIGHT,
  DIRECTION_LEFT,
  DIRECTION_DOWN,
  DIRECTION_UP,
  DIRECTION_DIFF_X,
  DIRECTION_DIFF_Y,
} from '../const'

import Cell from './cell'
import { debug } from '../util'

const INITIAL_SNAKE_DIRECTIONS = [DIRECTION_RIGHT, DIRECTION_LEFT]
const INITIAL_SNAKE_MAX_LENGTH = 3

const MAXIUM_NUM_SNAKES = 2
const NO_OWNER_ID = 0

const Board = class {
  constructor(width, height) {
    this.w = width
    this.h = height
    this.cells = new Array(width * height).fill().map(() => new Cell())
    this.snakes = []
  }

  getDim() {
    return {
      w: this.w,
      h: this.h,
    }
  }

  at({ x, y }) {
    return this.cells[y * this.w + x]
  }

  put({ x, y }, cell) {
    this.cells[y * this.w + x] = cell
  }

  generate(type, ownerId) {
    const unoccupiedIndexes = this.cells
      .map((cell, idx) => ({ cell, idx }))
      .filter((wrapper) => wrapper.cell.empty())
      .map((wrapper) => wrapper.idx)

    if (unoccupiedIndexes.length == 0) {
      return
    }

    const randomIdx =
      unoccupiedIndexes[Math.floor(Math.random() * unoccupiedIndexes.length)]
    this.cells[randomIdx].add(type, ownerId)
  }

  addSnake(snake) {
    if (this.snakes.length >= MAXIUM_NUM_SNAKES) {
      return
    }

    snake.board = this
    snake.id = this.snakes.length + 1

    const direction = INITIAL_SNAKE_DIRECTIONS[this.snakes.length]
    snake.setDirection(direction)
    const { w, h } = this.getDim()

    // Create head
    const head = {}
    switch (direction) {
      case DIRECTION_LEFT:
        head.x = w - 1 - Math.trunc(w / 8)
        head.y = h - 1 - Math.trunc(h / 3)
        break
      case DIRECTION_DOWN:
        head.x = w - 1 - Math.trunc(w / 3)
        head.y = Math.trunc(h / 8)
        break
      case DIRECTION_UP:
        head.x = Math.trunc(w / 3)
        head.y = h - 1 - Math.trunc(h / 8)
        break
      default:
        head.x = Math.trunc(w / 8)
        head.y = Math.trunc(h / 3)
        break
    }
    this.at(head).add(CELL_SNAKE_HEAD, snake.id)
    snake.body.push(head)

    // Create body to the opposite direction
    let { x, y } = head
    while (
      snake.body.length < INITIAL_SNAKE_MAX_LENGTH &&
      x > 0 &&
      x < w - 1 &&
      y > 0 &&
      y < h - 1
    ) {
      x = x - DIRECTION_DIFF_X[direction]
      y = y - DIRECTION_DIFF_Y[direction]
      this.at({ x, y }).add(CELL_SNAKE_BODY, snake.id)
      snake.body.push({ x, y })
    }

    snake.prepare()
    this.snakes.push(snake)
  }

  getSnake(id) {
    return this.snakes[id - 1]
  }

  getOtherSnakes(id) {
    return this.snakes.filter((snake) => snake != this.getSnake(id))
  }

  getNoOwnerId() {
    return NO_OWNER_ID
  }

  tick() {
    this.snakes.forEach((snake) => snake.move())
    this.snakes.forEach((snake) => snake.eat())
    this.snakes.forEach((snake) => snake.grow())
    this.snakes.forEach((snake) => snake.bite())

    this.snakes
      .map((snake) => this.at(snake.getHead()))
      .forEach((headCell) => {
        headCell
          .getOwnerIds(CELL_FOOD)
          .forEach((id) => this.generate(CELL_FOOD, id))
        ;[CELL_FOOD, CELL_CORPSE].forEach((t) => headCell.remove(t))
      })

    debug(this.snakes.map((snake) => snake.toDebugStr()).join('   ---   '))
  }
}

export default Board
