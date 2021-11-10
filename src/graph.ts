import { Parser } from 'expr-eval';

const SQUARE_BORDER_COLOR = '#000';
const AXIS_COLOR = '#666';
const DEFAULT_POINTS_PER_SQUARE = 20;

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
  private _squareSize: number = 42;
  private center: Point | null = null;
  private quadrons: { width: number; height: number }[] | null = [];
  private graphs: GraphFunction[] = [];

  get squareSize() {
    return this._squareSize;
  }
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx?.translate(0.5, 0.5);
    this.ctx = ctx;
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
        width: centerX > 0 ? quadronWidths.negative : 0,
        height: centerY > 0 ? quadronHeights.positive : 0,
      },
      {
        width: centerX < canvasWidth ? quadronWidths.positive : 0,
        height: centerY > 0 ? quadronHeights.positive : 0,
      },
      {
        width: centerX > 0 ? quadronWidths.negative : 0,
        height: centerY < canvasHeight ? quadronHeights.negative : 0,
      },
      {
        width: centerX < canvasWidth ? quadronWidths.positive : 0,
        height: centerY < canvasHeight ? quadronHeights.negative : 0,
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
    for (let i = -this.quadrons[3].height; i < this.quadrons[0].height; i++) {
      if (i === 0) continue;
      const realPos = this.center.y - i * this.squareSize;
      this.ctx.fillText(i.toString(), center.x + 5, realPos + 15);
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
    const negativeWidth = Math.max(
      this.quadrons[0].width,
      this.quadrons[2].width
    );
    const positiveWidth = Math.max(
      this.quadrons[1].width,
      this.quadrons[3].width
    );
    for (let i = -negativeWidth; i < positiveWidth; i++) {
      const step = 1 / points;
      for (let j = 0; j < 1; j += step) {
        const x = i + j;
        // f(x) = x
        try {
          const y = Parser.evaluate(expression, { x });
          // y: -y to invert x axis
          functionData.push({ x, y: -y });
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
  transformGraph = ({
    xDelta,
    yDelta,
    zoomDelta = 0,
    points = DEFAULT_POINTS_PER_SQUARE,
  }: {
    xDelta: number;
    yDelta: number;
    zoomDelta?: number;
    points?: number;
  }) => {
    if (!this.ctx || !this.center) return false;
    this.center = {
      x: this.center.x + xDelta,
      y: this.center.y + yDelta,
    };

    this._squareSize = this.squareSize + zoomDelta;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid(this.center);
    this.drawAxis(this.center);
    for (const graph of this.graphs) {
      const functionData = this.getPointsFromExpression(
        graph.expression,
        points
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
