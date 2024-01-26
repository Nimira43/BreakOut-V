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
const GAMES_LIVES = 3
const KEY_SCORE = 'HighScore'
const BALL_SPEED_MAX = 2
const COLOUR_BG = 'blue'
const COLOUR_WALL = 'black'
const COLOUR_PADDLE = 'yellow'
const COLOUR_BALL = 'white'
const COLOUR_TEXT = 'white'
const TEXT_FONT = 'sans-serif'
const TEXT_LEVEL = 'Level'
const TEXT_LIVES = 'Lives'
const TEXT_SCORE = 'Score'
const TEXT_SCORE_HIGH = 'High'
const TEXT_GAME_OVER = 'GAME OVER'
const TEXT_WIN = 'YOU WON'

const DIRECTION = {
    LEFT: 0,
    RIGHT: 1,
    STOP: 2,
}

let canvasEl = document.createElement('canvas')
document.body.appendChild(canvasEl)
const ConX = canvasEl.getContext('2d')
let width, height, wall
let paddle, ball, bricks = []
let gameOver, pupExtension, pupSticky, pupSuper, win
let level, lives, score, scoreHigh
let numBricks, textSize, touchX

canvasEl.addEventListener('touchcancel', touchCancel)
canvasEl.addEventListener('touchend', touchEnd)
canvasEl.addEventListener('touchmove', touchMove, { passive: true })
canvasEl.addEventListener('touchstart', touchStart, { passive: true })

document.addEventListener('keydown', keyDown)
document.addEventListener('keyup', keyUp)
window.addEventListener('resize', setDimensions)

function playGame() {
    requestAnimationFrame(playGame)
    if (!gameOver) {
        updatePaddle() 
        updateBall()
        updateBricks()
    }
    
    drawBackground()
    drawWalls()
    drawPaddle()
    drawBricks()
    drawText()
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
    textSize = rowH * MARGIN * 0.45
    let totalSpaceX = width - wall * 2
    let colW = (totalSpaceX - gap) / BRICK_COLS
    let w = colW - gap
    bricks = []
    let cols = BRICK_COLS
    let rows = BRICK_ROWS + level * 2 
    let colour, left, rank, rankHigh, score, spdMult, top
    numBricks = cols * rows
    rankHigh = rows / 2 - 1
    for (let i = 0; i < rows; i++) {
        bricks[i] = []
        rank = Math.floor(i / 2)
        score = (rankHigh - rank) * 2 + 1
        colour = getBrickColour(rank, rankHigh)
        spdMult = 1 + ((rankHigh - rank) / rankHigh) * (BALL_SPEED_MAX - 1)
        top = wall + (MARGIN + i) * rowH
        for (let j = 0; j < cols; j++) {
            left = wall + gap + j * colW
            bricks[i][j] = new Brick(left, top, w, h, colour, score, spdMult)
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

function drawText() {
    ConX.fillStyle = COLOUR_TEXT
    let labelSize = textSize * 0.5
    let margin = wall * 2
    let maxWidth = width - margin * 2
    let maxWidth1 = maxWidth * 0.27
    let maxWidth2 = maxWidth * 0.2
    let maxWidth3 = maxWidth * 0.2
    let maxWidth4 = maxWidth * 0.27
    let x1 = margin
    let x2 = width * 0.4
    let x3 = width * 0.6
    let x4 = width - margin
    let yLabel = wall + labelSize
    let yValue = yLabel + textSize * 0.9
    ConX.font = `${labelSize}px ${TEXT_FONT}`
    ConX.textAlign = 'left'
    ConX.fillText(TEXT_SCORE, x1, yLabel, maxWidth1)
    ConX.textAlign = 'center'
    ConX.fillText(TEXT_LIVES, x2, yLabel, maxWidth2)
    ConX.fillText(TEXT_LEVEL, x3, yLabel, maxWidth3)
    ConX.textAlign = 'right'
    ConX.fillText(TEXT_SCORE_HIGH, x4, yLabel, maxWidth4)
    ConX.font = `${textSize}px ${TEXT_FONT}`
    ConX.textAlign = 'left'
    ConX.fillText(score, x1, yValue, maxWidth1)
    ConX.textAlign = 'center'
    ConX.fillText(`${lives}/${GAMES_LIVES}`, x2, yValue, maxWidth2)
    ConX.fillText(level, x3, yValue, maxWidth3)
    ConX.textAlign = 'right'
    ConX.fillText(scoreHigh, x4, yValue, maxWidth4)

    if (gameOver) {
        let text = win ? TEXT_WIN : TEXT_GAME_OVER
        ConX.font = `${textSize * 2}px ${TEXT_FONT}`
        ConX.textAlign = 'center'
        ConX.fillText(text, width / 2, paddle.y - textSize * 2, maxWidth)
    }
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
            if (gameOver) {
                newGame()
            }
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

function newBall() {
    paddle = new Paddle(PADDLE_WIDTH, wall, PADDLE_SPEED)
    ball = new Ball(wall, BALL_SPEED)
}

function newGame() {
    level = 0
    gameOver = false
    score = 0
    win = false
    lives = GAMES_LIVES
    let scoreStr = localStorage.getItem(KEY_SCORE)
    if (scoreStr == null) {
        scoreHigh = 0
    } else {
        scoreHigh = parseInt(scoreStr)
    }
    newLevel()
}

function newLevel() {
    touchX = null
    newBall()
    createBricks()
} 
    
function outOfBounds() {
    lives--
    if (lives == 0) {
        gameOver = true
    }
    newBall()
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

function setDimensions() {
    height = window.innerHeight
    width = window.innerWidth
    wall = WALL * (height < width ? height : width)
    canvasEl.width = width
    canvasEl.height = height
    ConX.textBaseline = 'middle'

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
        if (gameOver) {
            newGame()
        }
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
                updateScore(bricks[i][j].score)
                ball.setSpeed(bricks[i][j].spdMult)
                if (ball.yV < 0) {
                    ball.y = bricks[i][j].bottom + ball.h * 0.5
                } else {
                    ball.y = bricks[i][j].top - ball.h * 0.5
                }
                bricks[i][j] = null
                ball.yV = -ball.yV
                numBricks--
                spinBall()
                break OUTER
            }
        }
    }
    if (numBricks == 0) {
        if (level < MAX_LEVEL) {
            level++
            newLevel()
        } else {
            gameOver = true
            win = true
            newBall()
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

function updateScore(brickScore) {
    score += brickScore
    if (score > scoreHigh) {
        scoreHigh = score
        localStorage.setItem(KEY_SCORE, scoreHigh)
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
    setSpeed = (spdMult) => {
        this.speed = Math.max(this.speed, BALL_SPEED * height * spdMult)
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