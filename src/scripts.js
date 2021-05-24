const DEFAULT_NCOLS = 45;
const DEFAULT_NROWS = 27;

const DEFAULT_DPI_MULTIPLIER = 2;
const DEFAULT_NEXT_MOVE_DELAY = 1000; // ms
const DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE = 4;

const INITIAL_GAME_SPEED = 4;
const INITIAL_SNAKE_MAX_LENGTH = 3;
const MAX_PLAYER = 10;

// The following constants are not meant to be changed
const CELL_PLACEHOLDER = -1;
const CELL_SNAKE_HEAD = 0;
const CELL_SNAKE_BODY = 1;
const CELL_FOOD       = 2;

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_DOWN = 3;

const DIRECTION_DIFF_X = [0, 1, -1, 0];
const DIRECTION_DIFF_Y = [-1, 0, 0, 1];


// Yet these can be changed
const PLAYER_0_KEY_CTRL = {
  'w': DIRECTION_UP,
  's': DIRECTION_DOWN,
  'a': DIRECTION_LEFT,
  'd': DIRECTION_RIGHT
};

const PLAYER_1_KEY_CTRL = {
  'o': DIRECTION_UP,
  'l': DIRECTION_DOWN,
  'k': DIRECTION_LEFT,
  ';': DIRECTION_RIGHT
};

const PLAYER_0_COLOR = 'rgb(30, 130, 76)';   // green
const PLAYER_1_COLOR = 'rgb(214, 69, 65)';   // red


const Cell = class {
  constructor() {
    this.objs = {};
  }

  empty() {
    return Object.keys(this.objs).length == 0;
  }

  add(type, owner) {
    const key = this.toKey(type, owner);
    this.objs[key] = this.objs[key] + 1 || 1;
    return this;
  }

  remove(type, owner) {
    if (type > 0 && owner == null) {
      this.getOwners(type).forEach(o => this.remove(type, o));
      return this;
    }

    const key = this.toKey(type, owner);
    if (this.objs[key] !== undefined) {
      this.objs[key] -= 1;
    }
    if (this.objs[key] == 0) {
      delete this.objs[key];
    }
    return this;
  }

  clear() {
    this.objs = {};
  }

  get(type, owner) {
    if (type > 0 && owner == null) {
      this.getOwners(type)
        .map(o => this.get(type, owner))
        .reduce((a, b) => a + b, 0);
    }
    const key = this.toKey(type, owner);
    return this.objs[key] || 0;
  }

  getOwners(type) {
    if (type < 0) {
      return [];
    }
    return Object.keys(this.objs)
      .filter(key => this.toType(key) == type)
      .map(key => this.toOwner(key));
  }

  getTypes() {
    return Object.keys(this.objs).map(k => this.toType(k));
  }

  toType(key) {
    const k = parseInt(key);
    return k < 0 ? k : Math.floor(k / MAX_PLAYER);
  }

  toOwner(key) {
    const k = parseInt(key);
    return k < 0 ? null : k % MAX_PLAYER;
  }

  toKey(type, owner) {
    return type < 0 ? type : type * MAX_PLAYER + owner;
  }
}


const Board = class {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.cells = new Array(width * height).fill().map(() => new Cell());
  }

  getDim() {
    return {
      w: this.w,
      h: this.h
    };
  }

  at({x, y}) {
    return this.cells[y * this.w + x];
  }

  put({x, y}, cell) {
    this.cells[y * this.w + x] = cell;
  }

  generateFood(player) {
    const unoccupiedIndexes = this.cells
      .map((cell, idx) => ({cell, idx}))
      .filter(wrapper => wrapper.cell.empty())
      .map(wrapper => wrapper.idx);

    const randomIdx = unoccupiedIndexes[Math.floor(Math.random() * unoccupiedIndexes.length)];
    this.cells[randomIdx].add(CELL_FOOD, player);
  }
};


const Snake = class {
  constructor(owner) {
    this.body = [];
    this.owner = owner;
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
    this.board.at(head)
      .remove(CELL_SNAKE_HEAD, this.owner)
      .add(CELL_SNAKE_BODY, this.owner);

    const newHead = {
      x: (head.x + w + DIRECTION_DIFF_X[this.direction]) % w,
      y: (head.y + h + DIRECTION_DIFF_Y[this.direction]) % h
    };

    const cell = this.board.at(newHead);
    if (cell.get(CELL_FOOD, this.owner) == 0) {
      const tail = this.getTail();
      this.board.at(tail).remove(CELL_SNAKE_BODY, this.owner);
      this.body.pop();
    }

    cell.add(CELL_SNAKE_HEAD, this.owner);
    this.body.unshift(newHead);

    const foodOwners = cell.getOwners(CELL_FOOD);
    if (foodOwners.length > 0) {
      foodOwners.forEach(owner => cell.remove(CELL_FOOD, owner));
      foodOwners.forEach(owner => this.board.generateFood(owner));
    }

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
        head.y = h - 1 - Math.trunc(h / 3);
        break;
      case DIRECTION_DOWN:
        head.x = w - 1 - Math.trunc(w / 3);
        head.y = Math.trunc(h / 8);
        break;
      case DIRECTION_UP:
        head.x = Math.trunc(w / 3);
        head.y = h - 1 - Math.trunc(h / 8);
        break;
      default:
        head.x = Math.trunc(w / 8);
        head.y = Math.trunc(h / 3);
        break;
    }
    board.at(head).add(CELL_SNAKE_HEAD, this.owner);
    this.body.push(head);

    // Create body to the opposite direction
    let { x, y } = head;
    while (this.body.length < INITIAL_SNAKE_MAX_LENGTH && x > 0 && x < w - 1 && y > 0 && y < h - 1) {
      x = x - DIRECTION_DIFF_X[direction];
      y = y - DIRECTION_DIFF_Y[direction]
      board.at({x, y}).add(CELL_SNAKE_BODY, this.owner);
      this.body.push({x, y});
    }
  }
}


