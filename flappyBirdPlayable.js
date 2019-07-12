var canvas = document.getElementById("flappyBird");
var context = canvas.getContext("2d");

var width = canvas.scrollWidth;
var height = canvas.scrollHeight;

var startingX = 150;

class Bird {
    constructor() {
        this.y = 50;
        this.vel = 2;
        this.fitness = 0;
        this.live = true;
        this.radius = 15;
    }

    click() {
        this.y += this.vel;
        this.score += 1;
        if (this.vel < 6) {
            this.vel += 0.2;
        }
        if (this.y > height) {
            this.die();
        } else if (this.y < 0) {
            this.die();
        }
    }

    jump() {
        if (this.live) {
            this.vel = -4;
        }
    }

    draw(context) {
        if (this.live) {
            context.fillStyle = "#f5f242";
            context.beginPath();
            context.arc(startingX, this.y, this.radius, 0, 2 * Math.PI);
            context.stroke();
            this.click();
        }
    }

    die() {
        this.live = false;
    }
}

class Pipe {
    constructor() {
        this.diff = Math.random() * 200;
        this.centre = height/2 - 100 + this.diff;
        this.x = 700;
    }

    click() {
        this.x -= 2;
    }

    draw(context) {
        context.fillStyle = "#2a8000";
        context.beginPath();
        context.fillRect(this.x, -10, 50, height/2 - 145 + this.diff);
        context.stroke();

        context.beginPath();
        context.fillRect(this.x, height/2 - 45 + this.diff, 50, 500);
        context.stroke();

        this.click();
    }
}

var birds = [];
var pipes = [];
var pipesInPlay = [];

var bird = new Bird();
var pipe = new Pipe();
birds.push(bird);
pipes.push(pipe);
pipesInPlay.push(pipe);

function renderBirds(context) {
    for (var i = 0; i < birds.length; i++) {
        birds[i].draw(context);
    }
}

function renderPipes(context) {
    for (var i = 0; i < pipes.length; i++) {
        pipes[i].draw(context);
    }
}

function addPipe() {
    var p = new Pipe();
    pipes.push(p);
    pipesInPlay.push(p);
}

function removePipe() {
    if (pipes[0].x < -50) {
        pipes.shift();
    }
}

function removePipeInPlay() {
    if (pipesInPlay[0].x + 50 < 150) {
        pipesInPlay.shift();
    }
}

function killBirds() {
    for (var i = 0; i < birds.length; i++) {
        if (birds[i].y - birds[i].radius < pipesInPlay[0].centre - 50 &&
            startingX + birds[i].radius >= pipesInPlay[0].x) {
            birds[i].die();
        } else if (birds[i].y + birds[i].radius > pipesInPlay[0].centre + 50 &&
            startingX + birds[i].radius >= pipesInPlay[0].x) {
            birds[i].die();
        }
    }
}


function drawCanvas() {

    context.clearRect(0, 0, width, height);
    
    renderBirds(context);
    renderPipes(context);
    removePipe();
    removePipeInPlay();
    killBirds();

}

function jump() {
    birds[0].jump();
}

document.addEventListener("keydown", jump);

setInterval(drawCanvas, 10);
setInterval(addPipe, 1100);

