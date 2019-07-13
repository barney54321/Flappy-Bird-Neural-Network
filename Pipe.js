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