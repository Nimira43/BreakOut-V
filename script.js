const PADDLE_WIDTH = 0.1
const PADDLE_SPEED = 0.5
const BALL_SPEED = 0.45
const BALL_SPIN = 0.2
const WALL = 0.02
const BRICK_ROWS = 8
const BRICK_COLS = 14
const BRICK_GAP = 0.3
const MARGIN = 4
const MAX_LEVEL = 10
const MIN_BOUNCE_ANGLE = 30
const COLOUR_BG = 'blue'
const COLOUR_WALL = 'black'
const COLOUR_PADDLE = 'yellow'
const COLOUR_BALL = 'white'
const DIRECTION = {
    LEFT: 0,
    RIGHT: 1,
    STOP: 2,
}

let canvasEl = document.createElement('canvas')
document.body.appendChild(canvasEl)
const ConX = canvasEl.getContext('2d')
let width, height, wall
let paddle, ball, touchX, bricks = [], level

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
    updateBricks()
    drawBackground()
    drawWalls()
    drawPaddle()
    drawBricks()
    drawBall()
}

function applyBallSpeed(angle) {
    
    ball.xV = ball.speed * Math.cos(angle)
    ball.yV = -ball.speed * Math.sin(angle)
}

function createBricks() {
    let minY = wall
    let maxY = ball.y - ball.h * 3.5
    let totalSpaceY = maxY - minY
    let totalRows = MARGIN + BRICK_ROWS + MAX_LEVEL * 2
    let rowH = (totalSpaceY / totalRows) * 0.9
    let gap = wall * BRICK_GAP * 0.9
    let h = rowH - gap
    let totalSpaceX = width - wall * 2
    let colW = (totalSpaceX - gap) / BRICK_COLS
    let w = colW - gap
    bricks = []
    let cols = BRICK_COLS
    let rows = BRICK_ROWS + level * 2 
    let colour, left, rank, rankHigh, score, spdMult, top

    rankHigh = rows / 2 - 1
    for (let i = 0; i < rows; i++) {
        bricks[i] = []
        rank = Math.floor(i / 2)
        colour = getBrickColour(rank, rankHigh)
        top = wall + (MARGIN + i) * rowH
        for (let j = 0; j < cols; j++) {
            left = wall + gap + j * colW
            bricks[i][j] = new Brick(left, top, w, h, colour)
        }
    }
}

function drawBackground() {
    ConX.fillStyle = COLOUR_BG
    ConX.fillRect(0, 0, canvasEl.width, canvasEl.height)    
}

function drawBall() {
    ConX.fillStyle = COLOUR_BALL
    ConX.fillRect(ball.x - ball.w / 2, ball.y - ball.h / 2, ball.w, ball.h)
}

function drawBricks() {
    for (let row of bricks) {
        for (let brick of row) {
            if (brick == null) {
                continue
            }
            ConX.fillStyle = brick.colour
            ConX.fillRect(brick.left, brick.top, brick.w, brick.h)
        }
    }
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

function getBrickColour(rank, highestRank) {
    let fraction = rank / highestRank
    let r, g, b = 0
    if (fraction <= 0.67) {
        r = 255;
        g = (255 * fraction) / 0.67

    } else {
        r = (255 * (1 - fraction)) / 0.66
        g = 255
    }
    return `rgb(${r}, ${g}, ${b})`
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
    level = 0
    createBricks()
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
    newGame()
}

function spinBall() {
    let upwards = ball.yV < 0
    let angle = Math.atan2(-ball.yV, ball.xV)
    angle += ((Math.random() * Math.PI) / 2 - Math.PI / 4) * BALL_SPIN
    let minBounceAngle = (MIN_BOUNCE_ANGLE / 180) * Math.PI 
    if (upwards) {
        if (angle < minBounceAngle) {
            angle = minBounceAngle
        } else if (angle > Math.PI - minBounceAngle) {
            angle = Math.PI - minBounceAngle
        }
    } else {
        if (angle > -minBounceAngle) {
            angle = -minBounceAngle
        } else if (angle < -Math.PI + minBounceAngle) {
            angle = -Math.PI + minBounceAngle            
        }
    }
    applyBallSpeed(angle)
}

function touchCancel() {
    touchX = null
    movePaddle(DIRECTION.STOP)
}

function touchEnd() {
    touchX = null
    movePaddle(DIRECTION.STOP)
}

function touchMove(e) {
    touchX = e.touches[0].clientX
}

function touchStart(e) {
    if (serveBall()) {
        return
    }
    touchX = e.touches[0].clientX
}

function updateBall() {
    ball.x += (ball.xV / 1000) * 15
    ball.y += (ball.yV / 1000) * 15
    if (ball.x < wall + ball.w / 2) {
        ball.x = wall + ball.w / 2
        ball.xV = -ball.xV
        spinBall()
    } else if (ball.x > canvasEl.width - wall - ball.w / 2) {
        ball.x = canvasEl.width - wall - ball.w / 2
        ball.xV = -ball.xV
        spinBall()
    } else if (ball.y < wall + ball.h / 2) {
        ball.y = wall + ball.h / 2
        ball.yV = -ball.yV
        spinBall()
    }
    if (ball.y > paddle.y - paddle.h * 0.5 - ball.h * 0.5 &&
        ball.y < paddle.y + paddle.h * 0.5 + ball.h * 0.5 &&
        ball.x > paddle.x - paddle.w * 0.5 - ball.w * 0.5 &&
        ball.x < paddle.x + paddle.w * 0.5 + ball.w * 0.5) {
        ball.y = paddle.y - paddle.h * 0.5 - ball.h * 0.5
        ball.yV = -ball.yV
        spinBall()
    }
    if (ball.y > canvasEl.height) {
        outOfBounds()
    }
    if (ball.yV == 0) {
        ball.x = paddle.x
    }
}

function updateBricks() {
    OUTER: for (let i = 0; i < bricks.length; i++) {
        for (let j = 0; j < BRICK_COLS; j++) {
            if (bricks[i][j] != null && bricks[i][j].intersect(ball)) {
                if (ball.yV < 0) {
                    ball.y = bricks[i][j].bottom + ball.h * 0.5
                } else {
                    ball.y = bricks[i][j].top - ball.h * 0.5
                }
                bricks[i][j] = null
                ball.yV = -ball.yV
                spinBall()
                break OUTER
            }
        }
    }
}

function updatePaddle() {
    if (touchX != null) {
        if (touchX > paddle.x + wall) {
            movePaddle(DIRECTION.RIGHT)
        } else if (touchX < paddle.x - wall) {
            movePaddle(DIRECTION.LEFT)
        } else {
            movePaddle(DIRECTION.STOP)
        }
    }
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

class Brick {
    constructor(left, top, w, h, colour, score, spdMult) {
        this.w = w
        this.h = h
        this.left = left
        this.top = top
        this.bottom = top + h
        this.right = left + w
        this.colour = colour
        this.score = score
        this.spdMult = spdMult
        this.intersect = (ball) => {
            let ballBottom = ball.y + ball.h * 0.5
            let ballLeft = ball.x - ball.w * 0.5
            let ballRight = ball.x + ball.w * 0.5
            let ballTop = ball.y - ball.h * 0.5
            return (
                this.left < ballRight &&
                ballLeft < this.right &&
                this.bottom > ballTop &&
                ballBottom > this.top
                )
        }
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
playGame()