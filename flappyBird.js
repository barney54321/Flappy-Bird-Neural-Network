var cvs = document.getElementById("flappyBird")
var ctx = cvs.getContext("2d");

var scoresCanvas = document.getElementById("scores")
var scores = scoresCanvas.getContext("2d");

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

function matrixMultiply(a, b) {
    
    var res = [];

    var n = a[0].length;
    var m = a.length;
    var p = b[0].length;

    for (var i = 0; i < m; i++) {
        var arr = [];
        for (var j = 0; j < p; j++) {
            arr.push(0);
        }
        res.push(arr);
    }

    for(var i = 0; i < m; i++) {
        for(var j = 0; j < p; j++) {
            for(var k = 0; k < n; k++) {
                res[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    return res;
}

function transpose(a) {
    var res = [];
    for (var i = 0; i < a.length; i++) {
        res[i] = [a[i]];
    }
    return res;
}

function applySigmoid(a) {

    var res = [];

    // We know that res will be a n * 1 matrix
    for (var i = 0; i < a.length; i++) {
        res.push([1 / (1 + Math.pow(Math.E, a[i][0] * (-1)))]);
    }

    return res;
}

function mutate(a) {
    var res = [];
    for (var i = 0; i < a.length; i++) {
        res.push([]);
        for (var j = 0; j < a[0].length; j++) {
            res[i][j] = a[i][j] + (Math.random() - 0.5) / 2;
        }
    }
    return res;
}

function averageMatrices(a, b) {
    var res = [];
    for (var i = 0; i < a.length; i++) {
        res.push([]);
        for (var j = 0; j < a[0].length; j++) {
            res[i][j] = (a[i][j] + b[i][j]) / 2;
        }
    }
    return res;
}

class Bird {
    constructor() {
        this.x = 10;
        this.y = 150;
        this.g = 0.3;
        this.vel = 1;
        this.img = birdImg;
        this.fitness = 0;
        this.live = true;

        // From 2 to 6
        this.wih = [
            [Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5],
         ];

        // From 6 to 1
        this.who = [
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, ]
        ];

    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y);
    }

    jumpCalculator() {
        var inputs = transpose([this.x - pipesInPlay[0].x, this.y - pipesInPlay[0].centre]);
        var hiddenOutput = matrixMultiply(this.wih, inputs);
        var hiddenResult = applySigmoid(hiddenOutput);
        var outputs = matrixMultiply(this.who, hiddenResult);
        var result = applySigmoid(outputs);
        return result[0][0];
    }

    jump() {
        this.vel = -4;
    }

    jumper() {
        if (this.jumpCalculator() > 0.6) {
            this.jump();
        }
    }

    click() {
        this.fitness += 1;
        this.jumper();
        this.y += this.vel;
        this.vel += this.g;
        if (this.vel > 10) {
            this.vel = 10;
        }
    }

    rebirth() {
        this.live = true;
    }
}

class Pipe {
    constructor() {
        this.x = cvs.width;
        this.y = Math.floor(Math.random() * pipeNorth.height) - pipeNorth.height;
        this.gap = 85;
        this.centre = this.y + pipeNorth.height + (this.gap / 2);
    }

    draw() {
        ctx.drawImage(pipeNorth, this.x, this.y);
        ctx.drawImage(pipeSouth, this.x, this.y + pipeNorth.height + this.gap);
    }

    click() {
        this.x -= 2;
    }
}

// Pipes
var pipes = [];
var pipesInPlay = [];
pipes[0] = new Pipe();
pipes[0].y = -100;
pipesInPlay[0] = pipes[0];

// Birds
var birds = [];
for (var i = 0; i < 10; i++) {
    birds.push(new Bird());
}

var generation = 1;

function compareBirds(a, b) {
    return b.fitness - a.fitness;
}

function evolve() {
    birds.sort(compareBirds);
    var nextGen = [];

    // Best 4 birds progress
    nextGen.push(new Bird());
    nextGen.push(new Bird());
    nextGen.push(new Bird());
    nextGen.push(new Bird());
    for (var i = 0; i < 4; i++) {
        nextGen[i].wih = birds[i].wih;
        nextGen[i].who = birds[i].who;
    }

    // One bird is average of two best birds
    nextGen.push(new Bird());
    nextGen[4].wih = averageMatrices(birds[0].wih, birds[1].wih);
    nextGen[4].who = averageMatrices(birds[0].who, birds[1].who);

    // Two birds are crossovers of the two best birds
    nextGen.push(new Bird());
    nextGen.push(new Bird());
    nextGen[5].wih = birds[0].wih;
    nextGen[6].wih = birds[1].wih;
    nextGen[5].who = birds[1].who;
    nextGen[6].who = birds[0].who;

    // One bird is a direct copies of a random bird
    nextGen.push(new Bird());
    var random1 = Math.floor(Math.random() * 10);
    nextGen[7].wih = birds[random1].wih;
    nextGen[7].who = birds[random1].who;

    // One bird is a mutation of the best bird
    nextGen.push(new Bird());
    nextGen[8].wih = mutate(birds[0].wih);
    nextGen[8].who = mutate(birds[0].who);

    // One bird is a crossover of two random birds
    var random3 = Math.floor(Math.random() * 4);
    var random4 = Math.floor(Math.random() * 4);
    nextGen.push(new Bird());
    nextGen[5].wih = birds[random3].wih;
    nextGen[5].who = birds[random4].who;

    birds = nextGen;
    generation += 1;

    birds[0].rebirth();

}

function draw() {

    ctx.drawImage(bg, 0, 0);
    
    for (var i = 0; i < pipes.length; i++) {

        for (var j = 0; j < birds.length; j++) {

            if (birds[j].live == false) {
                ;
            } else {

                // Detect collision
                if (birds[j].x + birdImg.width >= pipes[i].x && birds[j].x <= pipes[i].x + pipeNorth.width &&
                    (birds[j].y <= pipes[i].y + pipeNorth.height || birds[j].y + birdImg.height >= pipes[i].y + pipeNorth.height + pipes[i].gap)) {
                    
                    birds[j].live = false;
                } else if (birds[j].y < 0 || birds[j].y + birdImg.height > cvs.height - fg.height) {

                    birds[j].live = false;
                }
            }
        }
    }

    for (var i = 0; i < pipes.length; i++) {
        pipes[i].draw();
        pipes[i].click();
        if (pipes[i].x == 105 || pipes[i].x == 104) {
            var newPipe = new Pipe();
            pipes.push(newPipe);
            pipesInPlay.push(newPipe);
        }

        if (pipes[i].x + pipeNorth.width == birds[0].x || pipes[i].x + pipeNorth.width == birds[0].x - 1 ) {
            pipesInPlay.shift();
        }
    }

    ctx.drawImage(fg, 0, cvs.height - fg.height);

    var living = false;
    for (var i = 0; i < birds.length; i++) {
        if (birds[i].live == true) {
            living = true;
            birds[i].draw();
            birds[i].click();
        }
    }

    scores.clearRect(0, 0, scoresCanvas.width, scoresCanvas.height);
    scores.font = "30px Arial";
    scores.fillText("Generation " + generation, 10, 50);

    for (var i = 0; i < 10; i++) {
        scores.fillText("Bird " + i + ": " + birds[i].fitness, 10, 80 + i * 40);
    }


    if (living == false) {
        pipes = [];
        pipesInPlay = [];
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        evolve();
        pipes[0] = new Pipe();
        pipesInPlay[0] = pipes[0];
        pipes[0].y = -100;
    }
    requestAnimationFrame(draw);
}

bg.onload = draw;