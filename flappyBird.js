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
            res[i][j] = a[i][j] + (a[i][j] * ((Math.random() - 0.5) * 2));
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

// Pipes
var pipes = [];
var pipesInPlay = [];
pipes[0] = new Pipe();
pipes[0].y = -100;
pipesInPlay[0] = pipes[0];

var generation = 1;
var birdNumber = 0;
var average = 0;
var bestAverage = 0;

// Birds
var birds = [];
for (var i = 0; i < 20; i++) {
    birds.push(new Bird(birdNumber));
    birdNumber += 1;
}

function compareBirds(a, b) {
    return b.fitness - a.fitness;
}

function evolve() {
    birds.sort(compareBirds);
    var nextGen = [];

    // Best 4 birds progress
    for (var i = 0; i < 4; i++) {
        nextGen.push(new Bird(birds[i].num));
        nextGen[i].wih = birds[i].wih;
        nextGen[i].who = birds[i].who;
    }

    // Best 2 birds have an offspring from their averages
    nextGen.push(new Bird(birdNumber));
    birdNumber += 1;
    nextGen[4].wih = averageMatrices(birds[0].wih, birds[1].wih);
    nextGen[4].who = averageMatrices(birds[0].who, birds[1].who);

    // Best 2 birds have a mutated version progress
    for (var i = 0; i < 3; i++) {
        nextGen.push(new Bird(birdNumber));
        birdNumber += 1;
        nextGen[i].wih = mutate(birds[i].wih);
        nextGen[i].who = mutate(birds[i].who);
    }

    // Best 2 birds have a less mutated version progress
    for (var i = 0; i < 2; i++) {
        nextGen.push(new Bird(birdNumber));
        birdNumber += 1;
        nextGen[i].wih = mutate(birds[i].wih);
        nextGen[i].who = birds[i].who;
    }

    // Best 2 birds have a less mutated version progress
    for (var i = 0; i < 2; i++) {
        nextGen.push(new Bird(birdNumber));
        birdNumber += 1;
        nextGen[i].wih = birds[i].wih;
        nextGen[i].who = mutate(birds[i].who);
    }

    // The remaining 9 are mutated crossovers of the best
    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var newBird = new Bird(birdNumber);
            birdNumber += 1;
            newBird.wih = mutate(birds[i].wih);
            newBird.who = mutate(birds[j].who);
            nextGen.push(newBird);
        }
    }

    birds = nextGen;
    generation += 1;
}

function draw() {

    ctx.drawImage(bg, 0, 0);

    var living = false;
    average = 0;
    for (var i = 0; i < birds.length; i++) {
        if (birds[i].live == true) {
            living = true;
            birds[i].draw();
            birds[i].click();
        }
        average += birds[i].fitness;
    }
    average /= birds.length;

    if (average > bestAverage) {
        bestAverage = average;
    }
    
    for (var i = 0; i < pipes.length; i++) {

        for (var j = 0; j < birds.length; j++) {

            if (birds[j].live == false) {
                ;
            } else {

                // Detect collision
                if (birds[j].x + birdImg.width >= pipes[i].x && birds[j].x <= pipes[i].x + pipeNorth.width &&
                    (birds[j].y <= pipes[i].y + pipeNorth.height || birds[j].y + birdImg.height >= pipes[i].y + pipeNorth.height + pipes[i].gap)) {
                    
                    birds[j].live = false;
                    birds[j].fitness += (1 - (birds[j].y - pipes[i].centre)/ cvs.height);
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

    scores.clearRect(0, 0, scoresCanvas.width, scoresCanvas.height);
    scores.font = "30px Arial";
    scores.fillText("Generation " + generation, 10, 50);
    scores.font = "15px Arial";
    scores.fillText("Best average fitness: " + Math.floor(bestAverage), 10, 80);
    scores.fillText("Average fitness: " + Math.floor(average), 10, 100);

    for (var i = 0; i < 20; i++) {
        scores.fillText("Bird " + birds[i].num + ": " + birds[i].fitness, 10, 120 + i * 20);
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

function killAll() {
    for (var i = 0; i < birds.length; i++) {
        birds[i].live = false;
    }
}

document.addEventListener("keydown", killAll);

bg.onload = draw;