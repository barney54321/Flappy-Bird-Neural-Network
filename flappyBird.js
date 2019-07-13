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

    draw() {
        ctx.drawImage(this.img, this.x, this.y);
    }

    jumpCalculator() {
        var inputs = transpose([this.x - pipesInPlay[0].x, this.y - pipesInPlay[0].centre, this.vel]);
        var hiddenOutput = matrixMultiply(this.wih, inputs);
        var hiddenResult = applySigmoid(hiddenOutput);
        var outputs = matrixMultiply(this.who, hiddenResult);
        var result = applySigmoid(outputs);
        return result[0][0];
    }

    jump() {
        this.vel = -5;
    }

    jumper() {
        if (this.jumpCalculator() > 0.5) {
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
pipesInPlay[0] = pipes[0];

// Birds
var birds = [];
for (var i = 0; i < 10; i++) {
    birds.push(new Bird());
}

function compareBirds(a, b) {
    return b.fitness - a.fitness;
}

function evolve() {
    birds.sort(compareBirds);
    var nextGen = [];

    // Best 4 birds progress
    nextGen.push(birds[0]);
    nextGen.push(birds[1]);
    nextGen.push(birds[2]);
    nextGen.push(birds[3]);

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

    // Two birds are direct copies of random birds
    nextGen.push(new Bird());
    var random1 = Math.floor(Math.random() * 10);
    nextGen[7].wih = birds[random1].wih;
    nextGen[7].who = birds[random1].who;

    nextGen.push(new Bird());
    var random2 = Math.floor(Math.random() * 10);
    nextGen[8].wih = birds[random2].wih;
    nextGen[8].who = birds[random2].who;

    // One bird is a crossover of two random birds
    var random3 = Math.floor(Math.random() * 4);
    var random4 = Math.floor(Math.random() * 4);
    nextGen.push(new Bird());
    nextGen.push(new Bird());
    nextGen[5].wih = birds[random3].wih;
    nextGen[6].wih = birds[random4].wih;
    nextGen[5].who = birds[random4].who;
    nextGen[6].who = birds[random3].who;

    birds = nextGen;

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
        if (pipes[i].x == 125 || pipes[i].x == 124) {
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

    if (living == false) {
        pipes = [];
        pipesInPlay = [];
        ctx.clearRect(0, 0, cvs.width, cvs.height);
        evolve();
        pipes[0] = new Pipe();
        pipesInPlay[0] = pipes[0];
    }
    requestAnimationFrame(draw);
}

bg.onload = draw;

// class Bird {
//     constructor() {
//         this.y = 50;
//         this.vel = 2;
//         this.fitness = 0;
//         this.live = true;
//         this.radius = 15;

//         // From 3 to 6
//         this.wih = [
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
//          ];

//         // From 6 to 1
//         this.who = [
//             [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5, ]
//         ];
//     }

//     jumpCalculator() {
//         var inputs = transpose([startingX - pipesInPlay[0].x, this.y - pipesInPlay[0].centre, this.vel]);
//         var hiddenOutput = matrixMultiply(this.wih, inputs);
//         var hiddenResult = applySigmoid(hiddenOutput);
//         var outputs = matrixMultiply(this.who, hiddenResult);
//         var result = applySigmoid(outputs);
//         return result[0][0];
//     }

//     jumper() {
//         var res = this.jumpCalculator();
//         if (res > 0.5) {
//             this.jump();
//         }
//     }

//     click() {
//         this.jumper();
//         this.y += this.vel;
//         this.fitness += 1;
//         if (this.vel < 6) {
//             this.vel += 0.2;
//         }
//         if (this.y > height) {
//             this.die();
//         } else if (this.y < 0) {
//             this.die();
//         }
//     }

//     jump() {
//         if (this.live) {
//             this.vel = -4;
//         }
//     }

//     draw(context) {
//         if (this.live) {
//             context.fillStyle = "#f5f242";
//             context.beginPath();
//             context.arc(startingX, this.y, this.radius, 0, 2 * Math.PI);
//             context.stroke();
//             this.click();
//         }
//     }

//     die() {
//         this.live = false;
//     }
// }

// class Pipe {
//     constructor() {
//         this.diff = Math.random() * 200;
//         this.width = 50;
//         this.centre = height/2 - 100 + this.diff;
//         this.x = 700;
//     }

//     click() {
//         this.x -= 2;
//     }

//     draw(context) {
//         context.fillStyle = "#2a8000";
//         context.beginPath();
//         context.fillRect(this.x, -10, this.width, height/2 - 145 + this.diff);
//         context.stroke();

//         context.beginPath();
//         context.fillRect(this.x, height/2 - 45 + this.diff, this.width, 500);
//         context.stroke();

//         this.click();
//     }
// }

// function renderBirds(context) {
//     for (var i = 0; i < birds.length; i++) {
//         birds[i].draw(context);
//     }
// }

// function renderPipes(context) {
//     for (var i = 0; i < pipes.length; i++) {
//         pipes[i].draw(context);
//     }
// }

// function addPipe() {
//     var p = new Pipe();
//     pipes.push(p);
//     pipesInPlay.push(p);
// }

// function removePipe() {
//     if (pipes[0].x < -50) {
//         pipes.shift();
//     }
// }

// function removePipeInPlay() {
//     if (pipesInPlay[0].x + 50 < 150) {
//         pipesInPlay.shift();
//     }
// }

// function killBirds() {
//     for (var i = 0; i < birds.length; i++) {
//         if (birds[i].y - birds[i].radius < pipesInPlay[0].centre - 50 &&
//             startingX + birds[i].radius >= pipesInPlay[0].x) {
//             birds[i].die();
//         } else if (birds[i].y + birds[i].radius > pipesInPlay[0].centre + 50 &&
//             startingX + birds[i].radius >= pipesInPlay[0].x) {
//             birds[i].die();
//         }
//     }
// }

// var drawInterval = [];
// var pipeInterval = [];
// var birds;
// var pipes;
// var pipesInPlay;
// var generation = 0;

// function startGame() {

//     birds = [];
//     pipes = [];
//     pipesInPlay = [];

//     for (var i = 0; i < 10; i++) {
//         birds[i] = new Bird();
//     }

//     addPipe();
// }

// function resetGame() {

//     var run = false;
//     for (var i = 0; i < 10 && run == false; i++) {
//         if (birds[i].live == true) {
//             run = true;
//         }
//     }

//     if (run == true) {
//         return;
//     }

//     clearInterval(drawCanvas[generation]);
//     clearInterval(pipeInterval[generation]);
//     context.clearRect(0, 0, width, height);
//     pipes = [];

//     // Create next generation


//     // Restart game
//     birds = [];
//     pipes = [];
//     pipesInPlay = [];

//     for (var i = 0; i < 10; i++) {
//         birds[i] = new Bird();
//     }

//     addPipe();
//     generation += 1;
//     drawInterval.push(setInterval(drawCanvas, 10));
//     pipeInterval.push(setInterval(addPipe, 1200));

// }

// function drawCanvas() {

//     context.clearRect(0, 0, width, height);
    
//     renderBirds(context);
//     renderPipes(context);
//     removePipe();
//     removePipeInPlay();
//     killBirds();
//     resetGame();


// }

// startGame();

// drawInterval = setInterval(drawCanvas, 10);
// pipeInterval = setInterval(addPipe, 1200);













// // function crossover(a, b) {
// //     var x = new Bird();
// //     var y = new Bird();

// //     x.wih = a.wih.slice();
// //     x.who = b.who.slice();
// //     y.wih = b.wih.slice();
// //     y.who = b.who.slice();

// //     return [x, y]
// // }


// // function compareBirds(a, b) {
// //     return b.fitness - a.fitness;
// // }

// // function evolution() {
// //     birds.sort(compareBirds);
// //     [birds[4], birds[5]] = crossover(birds[0], birds[1]);
// //     [birds[6], birds[7]] = crossover(birds[Math.floor(Math.random() * 4)], birds[Math.floor(Math.random() * 4)]);
// //     birds[8] = new Bird();
// //     // birds[8].wih = birds[Math.floor(Math.random() * 4)].wih.splice();
// //     birds[9] = birds[Math.floor(Math.random() * 10)];
// // }

// // for (var i = 0; i < 10; i++) {
// //     var bird = new Bird();
// //     birds.push(bird);
// // }

// // var drawInterval;
// // var pipeInterval;

// // function runner() {

// //     function startGame(newBirds) {
// //         birds = newBirds;
// //         pipes = [];
// //         pipesInPlay = [];
// //         addPipe();

// //         drawInterval = setInterval(drawCanvas, 10);
// //         pipeInterval = setInterval(addPipe, 1200);
// //         var endInterval;

// //         function checkEnd() {
// //             var end = true;
// //             for (var i = 0; i < birds.length; i++) {
// //                 if (birds[i].live == true) {
// //                     end = false;
// //                     break;
// //                 }
// //             }

// //             if (end == true) {
// //                 clearInterval(drawInterval);
// //                 clearInterval(pipeInterval);
// //                 clearInterval(endInterval);
// //                 context.clearRect(0, 0, width, height);
// //                 evolution();
// //                 startGame(newBirds)
// //             }
// //         }

// //         endInterval = setInterval(checkEnd, 10);
// //     }

// //     startGame(birds);

// // }

// // runner();


