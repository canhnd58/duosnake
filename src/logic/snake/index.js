import { SNAKE_TYPE_CLASSIC, SNAKE_TYPE_SENSITIVE } from '../../const'

import ClassicSnake from './classic'
import SensitiveSnake from './sensitive'

const createSnake = (type) => {
  switch (type) {
    case SNAKE_TYPE_CLASSIC:
      return new ClassicSnake()
    case SNAKE_TYPE_SENSITIVE:
      return new SensitiveSnake()
  }
}

export { createSnake }
