const canvas = document.getElementById('canvas');
const btn = document.getElementById('btn');
canvas.style.cssText = 'border: 1px solid red';
const ctx = canvas.getContext('2d');
let singleLine = null;

class Block {
    constructor() {
        this.lines = [];
        this.dots = [];
    }

    iterator = () => {
        this.dots = [];
        if (this.lines.length >= 2) {
            for (let i = 0; i < this.lines.length - 1; i++) {
                for (let j = 0; j < this.lines.length; j++) {
                    if (!(this.lines[i] && this.lines[j])) {
                        continue;
                    }
                    this.intersectionDots(this.lines[i].initialX, this.lines[i].initialY, this.lines[i].finalX, this.lines[i].finalY, this.lines[j].initialX, this.lines[j].initialY, this.lines[j].finalX, this.lines[j].finalY);
                }
            }
        }
    };
    intersectionDots = (x1, y1, x2, y2, x3, y3, x4, y4) => {
        let ua, ub, denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
        if (denom == 0) {
            return null;
        }
        ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
        ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;
        let x = x1 + ua * (x2 - x1);
        let y = y1 + ua * (y2 - y1);
        let seg1 = ua >= 0 && ua <= 1;
        let seg2 = ub >= 0 && ub <= 1;
        const arc = {x, y};
        if (seg1 && seg2) {
            this.dots.push(arc);
            return arc;
        }
    };
    drawDots = (elements) => {
        if (elements.length > 0) {
            elements.forEach(el => {
                ctx.beginPath();
                ctx.arc(el.x, el.y, 3, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'black';
                ctx.stroke();
            });
        }
    };
    drawLines = () => {
        if (this.lines.length > 0) {
            this.lines.forEach(el => {
                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.moveTo(el.initialX, el.initialY);
                ctx.lineTo(el.finalX, el.finalY);
                ctx.stroke();
            });
        }
    };
    addNewLine = (el) => {
        this.lines.push(el);
        this.iterator();
    };
    remove = () => {
        this.lines.forEach((el, index) => {
            const x = el.initialX, y = el.initialY, x2 = el.finalX, y2 = el.finalY;
            const coordinates = [];
            const time = 21;
            for (let i = 0; i <= time; i++) {
                const delta = i / time;
                const a = delta * (x2 - x) + x;
                const b = delta * (y2 - y) + y;
                coordinates.push({x: Math.round(a), y: Math.round(b)});
            }
            let id = setInterval(() => {
                if (coordinates.length >= 2) {
                    const initial = coordinates.shift();
                    const final = coordinates.pop();
                    el.initialX = initial.x;
                    el.initialY = initial.y;
                    el.finalX = final.x;
                    el.finalY = final.y;
                    this.iterator();
                } else {
                    delete this.lines[index];
                    this.iterator();
                    clearInterval(id);
                }
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                this.drawLines();
                this.drawDots(this.dots);
            }, 3000 / time + 1);
        });
    };
}

const canvasBlock = new Block();

class Line extends Block {
    constructor(initialX, initialY) {
        super();
        if (singleLine != null) {
            return singleLine;
        } else {
            this.initialX = initialX;
            this.initialY = initialY;
            singleLine = this;
        }
    }

    drawLine = (finalX, finalY, elements) => {
        this.finalX = finalX;
        this.finalY = finalY;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        this.drawLines();
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.moveTo(this.initialX, this.initialY);
        ctx.lineTo(this.finalX, this.finalY);
        ctx.stroke();
        this.lines = elements.filter(el => el);
        for (let j = 0; j < this.lines.length; j++) {
            const el = this.intersectionDots(this.initialX, this.initialY, this.finalX, this.finalY, this.lines[j].initialX, this.lines[j].initialY, this.lines[j].finalX, this.lines[j].finalY);
            el && this.drawDots([el]);
        }
    };

    addLine(finalX, finalY, thisEl) {
        thisEl.addNewLine({
            initialX: this.initialX,
            initialY: this.initialY,
            finalX,
            finalY
        });
    }
}

const leftClick = (e) => {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;
    if (!singleLine) {
        new Line(x, y);
        canvas.addEventListener('mousemove', getFinalCoordinates);
    } else {
        singleLine.addLine(x, y, canvasBlock);
        singleLine = null;
        canvas.removeEventListener('mousemove', getFinalCoordinates);
    }
};
const rightClick = (e) => {
    e.preventDefault();
    canvas.removeEventListener('mousemove', getFinalCoordinates);
    singleLine = null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvasBlock.drawLines();
    canvasBlock.drawDots(canvasBlock.dots);
};
const getFinalCoordinates = (e) => {
    const x = e.pageX - canvas.offsetLeft;
    const y = e.pageY - canvas.offsetTop;
    singleLine.drawLine(x, y, canvasBlock.lines);
    canvasBlock.lines = canvasBlock.lines.filter(el => el);
    canvasBlock.iterator();
    canvasBlock.drawDots(canvasBlock.dots);
};
const btnClick = () => {
    canvasBlock.remove();
};
canvas.addEventListener('contextmenu', rightClick);
canvas.addEventListener('click', leftClick);
btn.addEventListener('click', btnClick);
