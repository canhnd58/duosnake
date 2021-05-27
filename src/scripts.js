const DEBUG = true;

const DEFAULT_NCOLS = 45;
const DEFAULT_NROWS = 27;

const DEFAULT_DPI_MULTIPLIER = 2;
const DEFAULT_NEXT_MOVE_DELAY = 1000; // ms
const DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE = 4;

const INITIAL_GAME_SPEED = 4;
const INITIAL_SNAKE_MAX_LENGTH = 3;

const DEFAULT_COLORS = [
  "rgb(244, 208, 63)", // yellow
  "rgb(30, 130, 76)", // green
  "rgb(214, 69, 65)", // red
];

// The following constants are not meant to be changed
const CELL_SNAKE_HEAD = 0;
const CELL_SNAKE_BODY = 1;
const CELL_FOOD = 2;
const CELL_CORPSE = 3;

const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_LEFT = 2;
const DIRECTION_DOWN = 3;

const DIRECTION_DIFF_X = [0, 1, -1, 0];
const DIRECTION_DIFF_Y = [-1, 0, 0, 1];

const OWNER_ID_BOARD = 0;
const OWNER_ID_MAX = DEFAULT_COLORS.length;
const ROUND_DECIMAL_PLACES = 10000; // 4 decimal places

// Yet these can be changed
const STOMACH_STEAL_MULTIPLIER = 2;
const STOMACH_VALUES = {
  [CELL_FOOD]: 1,
  [CELL_CORPSE]: 0.25,
};

const SANITY_STEAL_MULTIPLIER = 5;
const SANITY_VALUES = {
  [CELL_FOOD]: 0.1,
  [CELL_CORPSE]: 0.01,
  [CELL_SNAKE_BODY]: 0.4,
};

const INITIAL_SNAKE_DIRECTIONS = [DIRECTION_RIGHT, DIRECTION_LEFT];

const PLAYER_KEY_CTRLS = [
  {
    w: DIRECTION_UP,
    s: DIRECTION_DOWN,
    a: DIRECTION_LEFT,
    d: DIRECTION_RIGHT,
  },
  {
    o: DIRECTION_UP,
    l: DIRECTION_DOWN,
    k: DIRECTION_LEFT,
    ";": DIRECTION_RIGHT,
  },
];

const Log = DEBUG
  ? {
      debug: (msg) => console.log(msg),
    }
  : {
      debug: () => {},
    };

const Cell = class {
  constructor() {
    this.objs = {};
  }

  empty() {
    return Object.keys(this.objs).length == 0;
  }

  add(type, ownerId = 0, amount = 1) {
    const key = this.toKey(type, ownerId);
    this.objs[key] = this.objs[key] + amount || amount;
    return this;
  }

  remove(type, ownerId, amount) {
    if (ownerId == null) {
      this.getOwnerIds(type).forEach((id) => this.remove(type, id, amount));
      return this;
    }

    const key = this.toKey(type, ownerId);
    if (this.objs[key] !== undefined) {
      this.objs[key] -= amount != null ? amount : this.objs[key];
    }
    if (this.objs[key] <= 0) {
      delete this.objs[key];
    }
    return this;
  }

  clear() {
    this.objs = {};
  }

  get(type, ownerId) {
    if (ownerId == null) {
      return this.getOwnerIds(type)
        .map((id) => this.get(type, id))
        .reduce((a, b) => a + b, 0);
    }
    const key = this.toKey(type, ownerId);
    return this.objs[key] || 0;
  }

  getAndGroup(type, ids) {
    // { id: cnt, other: cnt }
    return ids.reduce((obj, id) => ({ ...obj, [id]: this.get(type, id) }), {
      other: this.getOwnerIds(type)
        .filter((id) => !ids.includes(id))
        .map((id) => this.get(type, id))
        .reduce((sum, cnt) => sum + cnt, 0),
    });
  }

  getOwnerIds(type) {
    return Object.keys(this.objs)
      .filter((key) => (type == null ? true : this.toType(key) == type))
      .map((key) => this.toOwnerId(key));
  }

  getTypes() {
    return Object.keys(this.objs).map((k) => this.toType(k));
  }

  toType(key) {
    return Math.floor(parseInt(key) / OWNER_ID_MAX);
  }

  toOwnerId(key) {
    return parseInt(key) % OWNER_ID_MAX;
  }

  toKey(type, ownerId) {
    return type * OWNER_ID_MAX + ownerId;
  }
};

