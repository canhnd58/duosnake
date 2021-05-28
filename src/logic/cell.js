import {
  CELL_SNAKE_HEAD,
  CELL_SNAKE_BODY,
  CELL_FOOD,
  CELL_CORPSE,
} from '../const'

const MAXIUM_NUM_OWNERS = 10

/**
 * Represent one cell in the game board. May contain more than one cell type and/or more than one owner at the same time.
 */
const Cell = class {
  constructor() {
    this.objs = {}
  }

  empty() {
    return Object.keys(this.objs).length == 0
  }

  add(type, ownerId = 0, amount = 1) {
    const key = this.toKey(type, ownerId)
    this.objs[key] = this.objs[key] + amount || amount
    return this
  }

  remove(type, ownerId, amount) {
    if (ownerId == null) {
      this.getOwnerIds(type).forEach((id) => this.remove(type, id, amount))
      return this
    }

    const key = this.toKey(type, ownerId)
    if (this.objs[key] !== undefined) {
      this.objs[key] -= amount != null ? amount : this.objs[key]
    }
    if (this.objs[key] <= 0) {
      delete this.objs[key]
    }
    return this
  }

  clear() {
    this.objs = {}
  }

  get(type, ownerId) {
    if (ownerId == null) {
      return this.getOwnerIds(type)
        .map((id) => this.get(type, id))
        .reduce((a, b) => a + b, 0)
    }
    const key = this.toKey(type, ownerId)
    return this.objs[key] || 0
  }

  getAndGroup(type, ids) {
    // { id: cnt, other: cnt }
    return ids.reduce((obj, id) => ({ ...obj, [id]: this.get(type, id) }), {
      other: this.getOwnerIds(type)
        .filter((id) => !ids.includes(id))
        .map((id) => this.get(type, id))
        .reduce((sum, cnt) => sum + cnt, 0),
    })
  }

  getOwnerIds(type) {
    return Object.keys(this.objs)
      .filter((key) => (type == null ? true : this.toType(key) == type))
      .map((key) => this.toOwnerId(key))
  }

  getTypes() {
    return Object.keys(this.objs).map((k) => this.toType(k))
  }

  toType(key) {
    return Math.floor(parseInt(key) / MAXIUM_NUM_OWNERS)
  }

  toOwnerId(key) {
    return parseInt(key) % MAXIUM_NUM_OWNERS
  }

  toKey(type, ownerId) {
    return type * MAXIUM_NUM_OWNERS + ownerId
  }
}

export default Cell
