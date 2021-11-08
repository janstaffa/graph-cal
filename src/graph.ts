import { Parser } from 'expr-eval';

const SQUARE_BORDER_COLOR = '#000';
export interface Point {
  x: number;
  y: number;
}
export class Graph {
  private ctx: CanvasRenderingContext2D | null = null;
  readonly squaresInQuadron: number = 0;
  private _squareSize: number = 0;
  private center: Point | null = null;

  get squareSize() {
    return this._squareSize;
  }
  constructor(canvas: HTMLCanvasElement, squaresInQuadron: number = 10) {
    const ctx = canvas.getContext('2d');
    ctx?.translate(0.5, 0.5);
    this.ctx = ctx;
    this.squaresInQuadron = squaresInQuadron;
  }

  initialize = () => {
    if (!this.ctx) return false;
    this.center = {
      x: this.ctx.canvas.width / 2,
      y: this.ctx.canvas.height / 2,
    };

    this.drawGrid(this.center);
    this.drawAxis(this.center);
    return true;
  };

  private drawGrid = (center: Point) => {
    if (!this.ctx) return false;
    this._squareSize = center.x / this.squaresInQuadron;

    for (let i = 0; i < this.squaresInQuadron * 2; i++) {
      for (let j = 0; j < this.squaresInQuadron * 2; j++) {
        const x = i * this._squareSize;
        const y = j * this._squareSize;
        this.ctx.strokeStyle = SQUARE_BORDER_COLOR;
        this.ctx.lineWidth = 0.5;
        this.ctx.strokeRect(x, y, this._squareSize, this._squareSize);
      }
    }
    return true;
  };
  private drawAxis = (center: Point) => {
    if (!this.ctx) return;
    this.ctx.strokeStyle = SQUARE_BORDER_COLOR;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    // draw X axis
    this.ctx.moveTo(0, center.y);
    this.ctx.lineTo(this.ctx.canvas.width, center.y);
    this.ctx.stroke();

    // draw Y axis
    this.ctx.moveTo(center.x, 0);
    this.ctx.lineTo(center.x, this.ctx.canvas.height);
    this.ctx.closePath();
    this.ctx.stroke();
    return true;
  };
  drawFunctionFromPoints = (data: Point[], color: string) => {
    if (!this.ctx || !this.center) return false;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    //  this.ctx.moveTo(data[0].x, data[0].y);
    this.ctx.beginPath();
    for (const point of data) {
      console.log(point);
      const x = this.center.x + point.x * this._squareSize;
      const y = this.center.y + point.y * this._squareSize;
      this.ctx.lineTo(x, y);
    }
    this.ctx.closePath();
    this.ctx.stroke();
    return true;
  };

  drawFunction = (expression: string, points: number, color: string) => {
    const functionData: Point[] = [];
    const realPoints = this.squaresInQuadron * points;
    console.log(realPoints);
    for (let i = -this.squaresInQuadron; i < this.squaresInQuadron; i++) {
      const step = this.squareSize / points;
      console.log('STEP', step);
      for (let j = 0; j < points; j += step) {
        const x = i + j;
        // f(x) = x
        try {
          const y = Parser.evaluate(expression, { x });
          if (y < this.squareSize * (this.squaresInQuadron * 2)) {
            functionData.push({ x, y });
          }
        } catch (e) {}
      }
    }
    this.drawFunctionFromPoints(functionData, color);
    return true;
  };
  clearGraph = () => {
    if (!this.ctx) return false;
    this.ctx.fillStyle = '#181818';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.initialize();
    return true;
  };
}