const Board = class {
  constructor(width, height) {
    this.w = width;
    this.h = height;
    this.cells = new Array(width * height).fill().map(() => new Cell());
    this.snakes = [];
  }

  getDim() {
    return {
      w: this.w,
      h: this.h,
    };
  }

  at({ x, y }) {
    return this.cells[y * this.w + x];
  }

  put({ x, y }, cell) {
    this.cells[y * this.w + x] = cell;
  }

  generate(type, ownerId) {
    const unoccupiedIndexes = this.cells
      .map((cell, idx) => ({ cell, idx }))
      .filter((wrapper) => wrapper.cell.empty())
      .map((wrapper) => wrapper.idx);

    if (unoccupiedIndexes.length == 0) {
      return;
    }

    const randomIdx =
      unoccupiedIndexes[Math.floor(Math.random() * unoccupiedIndexes.length)];
    this.cells[randomIdx].add(type, ownerId);
  }

  addSnake(snake) {
    if (this.snakes.length >= OWNER_ID_MAX - 1) {
      return;
    }

    snake.board = this;
    snake.id = this.snakes.length + 1;

    const direction = INITIAL_SNAKE_DIRECTIONS[this.snakes.length];
    snake.setDirection(direction);
    const { w, h } = this.getDim();

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
    this.at(head).add(CELL_SNAKE_HEAD, snake.id);
    snake.body.push(head);

    // Create body to the opposite direction
    let { x, y } = head;
    while (
      snake.body.length < INITIAL_SNAKE_MAX_LENGTH &&
      x > 0 &&
      x < w - 1 &&
      y > 0 &&
      y < h - 1
    ) {
      x = x - DIRECTION_DIFF_X[direction];
      y = y - DIRECTION_DIFF_Y[direction];
      this.at({ x, y }).add(CELL_SNAKE_BODY, snake.id);
      snake.body.push({ x, y });
    }

    this.snakes.push(snake);
  }

  getSnake(id) {
    return this.snakes[id - 1];
  }

  getOtherSnakes(id) {
    return this.snakes.filter((snake) => snake != this.getSnake(id));
  }

  tick() {
    this.snakes.forEach((snake) => snake.move());
    this.snakes.forEach((snake) => snake.eat());
    this.snakes.forEach((snake) => snake.enjoy());
    this.snakes.forEach((snake) => snake.grow());
    this.snakes
      .filter((snake) => snake.sanity <= 0)
      .forEach((snake) => snake.bite());

    this.snakes
      .map((snake) => this.at(snake.getHead()))
      .forEach((headCell) => {
        headCell
          .getOwnerIds(CELL_FOOD)
          .forEach((id) => this.generate(CELL_FOOD, id));
        [CELL_FOOD, CELL_CORPSE].forEach((t) => headCell.remove(t));
      });

    this.snakes
      .map((snake) => snake.toDebugStr())
      .forEach((str) => Log.debug(str));
  }
};

