export const RELEASE = process.env.NODE_ENV == 'production'

export const CELL_SNAKE_HEAD = 0
export const CELL_SNAKE_BODY = 1
export const CELL_FOOD = 2
export const CELL_CORPSE = 3

export const DIRECTION_UP = 0
export const DIRECTION_RIGHT = 1
export const DIRECTION_LEFT = 2
export const DIRECTION_DOWN = 3

export const DIRECTION_DIFF_X = [0, 1, -1, 0]
export const DIRECTION_DIFF_Y = [-1, 0, 0, 1]

export const GAME_MODE_ADVENTURE = 0
export const GAME_MODE_CLASSIC = 1

export const SNAKE_TYPE_CLASSIC = 0
export const SNAKE_TYPE_SENSITIVE = 1
