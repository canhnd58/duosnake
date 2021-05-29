import { SNAKE_TYPE_CLASSIC, SNAKE_TYPE_CASUAL } from '../../const'

import ClassicSnake from './classic'
import CasualSnake from './casual'

const createSnake = (type) => {
  switch (type) {
    case SNAKE_TYPE_CLASSIC:
      return new ClassicSnake()
    case SNAKE_TYPE_CASUAL:
      return new CasualSnake()
  }
}

export { createSnake }