const Snake = class {
  constructor() {
    this.body = [];
    this.stomach = 0;
    this.sanity = 1;
  }

  toDebugStr() {
    return `snake=${this.id} len=${this.body.length} stomach=${this.stomach} sanity=${this.sanity}`;
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

  fillStomach(diff) {
    this.stomach += diff;
    this.stomach = Util.round(this.stomach);
  }

  fillSanity(diff) {
    this.sanity += diff;
    this.sanity = Math.min(1, this.sanity);
    this.sanity = Math.max(-1, this.sanity);
    this.sanity = Util.round(this.sanity);
  }

  move() {
    const head = this.getHead();
    this.board.at(head).remove(CELL_SNAKE_HEAD, this.id);
    if (this.body.length > 1) {
      this.board.at(head).add(CELL_SNAKE_BODY, this.id);
    }

    const newHead = this.getNewPos(head, this.direction);
    this.board.at(newHead).add(CELL_SNAKE_HEAD, this.id);
    this.body.unshift(newHead);
  }

  grow() {
    if (this.stomach < 1) {
      const tail = this.getTail();
      this.board.at(tail).remove(CELL_SNAKE_BODY, this.id, 1);
      this.body.pop();
    } else {
      this.fillStomach(-1);
    }
  }

  eat(type) {
    if (type == null) {
      [CELL_FOOD, CELL_CORPSE].forEach((t) => this.eat(t));
      return;
    }

    const headCell = this.board.at(this.getHead());
    const cnts = headCell.getAndGroup(type, [OWNER_ID_BOARD, this.id]);
    this.fillStomach(
      (cnts[OWNER_ID_BOARD] +
        cnts[this.id] +
        cnts["other"] * STOMACH_STEAL_MULTIPLIER) *
        STOMACH_VALUES[type]
    );

    headCell
      .getOwnerIds(type)
      .filter((id) => this.isStealing(id))
      .map((id) => this.board.getSnake(id))
      .forEach((otherSnake) =>
        otherSnake.fillSanity(
          -SANITY_VALUES[type] *
            headCell.get(type, otherSnake.id) *
            SANITY_STEAL_MULTIPLIER
        )
      );
  }

  enjoy(type) {
    if (type == null) {
      [CELL_FOOD, CELL_CORPSE].forEach((t) => this.enjoy(t));
      return;
    }
    this.fillSanity(
      this.board.at(this.getHead()).get(type) * SANITY_VALUES[type]
    );
  }

  bite(type) {
    if (type == null) {
      [CELL_SNAKE_HEAD, CELL_SNAKE_BODY].forEach((t) => this.bite(t));
      return;
    }
    const headCell = this.board.at(this.getHead());
    headCell
      .getOwnerIds(type)
      .filter((id) => this.isStealing(id))
      .forEach((id) => {
        const otherSnake = this.board.getSnake(id);
        const bodyIdx = otherSnake.indexOf(this.getHead());
        otherSnake.turnIntoCorpse(bodyIdx + 1);
        if (type == CELL_SNAKE_BODY) {
          headCell.remove(CELL_SNAKE_BODY, otherSnake.id, 1);
          otherSnake.body.pop();
        }
        console.log(
          "gg",
          otherSnake.id,
          -headCell.get(CELL_SNAKE_BODY, id),
          SANITY_VALUES[CELL_SNAKE_BODY],
          SANITY_STEAL_MULTIPLIER
        );
        otherSnake.fillSanity(
          -SANITY_VALUES[CELL_SNAKE_BODY] * SANITY_STEAL_MULTIPLIER
        );
      });
  }

  isStealing(id) {
    return id != this.id && id != OWNER_ID_BOARD;
  }

  indexOf({ x, y }) {
    return this.body.findIndex((pos) => pos.x == x && pos.y == y);
  }

  turnIntoCorpse(startIdx) {
    for (let i = startIdx; i < this.body.length; i++) {
      const pos = this.body[i];
      this.board.at(pos).add(CELL_CORPSE, this.id);
      this.board.at(pos).remove(CELL_SNAKE_BODY, this.id, 1);
    }
    this.body.splice(startIdx);
  }

  getNewPos({ x, y }, direction) {
    const { w, h } = this.board.getDim();
    return {
      x: (x + w + DIRECTION_DIFF_X[direction]) % w,
      y: (y + h + DIRECTION_DIFF_Y[direction]) % h,
    };
  }
};

const Palette = class {
  constructor(colors) {
    this.colors = colors;
    this.caches = {};
  }

  getCacheKey(type, colorIdx) {
    return "" + type + "-" + colorIdx;
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
    switch (type) {
      case CELL_SNAKE_HEAD:
        return this.createSnakeHead(color);
      case CELL_SNAKE_BODY:
        return this.createSnakeBody(color);
      case CELL_CORPSE:
        return this.createCorpse(color);
      case CELL_FOOD:
        return this.createFood(color);
    }
  }

  createSnakeHead(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 });
    const ctx = canvas.getContext("2d");
    const path = new Path2D("M 2,2 h 60 v 60 h -60 Z");
    const { r, g, b, a } = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({ r, g, b, a: a - 0.2 });
    ctx.fill(path);
    return canvas;
  }

  createSnakeBody(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 });
    const ctx = canvas.getContext("2d");
    const path = new Path2D("M 2,2 h 60 v 60 h -60 Z");
    const { r, g, b, a } = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({ r, g, b, a: a - 0.5 });
    ctx.fill(path);
    return canvas;
  }

  createCorpse(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 });
    const ctx = canvas.getContext("2d");
    const { r, g, b, a } = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({ r, g, b, a: a - 0.2 });
    ctx.arc(32, 32, 15, 0, Math.PI * 2, true);
    ctx.fill();
    return canvas;
  }

  createFood(color) {
    const canvas = this.createCanvas({ w: 64, h: 64 });
    const ctx = canvas.getContext("2d");
    const { r, g, b, a } = Color.getRGBA(color);
    ctx.fillStyle = Color.toColor({ r, g, b, a: a - 0.2 });
    ctx.arc(32, 32, 30, 0, Math.PI * 2, true);
    ctx.fill();
    return canvas;
  }

  createCanvas({ w, h }) {
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }
};

const Util = {
  round: (num) =>
    Math.round((num + Number.EPSILON) * ROUND_DECIMAL_PLACES) /
    ROUND_DECIMAL_PLACES,
};

