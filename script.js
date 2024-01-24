const PADDLE_WIDTH = 0.1
const PADDLE_SPEED = 0.5
const BALL_SPEED = 0.45
const BALL_SPIN = 0.2
const WALL = 0.2
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

window.addEventListener('resize', setDimensions)

function playGame() {
    requestAnimationFrame(playGame)
    drawBackground()
    drawWalls()
}

function drawBackground() {
    ConX.fillStyle = COLOUR_BG
    ConX.fillRect(0, 0, canvasEl.width, canvasEl.height)    
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

function setDimensions() {
    height = window.innerHeight
    width = window.innerWidth
    wall = WALL * (height < width ? height : width)
    canvasEl.width = width
    canvasEl.height = height
}

setDimensions()
playGame()