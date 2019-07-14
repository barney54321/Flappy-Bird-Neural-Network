class Bird {
    constructor(num) {
        this.x = 10;
        this.y = 150;
        this.g = 0.3;
        this.vel = 1;
        this.img = birdImg;
        this.fitness = 0.0;
        this.live = true;
        this.num = num;
        this.maxFitness = 0;

        // From 2 to 6
        this.wih = [
            [randomNumber(100, -100), randomNumber(100, -100)],
            [randomNumber(100, -100), randomNumber(100, -100)],
            [randomNumber(100, -100), randomNumber(100, -100)],
            [randomNumber(100, -100), randomNumber(100, -100)],
            [randomNumber(100, -100), randomNumber(100, -100)],
            [randomNumber(100, -100), randomNumber(100, -100)],
         ];

        // From 6 to 1
        this.who = [
            [randomNumber(100, -100), randomNumber(100, -100), randomNumber(100, -100), randomNumber(100, -100), randomNumber(100, -100), randomNumber(100, -100), ]
        ];

    }

    draw() {
        ctx.drawImage(this.img, this.x, this.y);
    }

    jumpCalculator() {
        var inputs = transpose([(this.x - pipesInPlay[0].x) / cvs.width, (this.y - pipesInPlay[0].centre) / (cvs.height / 2)]);
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
        if (this.jumpCalculator() > 0.5) {
            this.jump();
        }
    }

    click() {
        if (this.live == true) {
            this.fitness += 1.0;
            this.jumper();
            this.y += this.vel;
            this.vel += this.g;
            if (this.vel > 10) {
                this.vel = 10;
            }
            if (this.fitness > this.maxFitness) {
                this.maxFitness = this.fitness;
            }
        }
    }
}

function randomNumber(max, min) {
    return Math.floor(Math.random() * (max - min) + min);
}