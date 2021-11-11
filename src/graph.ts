import { Parser } from 'expr-eval';

const SQUARE_BORDER_COLOR = '#000';
const AXIS_COLOR = '#666';
export const DEFAULT_POINTS_PER_SQUARE = 20;
const DEFAULT_SQUARE_SIZE = 42;

export const ZOOM_LIMIT = {
  MAX: 200,
  MIN: 10,
};
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
  private _squareSize: number = DEFAULT_SQUARE_SIZE;
  private center: Point | null = null;
  private quadrons: { width: number; height: number }[] | null = [];
  private graphs: Pick<GraphFunction, 'expression' | 'color'>[] = [];
  pointsPerSquare: number = DEFAULT_POINTS_PER_SQUARE;
  private zoomRatio: number = 1;

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

    const { x: centerX, y: centerY } = center;

    this.quadrons = this.calculateQuadrons();

    if (!this.quadrons) return false;

    const exactRatio = DEFAULT_SQUARE_SIZE / this.squareSize;
    const roundedRatio = Math.round(exactRatio);
    this.zoomRatio = roundedRatio;
    const showDecimals = roundedRatio === 0;
    let step = 1;
    if (showDecimals) {
      this.zoomRatio = 1;
      if (exactRatio > 0.25) {
        step = 0.5;
      } else {
        step = 0.25;
      }
    }
    this.ctx.strokeStyle = SQUARE_BORDER_COLOR;
    for (const [idx, quadron] of this.quadrons.entries()) {
      for (let i = 1; i <= quadron.height; i++) {
        for (let j = 1; j <= quadron.width; j++) {
          this.ctx.lineWidth = 1;
          let x = 0,
            y = 0;

          const multiplier = this.zoomRatio;
          switch (idx) {
            case 0:
              x = centerX - j * this.squareSize * multiplier;
              y = centerY - i * this.squareSize * multiplier;
              break;
            case 1:
              x = centerX + (j - 1) * this.squareSize * multiplier;
              y = centerY - i * this.squareSize * multiplier;
              break;
            case 2:
              x = centerX - j * this.squareSize * multiplier;
              y = centerY + (i - 1) * this.squareSize * multiplier;
              break;
            case 3:
              x = centerX + (j - 1) * this.squareSize * multiplier;
              y = centerY + (i - 1) * this.squareSize * multiplier;
              break;
          }
          this.ctx.strokeRect(
            x,
            y,
            this.squareSize * multiplier,
            this.squareSize * multiplier
          );
          if (exactRatio < 0.5) {
            for (let k = 0; k < 1; k += step) {
              this.ctx.lineWidth = 0.2;
              this.ctx.strokeRect(
                x + k * this.squareSize,
                y + k * this.squareSize,
                this.squareSize,
                this.squareSize
              );
            }
          }
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

    const exactRatio = DEFAULT_SQUARE_SIZE / this.squareSize;
    const roundedRatio = Math.round(exactRatio);

    const showDecimals = roundedRatio === 0;
    let step = 1;
    if (showDecimals) {
      if (exactRatio > 0.25) {
        step = 0.5;
      } else {
        step = 0.25;
      }
    }

    for (
      let i = -this.quadrons[0].width;
      i < this.quadrons[1].width;
      i += step
    ) {
      if (!showDecimals && Math.abs(i % roundedRatio) !== 0) continue;
      const realPos = this.center.x + i * this.squareSize;

      let y;
      if (this.quadrons[0].height === 0) {
        y = 20;
      } else if (this.quadrons[2].height === 0) {
        y = this.ctx.canvas.height - 10;
      }
      if (y) {
        this.ctx.fillText(i.toString(), realPos + 5, y);
        continue;
      }
      this.ctx.fillText(i.toString(), realPos + 5, center.y + 15);
    }
    for (
      let i = -this.quadrons[3].height;
      i < this.quadrons[0].height;
      i += step
    ) {
      if (!showDecimals && Math.abs(i % roundedRatio) !== 0) continue;
      if (i === 0) continue;
      const realPos = this.center.y - i * this.squareSize;

      let x;
      if (this.quadrons[0].width === 0) {
        x = 5;
      } else if (this.quadrons[1].width === 0) {
        x = this.ctx.canvas.width - 50 - i.toString().length * 5;
      }
      if (x) {
        this.ctx.fillText(i.toString(), x, realPos + 15);
        continue;
      }
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

  private solveExpressionForX = (expression: string, x: number) => {
    try {
      const y = Parser.evaluate(expression, { x });
      return y;
    } catch (e) {}
    return null;
  };
  private getPointsFromExpression = (expression: string) => {
    if (!this.quadrons || !this.center) return null;
    const functionData: Point[] = [];
    const negativeWidth = Math.max(
      this.quadrons[0].width,
      this.quadrons[2].width
    );
    const positiveWidth = Math.max(
      this.quadrons[1].width,
      this.quadrons[3].width
    );

    const step = this.zoomRatio / this.pointsPerSquare;
    for (let i = -negativeWidth; i < positiveWidth; i += this.zoomRatio) {
      for (let j = 0; j < this.zoomRatio; j += step) {
        const x = i + j;
        const y = this.solveExpressionForX(expression, x);
        if (!y) continue;
        // y: -y to invert x axis
        functionData.push({ x, y: -y });
      }
    }
    return functionData;
  };
  drawGraph = (expression: string, color: string) => {
    const functionData = this.getPointsFromExpression(expression);
    if (!functionData) return false;
    const newGraph = { expression, data: functionData, color };
    this.graphs.push({ color, expression });
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

  rerenderGraph = () => {
    if (!this.ctx || !this.center) return false;
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.drawGrid(this.center);
    this.drawAxis(this.center);
    for (const graph of this.graphs) {
      const functionData = this.getPointsFromExpression(graph.expression);
      if (!functionData) return false;
      const updatedGraph: GraphFunction = {
        data: functionData,
        ...graph,
      };
      this.drawGraph_(updatedGraph);
    }
    return true;
  };
  moveGraph = (xDelta: number, yDelta: number) => {
    if (!this.ctx || !this.center) return false;
    this.center = {
      x: this.center.x + xDelta,
      y: this.center.y + yDelta,
    };

    this.rerenderGraph();
    return true;
  };

  zoomGraph = (zoomDelta: number) => {
    if (!this.ctx || !this.center) return false;
    const newSquareSize = this.squareSize + zoomDelta;
    if (ZOOM_LIMIT.MIN > newSquareSize || newSquareSize > ZOOM_LIMIT.MAX) {
      return false;
    }

    this._squareSize = newSquareSize;
    this.rerenderGraph();
    return true;
  };

  moveGraphAbsolute = (x: number, y: number) => {
    this.center = {
      x,
      y,
    };
    this.rerenderGraph();
    return true;
  };

  resetZoom = () => {
    this._squareSize = DEFAULT_SQUARE_SIZE;
    this.rerenderGraph();
    return true;
  };

  getRelativeCoordsFromAbsolute = (
    absX: number,
    absY: number
  ): { x: number; y: number } | null => {
    if (!this.center) return null;

    const { x: centerX, y: centerY } = this.center;

    const relX = (absX - centerX) / this.squareSize;
    const relY = (centerY - absY) / this.squareSize;
    return { x: relX, y: relY };
  };

  showFunctionValuesAtX = (x: number): boolean => {
    const relativeCoords = this.getRelativeCoordsFromAbsolute(x, 0);
    if (!relativeCoords || !this.ctx || !this.center) return false;

    this.rerenderGraph();
    for (const graph of this.graphs) {
      const value = this.solveExpressionForX(
        graph.expression,
        relativeCoords.x
      );
      if (!value) continue;

      this.ctx.fillText(
        value.toFixed(2).toString(),
        x + 15,
        this.center.y - value * this.squareSize
      );
    }

    this.ctx.fillRect(x, 0, 1, this.ctx.canvas.height);
    return true;
  };
}
