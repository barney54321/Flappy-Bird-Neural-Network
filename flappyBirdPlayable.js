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

class Bird {
    constructor() {
        this.x = 10;
        this.y = 150;
        this.g = 0.3;
        this.vel = 1;
        this.img = birdImg;
        this.fitness = 0;
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
        this.fitness += 1;
        if (this.vel > 10) {
            this.vel = 10;
        }
    }
}

class Pipe {
    constructor() {
        this.x = cvs.width;
        this.y = Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height;
        this.gap = 85;
    }

    draw() {
        ctx.drawImage(pipeNorth, this.x, this.y);
        ctx.drawImage(pipeSouth, this.x, this.y + pipeNorth.height + this.gap);
    }

    click() {
        this.x -= 2;
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
pipes[0] = new Pipe();

function draw() {

    ctx.drawImage(bg, 0, 0);
    
    for (var i = 0; i < pipes.length; i++) {
        pipes[i].draw();

        // Spawn new pipes
        if (pipes[i].x == 125 || pipes[i].x == 124) {
            pipes.push(new Pipe());
        }

        // Detect collision
        if (bird.x + birdImg.width >= pipes[i].x && 
            bird.x <= pipes[i].x + pipeNorth.width &&
            (bird.y <= pipes[i].y + pipeNorth.height ||
                bird.y + birdImg.height >= pipes[i].y + pipeNorth.height + pipes[i].gap)) {
            
            location.reload();
        } else if (bird.y < 0 || bird.y + birdImg.height > cvs.height - fg.height) {

            location.reload();
        }
        
        pipes[i].click();

    }

    ctx.drawImage(fg, 0, cvs.height - fg.height);

    bird.draw();
    bird.click();

    requestAnimationFrame(draw);
}

bg.onload = draw;