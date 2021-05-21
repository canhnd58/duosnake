const DEFAULT_NCOLS = 45;
const DEFAULT_NROWS = 27;
const DEFAULT_DPI_MULTIPLIER = 2;
const DEFAULT_NEXT_MOVE_DELAY = 1000; // ms
const DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE = 4;

const INITIAL_GAME_SPEED = 4;
const INITIAL_SNAKE_MAX_LENGTH = 3;


// The following constants are not meant to be changed
const CELL_UNOCCUPIED = 0;
const CELL_SNAKE_HEAD = 1;
const CELL_SNAKE_BODY = 2;

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_DOWN = 3;

const DIRECTION_DIFF_X = [0, 1, -1, 0];
const DIRECTION_DIFF_Y = [-1, 0, 0, 1];


// Yet these can be changed
const DIRECTION_CTRL_KEY_MAP = {
  'w': DIRECTION_UP,
  's': DIRECTION_DOWN,
  'a': DIRECTION_LEFT,
  'd': DIRECTION_RIGHT
};


const Board = class {
  constructor(width, height) {
    this.w = width;
    this.h = height;

    this.cells = [...new Array(height)]
      .map(() => new Array(width).fill(CELL_UNOCCUPIED));
  }

  getDim() {
    return {
      w: this.w,
      h: this.h
    };
  }

  at(x, y) {
    return this.cells[y][x];
  }

  put(x, y, value) {
    this.cells[y][x] = value;
    return this;
  }
};


const Snake = class {
  constructor() {
    this.body = [];
  }

  getHead() {
    return this.body[0];
  }

  getTail() {
    return this.body[this.body.length - 1];
  }

  setDirection(direction) {
    if (this.direction != direction && this.direction + direction != 3) {
      this.direction = direction;
      return true;
    }
    return false;
  }

  move() {
    const { w, h } = this.board.getDim();
    const head = this.getHead();
    this.board.put(head.x, head.y, CELL_SNAKE_BODY);

    const newHead = {
      x: (head.x + w + DIRECTION_DIFF_X[this.direction]) % w,
      y: (head.y + h + DIRECTION_DIFF_Y[this.direction]) % h
    };
    this.board.put(newHead.x, newHead.y, CELL_SNAKE_HEAD);
    this.body.unshift(newHead);

    const tail = this.getTail();
    this.board.put(tail.x, tail.y, CELL_UNOCCUPIED);
    this.body.pop();
  }

  join(board, direction = DIRECTION_RIGHT) {
    this.board = board;
    this.direction = direction;
    const { w, h } = board.getDim();

    // Create head
    const head = {};
    switch (direction) {
      case DIRECTION_LEFT:
        head.x = w - 1 - Math.trunc(w / 8);
        head.y = Math.trunc(h / 2);
        break;
      case DIRECTION_DOWN:
        head.x = Math.trunc(w / 2);
        head.y = Math.trunc(h / 8);
        break;
      case DIRECTION_UP:
        head.x = Math.trunc(w / 2);
        head.y = h - 1 - Math.trunc(h / 8);
        break;
      default:
        head.x = Math.trunc(w / 8);
        head.y = Math.trunc(h / 2);
        break;
    }
    board.put(head.x, head.y, CELL_SNAKE_HEAD);
    this.body.push(head);

    // Create body to the opposite direction
    let { x, y } = head;
    while (this.body.length < INITIAL_SNAKE_MAX_LENGTH && x > 0 && x < w - 1 && y > 0 && y < h - 1) {
      x = x - DIRECTION_DIFF_X[direction];
      y = y - DIRECTION_DIFF_Y[direction]
      board.put(x, y, CELL_SNAKE_BODY);
      this.body.push({x, y});
    }
  }
}


const Graphic = class {
  constructor(canvas) {
    this.cv = canvas;
    this.ctx = canvas.getContext('2d');
  }

  clear() {
    const { w, h } = this.getDim();
    this.ctx.clearRect(0, 0, w, h);
  }

  draw(board) {
    this.clear();
    this.ctx.save();
    const { w, h } = board.getDim();
    for (let x = 0; x < board.w; x ++) {
      for (let y = 0; y < board.h; y ++) {
        this.drawCell(board, x, y);
      }
    }
    this.ctx.restore();
  }

  getDim() {
    return { w: this.cv.width, h: this.cv.height };
  }

  drawCell(board, x, y) {
    const { w: board_w, h: board_h } = board.getDim();
    const { w: canvas_w, h: canvas_h } = this.getDim();

    // Convert board coordinates to canvas coordinates
    const rect_w = canvas_w / board_w;
    const rect_h = canvas_h / board_h;
    const rect_x = x * rect_w;
    const rect_y = y * rect_h;
    const rect = {
      x: rect_x,
      y: rect_y,
      w: rect_w,
      h: rect_h
    };

    const cell = board.at(x, y);
    switch(cell) {
      case CELL_SNAKE_HEAD:
        this.drawCellSnakeHead(rect);
      case CELL_SNAKE_BODY:
        this.drawCellSnakeBody(rect);
      default:
        this.drawCellUnoccupied(rect);
    }
  }

  drawCellUnoccupied(rect) {
    // Do nothing
  }

  drawCellSnakeHead(rect) {
    const { x, y, w, h } = rect;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(30, 130, 76, 1)';
    this.ctx.fillRect(x + w*0.05, y + h*0.05, w*0.9, h*0.9);
    this.ctx.restore();
  }

  drawCellSnakeBody(rect) {
    const { x, y, w, h } = rect;
    this.ctx.save();
    this.ctx.fillStyle = 'rgba(30, 130, 76, 0.7)';
    this.ctx.fillRect(x + w*0.05, y + h*0.05, w*0.9, h*0.9);
    this.ctx.restore();
  }
}


const Game = class {
  constructor(canvas) {
    this.graphic = new Graphic(canvas);
    this.board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS);
    this.snake = new Snake();

    this.snake.join(this.board, DIRECTION_RIGHT);

    this.speed = INITIAL_GAME_SPEED;
    this.lastMove = 0;
    this.startTime = null;

    this.directionQueue = [];
  }

  start() {
    const redraw = () => {
      if (this.startTime == null) {
        this.startTime = performance.now();
      }

      const elapsed = performance.now() - this.startTime;
      const nextMove = this.lastMove + DEFAULT_NEXT_MOVE_DELAY / this.speed;

      // TODO: Issue occurs when the tab loses user's focus for a while
      if (elapsed >= nextMove) {
        while (this.directionQueue.length > 0 && !this.snake.setDirection(this.directionQueue[0])) {
          this.directionQueue.shift();
        }

        this.snake.move();
        this.lastMove = nextMove;
      }

      this.graphic.draw(this.board);
      window.requestAnimationFrame(redraw);
    }

    window.requestAnimationFrame(redraw);
  }

  handleKeyEvents(e) {
    if (Object.keys(DIRECTION_CTRL_KEY_MAP).includes(e.key)) {
      const direction = DIRECTION_CTRL_KEY_MAP[e.key];
      if (this.directionQueue.push(direction) > DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE) {
        this.directionQueue.shift();
      }
    }
  }
}


const main = () => {
  const canvas = document.getElementById('playground');

  // Make canvas dimension bigger than css dimension to increase resolution
  canvas.width = canvas.clientWidth * DEFAULT_DPI_MULTIPLIER;
  canvas.height = canvas.clientHeight * DEFAULT_DPI_MULTIPLIER;

  // Create and start the game
  const game = new Game(canvas);
  document.addEventListener('keydown', e => game.handleKeyEvents(e));
  game.start();
}


window.onload = main;
