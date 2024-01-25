const PADDLE_WIDTH = 0.1
const PADDLE_SPEED = 0.5
const BALL_SPEED = 0.45
const BALL_SPIN = 0.2
const WALL = 0.02
const COLOUR_BG = 'darkgoldenrod'
const COLOUR_WALL = 'orange'
const COLOUR_PADDLE = 'darkred'
const COLOUR_BALL = 'black'
const DIRECTION = {
    LEFT: 0,
    RIGHT: 1,
    STOP: 2,
}
let canvasEl = document.createElement('canvas')
document.body.appendChild(canvasEl)
const ConX = canvasEl.getContext('2d')
let width, height, wall
let paddle, ball, touchX

document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)
window.addEventListener('resize', setDimensions)

function playGame() {
    requestAnimationFrame(playGame)
    updatePaddle()
    drawBackground()
    drawWalls()
    drawPaddle()
}

function drawBackground() {
    ConX.fillStyle = COLOUR_BG
    ConX.fillRect(0, 0, canvasEl.width, canvasEl.height)    
}

function drawPaddle() {
    ConX.fillStyle = COLOUR_PADDLE
    ConX.fillRect(
        paddle.x - paddle.w * 0.5,
        paddle.y - paddle.h / 2,
        paddle.w,
        paddle.h)
}

function drawWalls() {
    let halfWall = wall * 0.5
    ConX.lineWidth = wall
    ConX.strokeStyle = COLOUR_WALL
    ConX.beginPath()
    ConX.moveTo(halfWall, height)
    ConX.lineTo(halfWall, halfWall)
    ConX.lineTo(width - halfWall, halfWall)
    ConX.lineTo(width - halfWall, height)
    ConX.stroke()
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37:
            movePaddle(DIRECTION.LEFT)
            break
        case 39:
            movePaddle(DIRECTION.RIGHT)
            break
    }
}

function keyUp(e) {
    switch (e.keyCode) {
        case 37:
        case 39:
            movePaddle(DIRECTION.STOP)
            break
    }
}

function movePaddle(direction) {
    switch (direction) {
        case DIRECTION.LEFT:
            paddle.xV = -paddle.speed
            break
        case DIRECTION.RIGHT:
            paddle.xV = paddle.speed    
            break
        case DIRECTION.STOP:
            paddle.xV = 0
            break
    }
}

function newGame () {
    paddle = new Paddle(PADDLE_WIDTH, wall, PADDLE_SPEED)
}

function setDimensions() {
    height = window.innerHeight
    width = window.innerWidth
    wall = WALL * (height < width ? height : width)
    canvasEl.width = width
    canvasEl.height = height
}

function updatePaddle() {
    let lastPaddleX = paddle.x
    paddle.x += (paddle.xV / 1000) * 20
    if (paddle.x < wall + paddle.w / 2) {
        paddle.x = wall + paddle.w / 2
    } else if (paddle.x > canvasEl.width - wall - paddle.w / 2) {
        paddle.x = canvasEl.width - wall - paddle.w / 2

    }
}

class Paddle {
    constructor(paddleWidth, paddleHeight, paddleSpeed) {
        this.w = paddleWidth * width
        this.h = paddleHeight / 2
        this.x = canvasEl.width / 2
        this.y = canvasEl.height - this.h * 3
        this.speed = paddleSpeed * width
        this.xV = 0
    }
}
setDimensions()
newGame()
playGame()