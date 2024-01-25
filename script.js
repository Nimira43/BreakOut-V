const PADDLE_WIDTH = 0.1
const PADDLE_SPEED = 0.5
const BALL_SPEED = 0.45
const BALL_SPIN = 0.2
const WALL = 0.02
const MIN_BOUNCE_ANGLE = 30
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

canvasEl.addEventListener('touchcancel', touchCancel)
canvasEl.addEventListener('touchend', touchEnd)
canvasEl.addEventListener('touchmove', touchMove, { passive: true })
canvasEl.addEventListener('touchstart', touchStart, { passive: true })

document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)
window.addEventListener('resize', setDimensions)

function playGame() {
    requestAnimationFrame(playGame)
    updatePaddle() 
    updateBall()
    drawBackground()
    drawWalls()
    drawPaddle()
    drawBall()
}

function applyBallSpeed(angle) {
    if (angle < Math.PI / 6) {
        angle = Math.PI / 6
    } else if (angle > (Math.PI * 5) / 6) {
        angle = (Math.PI * 5) / 6
    }
    ball.xV = ball.speed * Math.cos(angle)
    ball.yV = -ball.speed * Math.sin(angle)
}

function drawBackground() {
    ConX.fillStyle = COLOUR_BG
    ConX.fillRect(0, 0, canvasEl.width, canvasEl.height)    
}

function drawBall() {
    ConX.fillStyle = COLOUR_BALL
    ConX.fillRect(ball.x - ball.w / 2, ball.y - ball.h / 2, ball.w, ball.h)
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
        case 32:
            serveBall()
            break
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
    ball = new Ball(wall, BALL_SPEED)
}

function serveBall() {
    if (ball.yV != 0) {
        return false
    }
    let minBounceAngle = (MIN_BOUNCE_ANGLE / 180) * Math.PI
    let range = Math.PI - minBounceAngle * 2
    let angle = Math.random() * range + minBounceAngle
    applyBallSpeed(angle)
    return true
}

function outOfBounds() {
    newGame()
}

function setDimensions() {
    height = window.innerHeight
    width = window.innerWidth
    wall = WALL * (height < width ? height : width)
    canvasEl.width = width
    canvasEl.height = height
}

function touch(x) {
    if (!x) {
        movePaddle(DIRECTION.STOP)
    } else if (x > paddle.x) {
        movePaddle(DIRECTION.RIGHT)
    } else if (x < paddle.x) {
        movePaddle(DIRECTION.LEFT)
    }
}

function touchCancel(e) {
    touch(null)
}

function touchEnd(e) {
    touch(null)
}

function touchMove(e) {
    touch(e.touches[0].clientX)
}

function touchStart(e) {
    if (serveBall()) {
        return
    }
    touch(e.touches[0].clientX)
}

function updateBall() {
    ball.x += (ball.xV / 1000) * 15
    ball.y += (ball.yV / 1000) * 15

    if (ball.x < wall + ball.w / 2) {
        ball.x = wall + ball.w / 2
        ball.xV = -ball.xV
        // spinBall()
    } else if (ball.x > canvasEl.width - wall - ball.w / 2) {
        ball.x = canvasEl.width - wall - ball.w / 2
        ball.xV = -ball.xV
        // spinBall()
    } else if (ball.y < wall + ball.h / 2) {
        ball.y = wall + ball.h / 2
        ball.yV = -ball.yV
        // spinBall()
    }

    if (ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5 &&
        ball.y < paddle.y + paddle.h * 0.5 + ball.h * 0.5 &&
        ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5 &&
        ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5) {
        ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5
        ball.yV, -ball.yV
        let angle = Math.atan2(-ball.yV, ball.xV)
        angle += ((Math.random() * Math.PI) / 2 - Math.PI / 4) * BALL_SPIN
        applyBallSpeed(angle)
    }

    if (ball.y > canvasEl.height) {
        outOfBounds()
    }
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

class Ball {
    constructor(ballSize, ballSpeed) {
        this.w = ballSize
        this.h = ballSize
        this.x = paddle.x
        this.y = paddle.y - paddle.h / 2 - this.h / 2
        this.speed = ballSpeed * height
        this.xV = 0
        this.yV = 0
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