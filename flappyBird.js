var canvas = document.getElementById("flappyBird");
var context = canvas.getContext("2d");

var width = canvas.scrollWidth;
var height = canvas.scrollHeight;

var startingX = 150;

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

class Bird {
    constructor() {
        this.y = 50;
        this.vel = 2;
        this.fitness = 0;
        this.live = true;
        this.radius = 15;

        // From 3 to 6
        this.wih = [
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
         ];

        // From 6 to 1
        this.who = [
            [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, ]
        ];
    }

    jumpCalculator() {
        var inputs = transpose([startingX - pipesInPlay[0].x, this.y - pipesInPlay[0].centre, this.vel]);
        var hiddenOutput = matrixMultiply(this.wih, inputs);
        var hiddenResult = applySigmoid(hiddenOutput);
        var outputs = matrixMultiply(this.who, hiddenResult);
        var result = applySigmoid(outputs);
        return result[0][0];
    }

    jumper() {
        var res = this.jumpCalculator();
        if (res > 0.5) {
            this.jump();
        }
    }

    click() {
        this.jumper();
        this.y += this.vel;
        this.fitness += 1;
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
        this.width = 50;
        this.centre = height/2 - 100 + this.diff;
        this.x = 700;
    }

    click() {
        this.x -= 2;
    }

    draw(context) {
        context.fillStyle = "#2a8000";
        context.beginPath();
        context.fillRect(this.x, -10, this.width, height/2 - 145 + this.diff);
        context.stroke();

        context.beginPath();
        context.fillRect(this.x, height/2 - 45 + this.diff, this.width, 500);
        context.stroke();

        this.click();
    }
}

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

var drawInterval = [];
var pipeInterval = [];
var birds;
var pipes;
var pipesInPlay;
var generation = 0;

function startGame() {

    birds = [];
    pipes = [];
    pipesInPlay = [];

    for (var i = 0; i < 10; i++) {
        birds[i] = new Bird();
    }

    addPipe();
}

function resetGame() {

    var run = false;
    for (var i = 0; i < 10 && run == false; i++) {
        if (birds[i].live == true) {
            run = true;
        }
    }

    if (run == true) {
        return;
    }

    clearInterval(drawCanvas[generation]);
    clearInterval(pipeInterval[generation]);
    context.clearRect(0, 0, width, height);
    pipes = [];

    // Create next generation


    // Restart game
    birds = [];
    pipes = [];
    pipesInPlay = [];

    for (var i = 0; i < 10; i++) {
        birds[i] = new Bird();
    }

    addPipe();
    generation += 1;
    drawInterval.push(setInterval(drawCanvas, 10));
    pipeInterval.push(setInterval(addPipe, 1200));

}

function drawCanvas() {

    context.clearRect(0, 0, width, height);
    
    renderBirds(context);
    renderPipes(context);
    removePipe();
    removePipeInPlay();
    killBirds();
    resetGame();


}

startGame();

drawInterval = setInterval(drawCanvas, 10);
pipeInterval = setInterval(addPipe, 1200);













// function crossover(a, b) {
//     var x = new Bird();
//     var y = new Bird();

//     x.wih = a.wih.slice();
//     x.who = b.who.slice();
//     y.wih = b.wih.slice();
//     y.who = b.who.slice();

//     return [x, y]
// }


// function compareBirds(a, b) {
//     return b.fitness - a.fitness;
// }

// function evolution() {
//     birds.sort(compareBirds);
//     [birds[4], birds[5]] = crossover(birds[0], birds[1]);
//     [birds[6], birds[7]] = crossover(birds[Math.floor(Math.random() * 4)], birds[Math.floor(Math.random() * 4)]);
//     birds[8] = new Bird();
//     // birds[8].wih = birds[Math.floor(Math.random() * 4)].wih.splice();
//     birds[9] = birds[Math.floor(Math.random() * 10)];
// }

// for (var i = 0; i < 10; i++) {
//     var bird = new Bird();
//     birds.push(bird);
// }

// var drawInterval;
// var pipeInterval;

// function runner() {

//     function startGame(newBirds) {
//         birds = newBirds;
//         pipes = [];
//         pipesInPlay = [];
//         addPipe();

//         drawInterval = setInterval(drawCanvas, 10);
//         pipeInterval = setInterval(addPipe, 1200);
//         var endInterval;

//         function checkEnd() {
//             var end = true;
//             for (var i = 0; i < birds.length; i++) {
//                 if (birds[i].live == true) {
//                     end = false;
//                     break;
//                 }
//             }

//             if (end == true) {
//                 clearInterval(drawInterval);
//                 clearInterval(pipeInterval);
//                 clearInterval(endInterval);
//                 context.clearRect(0, 0, width, height);
//                 evolution();
//                 startGame(newBirds)
//             }
//         }

//         endInterval = setInterval(checkEnd, 10);
//     }

//     startGame(birds);

// }

// runner();


