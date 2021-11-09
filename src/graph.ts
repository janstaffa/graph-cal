import { Parser } from 'expr-eval';

const SQUARE_BORDER_COLOR = '#000';
const AXIS_COLOR = '#666';
const DEFAULT_POINTS_PER_SQUARE = 5;

export interface Point {
  x: number;
  y: number;
}
export interface GraphFunction {
  expression: string;
  data: Point[];
  color: string;
}
export class Graph {
  private ctx: CanvasRenderingContext2D | null = null;
  // TODO: remove squaresInQuadron vvv
  readonly squaresInQuadron: number = 0;
  private _squareSize: number = 42;
  private center: Point | null = null;
  private quadrons: { width: number; height: number }[] | null = [];
  private graphs: GraphFunction[] = [];

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

  private calculateQuadrons = () => {
    if (!this.ctx || !this.center) return null;
    const { x: centerX, y: centerY } = this.center;
    const { width: canvasWidth, height: canvasHeight } = this.ctx.canvas;

    const quadronWidths = {
      positive: Math.ceil((canvasWidth - centerX) / this.squareSize),
      negative: Math.ceil(centerX / this.squareSize),
    };
    const quadronHeights = {
      positive: Math.ceil(centerY / this.squareSize),
      negative: Math.ceil((canvasHeight - centerY) / this.squareSize),
    };

    return [
      {
        width: centerY > 0 && centerX > 0 ? quadronWidths.negative : 0,
        height: centerY > 0 && centerX > 0 ? quadronHeights.positive : 0,
      },
      {
        width:
          centerY > 0 && centerX < canvasWidth ? quadronWidths.positive : 0,
        height:
          centerY > 0 && centerX < canvasWidth ? quadronHeights.positive : 0,
      },
      {
        width:
          centerX > 0 && centerY < canvasHeight ? quadronWidths.negative : 0,
        height:
          centerX > 0 && centerY < canvasHeight ? quadronHeights.negative : 0,
      },
      {
        width:
          centerX < canvasWidth && centerY < canvasHeight
            ? quadronWidths.positive
            : 0,
        height:
          centerX < canvasWidth && centerY < canvasHeight
            ? quadronHeights.negative
            : 0,
      },
    ];
  };
  private drawGrid = (center: Point) => {
    if (!this.ctx || !center) return false;
    //  this._squareSize = center.x / this.squaresInQuadron;

    const { x: centerX, y: centerY } = center;

    this.quadrons = this.calculateQuadrons();

    if (!this.quadrons) return false;

    for (const [idx, quadron] of this.quadrons.entries()) {
      for (let i = 1; i <= quadron.height; i++) {
        for (let j = 1; j <= quadron.width; j++) {
          let x = 0,
            y = 0;
          switch (idx) {
            case 0:
              x = centerX - j * this.squareSize;
              y = centerY - i * this.squareSize;
              break;
            case 1:
              x = centerX + (j - 1) * this.squareSize;
              y = centerY - i * this.squareSize;
              break;
            case 2:
              x = centerX - j * this.squareSize;
              y = centerY + (i - 1) * this.squareSize;
              break;
            case 3:
              x = centerX + (j - 1) * this.squareSize;
              y = centerY + (i - 1) * this.squareSize;
              break;
          }
          this.ctx.strokeStyle = SQUARE_BORDER_COLOR;
          this.ctx.lineWidth = 0.5;
          this.ctx.strokeRect(x, y, this.squareSize, this.squareSize);
        }
      }
    }
    return true;
  };
  private drawAxis = (center: Point) => {
    if (!this.ctx || !this.center) return false;
    if (!this.quadrons) {
      this.quadrons = this.calculateQuadrons();
      if (!this.quadrons) return false;
    }
    this.ctx.strokeStyle = AXIS_COLOR;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    // draw X axis
    this.ctx.moveTo(0, center.y);
    this.ctx.lineTo(this.ctx.canvas.width, center.y);
    this.ctx.stroke();

    // draw Y axis
    this.ctx.moveTo(center.x, 0);
    this.ctx.lineTo(center.x, this.ctx.canvas.height);
    this.ctx.stroke();

    this.ctx.font = '12px sans-serif';
    this.ctx.fillStyle = '#999';
    for (let i = -this.quadrons[0].width; i < this.quadrons[1].width; i++) {
      const realPos = this.center.x + i * this.squareSize;
      this.ctx.fillText(i.toString(), realPos + 5, center.y + 15);
    }
    for (let i = -this.quadrons[0].height; i < this.quadrons[3].height; i++) {
      if (i === 0) continue;
      const realPos = this.center.y + i * this.squareSize;
      this.ctx.fillText(i.toString(), center.x + 5, realPos + 15);
      //this.ctx.fillRect(realPos, center.y - 5, 1.5, 10);
      //this.ctx.fillRect(center.x - 5, realPos, 10, 1.5);
    }
    return true;
  };
  private drawGraph_ = (graph: GraphFunction) => {
    if (!this.ctx || !this.center) return false;
    const { data, color } = graph;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (const point of data) {
      const x = this.center.x + point.x * this.squareSize;
      const y = this.center.y + point.y * this.squareSize;
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    return true;
  };

  private getPointsFromExpression = (expression: string, points: number) => {
    if (!this.quadrons) return null;
    const functionData: Point[] = [];
    for (let i = -this.quadrons[0].width; i < this.quadrons[1].width; i++) {
      const step = 1 / points;
      for (let j = 0; j < 1; j += step) {
        const x = i + j;
        // f(x) = x
        try {
          const y = Parser.evaluate(expression, { x });
          if (y < this.squareSize * (this.squaresInQuadron * 2)) {
            // y: -y to invert x axis
            functionData.push({ x, y: -y });
          }
        } catch (e) {}
      }
    }
    return functionData;
  };
  drawGraph = (
    expression: string,
    color: string,
    points: number | undefined = DEFAULT_POINTS_PER_SQUARE
  ) => {
    const functionData = this.getPointsFromExpression(expression, points);
    if (!functionData) return false;
    const newGraph = { expression, data: functionData, color };
    this.graphs.push(newGraph);
    this.drawGraph_(newGraph);
    return true;
  };
  clearGraph = () => {
    if (!this.ctx) return false;
    this.graphs = [];
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.initialize();
    return true;
  };
  moveGraph = (x: number, y: number) => {
    if (!this.ctx || !this.center) return false;
    this.center = {
      x: this.center.x + x,
      y: this.center.y + y,
    };
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid(this.center);
    this.drawAxis(this.center);
    for (const graph of this.graphs) {
      const functionData = this.getPointsFromExpression(
        graph.expression,
        DEFAULT_POINTS_PER_SQUARE
      );
      if (!functionData) return false;
      const updatedGraph: GraphFunction = {
        ...graph,
        data: functionData,
      };
      this.drawGraph_(updatedGraph);
    }
    return true;
  };
}