const Color = {
  RGBA_REGEX: /^rgba\((\d+),[ ]?(\d+),[ ]?(\d+), [ ]?[\d\.]+\)$/,
  RGB_REGEX: /^rgb\((\d+),[ ]?(\d+),[ ]?(\d+)\)$/,

  getRGBA: (rgba) => {
    let match = Color.RGBA_REGEX.exec(rgba);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: parseFloat(match[4]),
      };
    }
    match = Color.RGB_REGEX.exec(rgba);
    if (match) {
      return {
        r: parseInt(match[1]),
        g: parseInt(match[2]),
        b: parseInt(match[3]),
        a: 1,
      };
    }
  },

  toColor: ({ r, g, b, a }) => `rgba(${r},${g},${b},${a})`,
};

const Graphic = {
  clear: (canvas) => {
    const { w, h } = Graphic.getDim(canvas);
    canvas.getContext("2d").clearRect(0, 0, w, h);
  },

  getDim: (canvas) => {
    return { w: canvas.width, h: canvas.height };
  },

  draw: (canvas, board, palette) => {
    Graphic.clear(canvas);
    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.globalCompositeOperation = "color";
    const { w, h } = board.getDim();
    for (let x = 0; x < board.w; x++) {
      for (let y = 0; y < board.h; y++) {
        Graphic.drawCell(canvas, board, { x, y }, palette);
      }
    }
    ctx.restore();
  },

  drawCell: (canvas, board, { x, y }, palette) => {
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
      h: rect_h,
    };

    const cell = board.at({ x, y });
    cell.getTypes().forEach((type) => {
      cell
        .getOwnerIds(type)
        .map((ownerId) => palette.get(type, ownerId))
        .forEach((image) => Graphic.drawImage(canvas, rect, image));
    });
  },

  drawImage: (canvas, rect, image) => {
    canvas.getContext("2d").drawImage(image, rect.x, rect.y, rect.w, rect.h);
  },
};

const Player = class {
  constructor(keyCtrl) {
    this.keyCtrl = keyCtrl;
    this.directionQueue = [];
  }

  join(board) {
    this.snake = new Snake();
    board.addSnake(this.snake);
  }

  move() {
    while (
      this.directionQueue.length > 0 &&
      !this.snake.setDirection(this.directionQueue[0])
    ) {
      this.directionQueue.shift();
    }
  }

  handleKeyEvents(e) {
    if (Object.keys(this.keyCtrl).includes(e.key)) {
      const direction = this.keyCtrl[e.key];
      if (
        this.directionQueue.push(direction) >
        DEFAULT_MAXIMUM_DIRECTION_QUEUE_SIZE
      ) {
        this.directionQueue.shift();
      }
    }
  }
};

const Game = class {
  constructor(canvas) {
    this.canvas = canvas;
    this.board = new Board(DEFAULT_NCOLS, DEFAULT_NROWS);
    this.palette = new Palette(DEFAULT_COLORS);

    this.player_1 = new Player(PLAYER_KEY_CTRLS[0]);
    this.player_2 = new Player(PLAYER_KEY_CTRLS[1]);

    this.player_1.join(this.board);
    this.player_2.join(this.board);

    this.speed = INITIAL_GAME_SPEED;
    this.lastMove = 0;
    this.startTime = null;
  }

  start() {
    this.board.generate(CELL_FOOD, this.player_1.snake.id);
    this.board.generate(CELL_FOOD, this.player_2.snake.id);
    this.board.generate(CELL_FOOD, OWNER_ID_BOARD);

    const redraw = () => {
      if (this.startTime == null) {
        this.startTime = performance.now();
      }

      const elapsed = performance.now() - this.startTime;
      const nextMove = this.lastMove + DEFAULT_NEXT_MOVE_DELAY / this.speed;

      // TODO: Issue occurs when the tab loses user's focus for a while
      if (elapsed >= nextMove) {
        this.player_1.move();
        this.player_2.move();
        this.board.tick();
        this.lastMove = nextMove;
      }

      Graphic.draw(this.canvas, this.board, this.palette);
      window.requestAnimationFrame(redraw);
    };

    window.requestAnimationFrame(redraw);
  }

  handleKeyEvents(e) {
    this.player_1.handleKeyEvents(e);
    this.player_2.handleKeyEvents(e);
  }
};

const main = () => {
  const canvas = document.getElementById("playground");

  // Make canvas dimension bigger than css dimension to increase resolution
  canvas.width = canvas.clientWidth * DEFAULT_DPI_MULTIPLIER;
  canvas.height = canvas.clientHeight * DEFAULT_DPI_MULTIPLIER;

  // Create and start the game
  const game = new Game(canvas);
  document.addEventListener("keydown", (e) => game.handleKeyEvents(e));
  game.start();
};

window.onload = main;
