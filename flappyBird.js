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

// Pipes
var pipes = [];
var pipesInPlay = [];
pipes[0] = new Pipe();
// pipes[0].y = -100;
pipesInPlay[0] = pipes[0];

var generation = 1;
var birdNumber = 0;
var average = 0;
var bestAverage = 0;
var previous = [];
var score = 0;

// Birds
var birds = [];
for (var i = 0; i < 10; i++) {
    birds.push(new Bird(birdNumber));
    birdNumber += 1;
}

function compareBirds(a, b) {
    return b.fitness - a.fitness;
}


function evolve() {
    birds.sort(compareBirds);
    var nextGen = [];

    // Best 6 birds progress
    for (var i = 0; i < 6; i++) {
        nextGen.push(new Bird(birds[i].num));
        nextGen[i].wih = birds[i].wih;
        nextGen[i].who = birds[i].who;
    }

    // Two descendants from best two birds
    nextGen.push(new Bird(birdNumber));
    birdNumber += 1;
    nextGen.push(new Bird(birdNumber));
    birdNumber += 1;
    [nextGen[4].wih, nextGen[5].wih] = crossover(birds[0].wih, birds[1].wih);
    [nextGen[4].who, nextGen[5].who] = crossover(birds[0].who, birds[1].who);

    // Two descendants from 3rd and 4th birds
    nextGen.push(new Bird(birdNumber));
    birdNumber += 1;
    nextGen.push(new Bird(birdNumber));
    birdNumber += 1;
    [nextGen[6].wih, nextGen[7].wih] = crossover(birds[2].wih, birds[3].wih);
    [nextGen[6].who, nextGen[7].who] = crossover(birds[2].who, birds[3].who);

    // Create crossovers from the middle 10


    // Mutate the new generation
    for (var i = 4; i < 10; i++) {
        if (Math.random() > 0.8) {
            nextGen[i].wih = mutate(nextGen[i].wih);
            nextGen[i].who = mutate(nextGen[i].who);
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
            score += 1;
        }
    }

    ctx.drawImage(fg, 0, cvs.height - fg.height);
    ctx.font = "20px Arial";
    ctx.fillText("Score: " + score, 5, cvs.height - 10)

    scores.clearRect(0, 0, scoresCanvas.width, scoresCanvas.height);
    scores.font = "30px Arial";
    scores.fillText("Generation " + generation, 10, 30);
    scores.font = "15px Arial";
    scores.fillText("Best average fitness: " + Math.floor(bestAverage), 10, 60);
    scores.fillText("Average fitness: " + Math.floor(average), 10, 80);

    for (var i = 0; i < 10; i++) {
        scores.fillText("Bird " + birds[i].num + ": " + birds[i].fitness, 10, 100 + i * 20);
    }

    scores.fillText("Previous: " + previous, 10, 500);

    if (living == false) {
        previous.push(Math.floor(average));
        if (previous.length > 10) {
            previous.shift();
        }
        pipes = [];
        pipesInPlay = [];
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        evolve();
        pipes[0] = new Pipe();
        pipesInPlay[0] = pipes[0];
        // pipes[0].y = -100;
        score = 0;
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