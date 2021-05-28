import { toColor, getRGBA } from './color'

import {
  CELL_SNAKE_HEAD,
  CELL_SNAKE_BODY,
  CELL_CORPSE,
  CELL_FOOD,
} from '../const'

const Palette = class {
  constructor(colors) {
    this.colors = colors
    this.caches = {}
  }

  getCacheKey(type, colorIdx) {
    return '' + type + '-' + colorIdx
  }

  clearCache() {
    this.caches = {}
  }

  get(type, colorIdx) {
    const key = this.getCacheKey(type, colorIdx)
    const img = this.caches[key]
      ? this.caches[key]
      : this.create(type, this.colors[colorIdx])
    this.caches[key] = img
    return img
  }

  create(type, color) {
    switch (type) {
      case CELL_SNAKE_HEAD:
        return this.createSnakeHead(color)
      case CELL_SNAKE_BODY:
        return this.createSnakeBody(color)
      case CELL_CORPSE:
        return this.createCorpse(color)
      case CELL_FOOD:
        return this.createFood(color)
    }
  }

  createSnakeHead(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 })
    const ctx = canvas.getContext('2d')
    const path = new Path2D('M 2,2 h 60 v 60 h -60 Z')
    const { r, g, b, a } = getRGBA(color)
    ctx.fillStyle = toColor({ r, g, b, a: a - 0.2 })
    ctx.fill(path)
    return canvas
  }

  createSnakeBody(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 })
    const ctx = canvas.getContext('2d')
    const path = new Path2D('M 2,2 h 60 v 60 h -60 Z')
    const { r, g, b, a } = getRGBA(color)
    ctx.fillStyle = toColor({ r, g, b, a: a - 0.5 })
    ctx.fill(path)
    return canvas
  }

  createCorpse(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 })
    const ctx = canvas.getContext('2d')
    const { r, g, b, a } = getRGBA(color)
    ctx.fillStyle = toColor({ r, g, b, a: a - 0.2 })
    ctx.arc(32, 32, 15, 0, Math.PI * 2, true)
    ctx.fill()
    return canvas
  }

  createFood(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 })
    const ctx = canvas.getContext('2d')
    const { r, g, b, a } = getRGBA(color)
    ctx.fillStyle = toColor({ r, g, b, a: a - 0.2 })
    ctx.arc(32, 32, 30, 0, Math.PI * 2, true)
    ctx.fill()
    return canvas
  }

  createCanvas({ w, h }) {
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    return canvas
  }
}

export default Palette