const Palette = class {
  constructor(colors) {
    this.colors = colors;
    this.caches = {};
  }

  getCacheKey(type, colorIdx) {
    return '' + type + '-' + colorIdx;
  }

  clearCache() {
    this.caches = {};
  }

  get(type, colorIdx) {
    const key = this.getCacheKey(type, colorIdx);
    const img = this.caches[key]
      ? this.caches[key]
      : this.create(type, this.colors[colorIdx]);
    this.caches[key] = img;
    return img;
  }

  create(type, color) {
    switch(type) {
      case CELL_SNAKE_HEAD:
        return this.createSnakeHead(color);
      case CELL_SNAKE_BODY:
        return this.createSnakeBody(color);
      case CELL_FOOD:
        return this.createFood(color);
    }
  }

  createSnakeHead(color) {
    const canvas = this.createCanvas({w: 64, h: 64});
    const ctx = canvas.getContext('2d');
    const path = new Path2D('M 2,2 h 60 v 60 h -60 Z');
    const {r, g, b, a} = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({r, g, b, a: a - 0.2});
    ctx.fill(path);
    return canvas;
  }

  createSnakeBody(color) {
    const canvas = this.createCanvas({w: 64, h: 64});
    const ctx = canvas.getContext('2d');
    const path = new Path2D('M 2,2 h 60 v 60 h -60 Z');
    const {r, g, b, a} = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({r, g, b, a: a - 0.5});
    ctx.fill(path);
    return canvas;
  }

  createFood(color) {
    const canvas = this.createCanvas({w: 64, h: 64});
    const ctx = canvas.getContext('2d');
    const {r, g, b, a} = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({r, g, b, a: a - 0.2});
    ctx.arc(32, 32, 30, 0, Math.PI*2, true);
    ctx.fill();
    return canvas;
  }

  createCanvas({w, h}) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
}

const Color = {
  RGBA_REGEX: /^rgba\((\d+),[ ]?(\d+),[ ]?(\d+), [ ]?[\d\.]+\)$/,
  RGB_REGEX: /^rgb\((\d+),[ ]?(\d+),[ ]?(\d+)\)$/,

  getRGBA: rgba => {
    let match = Color.RGBA_REGEX.exec(rgba);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseFloat(match[4])};
    }
    match = Color.RGB_REGEX.exec(rgba);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: 1};
    }
  },

  toColor: ({r, g, b, a}) => `rgba(${r},${g},${b},${a})`,
}

const Graphic = {
  clear: (canvas) => {
    const { w, h } = Graphic.getDim(canvas);
    canvas.getContext('2d').clearRect(0, 0, w, h);
  },

  getDim: (canvas) => {
    return { w: canvas.width, h: canvas.height };
  },

  draw: (canvas, board, palette) => {
    Graphic.clear(canvas);
    const ctx = canvas.getContext('2d');
    ctx.save();
    ctx.globalCompositeOperation = 'color';
    const { w, h } = board.getDim();
    for (let x = 0; x < board.w; x ++) {
      for (let y = 0; y < board.h; y ++) {
        Graphic.drawCell(canvas, board, {x, y}, palette);
      }
    }
    ctx.restore();
  },

  drawCell: (canvas, board, {x, y}, palette) => {
    const { w: board_w, h: board_h } = board.getDim();
    const { w: canvas_w, h: canvas_h } = Graphic.getDim(canvas);

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

    const cell = board.at({x, y});
    if (!cell.empty()) {
    }
    cell.getTypes().forEach(type => {
      cell.getOwners(type)
        .map(owner => palette.get(type, owner))
        .forEach(image => Graphic.drawImage(canvas, rect, image));
    });
  },

  drawImage: (canvas, rect, image) => {
    canvas.getContext('2d').drawImage(image, rect.x, rect.y, rect.w, rect.h);
  }
}


const Player = class {
  constructor(id, keyCtrl) {
    this.id = id;
    this.keyCtrl = keyCtrl;
    this.directionQueue = [];
  }

  join(board, direction = DIRECTION_RIGHT) {
    this.snake = new Snake(this.id);
    this.snake.join(board, direction);
  }


  move() {
    while (this.directionQueue.length > 0 && !this.snake.setDirection(this.directionQueue[0])) {
      this.directionQueue.shift();
    }
    this.snake.move();
  }

  handleKeyEvents(e) {
    if (Object.keys(this.keyCtrl).includes(e.key)) {
      const direction = this.keyCtrl[e.key];
      if (this.directionQueue.push(direction) > DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE) {
        this.directionQueue.shift();
      }
    }
  }
}


const Game = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS);
    this.palette = new Palette([PLAYER_0_COLOR, PLAYER_1_COLOR]);

    this.player_0 = new Player(0, PLAYER_0_KEY_CTRL);
    this.player_1 = new Player(1, PLAYER_1_KEY_CTRL);

    this.player_0.join(this.board, DIRECTION_RIGHT);
    this.player_1.join(this.board, DIRECTION_LEFT);

    this.board.generateFood(0);
    this.board.generateFood(1);

    this.speed = INITIAL_GAME_SPEED;
    this.lastMove = 0;
    this.startTime = null;
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
        this.player_0.move();
        this.player_1.move();
        this.lastMove = nextMove;
      }

      Graphic.draw(this.canvas, this.board, this.palette);
      window.requestAnimationFrame(redraw);
    }

    window.requestAnimationFrame(redraw);
  }

  handleKeyEvents(e) {
    this.player_0.handleKeyEvents(e);
    this.player_1.handleKeyEvents(e);
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
