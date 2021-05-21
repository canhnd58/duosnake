const CELL_UNOCCUPIED = 0;
const CELL_SNAKE_HEAD = 1;
const CELL_SNAKE_BODY = 2;

const DEFAULT_NCOLS = 45;
const DEFAULT_NROWS = 27;

const DEFAULT_DPI_MULTIPLIER = 2;


const Board = class {
  constructor(width, height) {
    this.w = width;
    this.h = height;

    this.cells = [...new Array(height)]
      .map(() => new Array(width).fill(CELL_UNOCCUPIED));

    this.initSnake();
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

  // Private methods (supposedly)
  put(x, y, value) {
    this.cells[y][x] = value;
    return this;
  }

  initSnake() {
    const head_x = Math.trunc(this.w / 8);
    const head_y = Math.trunc(this.h / 2);
    this.put(head_x, head_y, CELL_SNAKE_HEAD);

    if (head_x > 0) {
      this.put(head_x - 1, head_y, CELL_SNAKE_BODY);
    }

    if (head_x > 1) {
      this.put(head_x - 2, head_y, CELL_SNAKE_BODY);
    }

    return this;
  }
};


const Graphic = class {
  constructor(canvas) {
    this.cv = canvas;
  }

  draw(board) {
    const { w, h } = board.getDim();
    for (let x = 0; x < board.w; x ++) {
      for (let y = 0; y < board.h; y ++) {
        this.drawCell(board, x, y);
      }
    }
  }

  getDim() {
    return { w: this.cv.width, h: this.cv.height };
  }


  // Private methods
  getCtx() {
    return this.cv.getContext('2d');
  }

  drawCell(board, x, y) {
    const { w: board_w, h: board_h } = board.getDim();
    const { w: canvas_w, h: canvas_h } = this.getDim();

    // Rectangle to draw in canvas coordinates
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
    const ctx = this.getCtx();
    ctx.save();
    ctx.fillStyle = 'rgba(30, 130, 76, 1)';
    ctx.fillRect(x + w*0.05, y + h*0.05, w*0.9, h*0.9);
    ctx.restore();
  }

  drawCellSnakeBody(rect) {
    const { x, y, w, h } = rect;
    const ctx = this.getCtx();
    ctx.save();
    ctx.fillStyle = 'rgba(30, 130, 76, 0.7)';
    ctx.fillRect(x + w*0.05, y + h*0.05, w*0.9, h*0.9);
    ctx.restore();
  }
}

const main = () => {
  const canvas = document.getElementById('playground');

  // make canvas dimension bigger than css dimension for increased resolution
  canvas.width = canvas.clientWidth * DEFAULT_DPI_MULTIPLIER;
  canvas.height = canvas.clientHeight * DEFAULT_DPI_MULTIPLIER;

  const graphic = new Graphic(canvas);
  const board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS);
  graphic.draw(board);
}

window.onload = main;
