var cvs = document.getElementById("flappyBird")
var ctx = cvs.getContext("2d");

var birdImg = new Image();
var bg = new Image();
var fg = new Image();
var pipeNorth = new Image();
var pipeSouth = new Image();

birdImg.src = "./images/bird.png";
bg.src = "./images/bg.png";
fg.src = "./images/fg.png";
pipeNorth.src = "./images/pipeNorth.png";
pipeSouth.src = "./images/pipeSouth.png";

var gap = 85;
var bX = 10;
var bY = 150;
var g = 0.3;
var vel = 1;

class Bird {
    constructor() {
        this.x = 10;
        this.y = 150;
        this.g = 0.3;
        this.vel = 1;
        this.img = birdImg;
    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y);
    }

    jump() {
        this.vel = -5;
    }

    click() {
        this.y += this.vel;
        this.vel += this.g;
        if (this.vel > 10) {
            this.vel = 10;
        }
    }
}

var bird = new Bird();

// Jump
function jump() {
    bird.jump();
}

document.addEventListener("keydown", jump);

// Pipes
var pipes = [];
pipes[0] = {
    x: cvs.width,
    y: 0,
}

function draw() {

    ctx.drawImage(bg, 0, 0);
    
    for (var i = 0; i < pipes.length; i++) {
        ctx.drawImage(pipeNorth, pipes[i].x, pipes[i].y);
        ctx.drawImage(pipeSouth, pipes[i].x, pipes[i].y + pipeNorth.height + gap);
        pipes[i].x -= 2;

        // Spawn new pipes
        if (pipes[i].x == 125 || pipes[i].x == 124) {
            pipes.push({
                x: cvs.width,
                y: Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height,
            })
        }

        // Detect collision
        if (bird.x + birdImg.width >= pipes[i].x && 
            bird.x <= pipes[i].x + pipeNorth.width &&
            (bird.y <= pipes[i].y + pipeNorth.height ||
                bird.y + birdImg.height >= pipes[i].y + pipeNorth.height + gap)) {
            
            location.reload();
        } else if (bird.y < 0 || bird.y + birdImg.height > cvs.height - fg.height) {

            location.reload();
        }

    }

    ctx.drawImage(fg, 0, cvs.height - fg.height);

    bird.draw();
    bird.click();

    requestAnimationFrame(draw);
}

bg.onload = draw;