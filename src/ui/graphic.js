const clear = (canvas) => {
  const { w, h } = getDim(canvas)
  canvas.getContext('2d').clearRect(0, 0, w, h)
}

const getDim = (canvas) => {
  return { w: canvas.width, h: canvas.height }
}

const draw = (canvas, board, palette) => {
  clear(canvas)
  const ctx = canvas.getContext('2d')
  ctx.save()
  ctx.globalCompositeOperation = 'color'
  const { w, h } = board.getDim()
  for (let x = 0; x < board.w; x++) {
    for (let y = 0; y < board.h; y++) {
      drawCell(canvas, board, { x, y }, palette)
    }
  }
  ctx.restore()
}

const drawCell = (canvas, board, { x, y }, palette) => {
  const { w: board_w, h: board_h } = board.getDim()
  const { w: canvas_w, h: canvas_h } = getDim(canvas)

  // Convert board coordinates to canvas coordinates
  const rect_w = canvas_w / board_w
  const rect_h = canvas_h / board_h
  const rect_x = x * rect_w
  const rect_y = y * rect_h
  const rect = {
    x: rect_x,
    y: rect_y,
    w: rect_w,
    h: rect_h,
  }

  const cell = board.at({ x, y })
  cell.getTypes().forEach((type) => {
    cell
      .getOwnerIds(type)
      .map((ownerId) => palette.get(type, ownerId))
      .forEach((image) => drawImage(canvas, rect, image))
  })
}

const drawImage = (canvas, rect, image) => {
  canvas.getContext('2d').drawImage(image, rect.x, rect.y, rect.w, rect.h)
}

export { draw }
