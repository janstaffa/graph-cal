// import { Parser } from 'expr-eval';

import Parser from 'expression-parser';

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
  interval: string;
}
export class Graph {
  private ctx: CanvasRenderingContext2D | null = null;
  private graphDimensions: { width: number; height: number } | null = null;
  private _squareSize: number = DEFAULT_SQUARE_SIZE;
  private _center: Point | null = null;
  private quadrons: { width: number; height: number }[] | null = [];
  private graphs: Pick<GraphFunction, 'expression' | 'color' | 'interval'>[] =
    [];
  pointsPerSquare: number = DEFAULT_POINTS_PER_SQUARE;
  private zoomRatio: number = 1;

  get squareSize() {
    return this._squareSize;
  }
  get center() {
    return this._center;
  }
  constructor(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');
    ctx?.translate(0.5, 0.5);
    this.ctx = ctx;
    const { width, height } = canvas;
    this.graphDimensions = {
      width,
      height,
    };
  }

  initialize = () => {
    if (!this.ctx || !this.graphDimensions) return false;
    if (!this._center) {
      this._center = {
        x: this.graphDimensions.width / 2,
        y: this.graphDimensions.height / 2,
      };
    }

    this.drawGrid(this._center);
    this.drawAxis(this._center);
    return true;
  };

  private calculateQuadrons = (center: Point) => {
    if (!this.ctx || !center || !this.graphDimensions) return null;
    const { x: centerX, y: centerY } = center;
    const { width: canvasWidth, height: canvasHeight } = this.graphDimensions;

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

    this.quadrons = this.calculateQuadrons(center);

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
    if (!this.ctx || !center || !this.graphDimensions) return false;
    if (!this.quadrons) {
      this.quadrons = this.calculateQuadrons(center);
      if (!this.quadrons) return false;
    }
    this.ctx.strokeStyle = AXIS_COLOR;
    this.ctx.lineWidth = 2;

    this.ctx.beginPath();
    // draw X axis
    this.ctx.moveTo(0, center.y);
    this.ctx.lineTo(this.graphDimensions.width, center.y);
    this.ctx.stroke();

    // draw Y axis
    this.ctx.moveTo(center.x, 0);
    this.ctx.lineTo(center.x, this.graphDimensions.height);
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
      const realPos = center.x + i * this.squareSize;

      let y;
      if (this.quadrons[0].height === 0) {
        y = 20;
      } else if (this.quadrons[2].height === 0) {
        y = this.graphDimensions.height - 10;
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
      const realPos = center.y - i * this.squareSize;

      let x;
      if (this.quadrons[0].width === 0) {
        x = 5;
      } else if (this.quadrons[1].width === 0) {
        x = this.graphDimensions.width - 40 - i.toString().length * 5;
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
    if (!this.ctx || !this._center) return false;
    const { data, color } = graph;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 3;
    this.ctx.beginPath();
    for (const [idx, point] of data.entries()) {
      const x = this._center.x + point.x * this.squareSize;
      const y = this._center.y + point.y * this.squareSize;

      // const prevPoint = data[idx - 1];
      // if (prevPoint) {
      //   const deltaX = Math.abs(point.x - prevPoint.x);
      //   const midY = this.solveExpressionForX(
      //     graph.expression,
      //     prevPoint.x + deltaX / 2
      //   );
      //   if (midY !== null) {
      //     const absMidY = Math.abs(midY);
      //     const absPrevPointY = Math.abs(prevPoint.y);
      //     const absPointY = Math.abs(point.y);
      //     if (
      //       (absPrevPointY <= absMidY && absMidY <= absPointY) ||
      //       (absPrevPointY >= absMidY && absMidY >= absPointY)
      //     ) {
      //       this.ctx.lineTo(x, y);
      //       continue;
      //     }
      //   }
      // }
      // this.ctx.moveTo(x, y);
      this.ctx.lineTo(x, y);
    }
    this.ctx.stroke();
    return true;
  };

  private solveExpressionForX = (expression: string, x: number) => {
    try {
      const y = Parser.evaluate(
        expression.toLowerCase(),
        { x },
        { useRadians: true }
      );
      return y;
    } catch (e) {
      // console.error(e);
    }
    return null;
  };

  private isInInterval = (number: number, interval: string) => {
    interval = interval.toLowerCase();
    interval = interval.replace(/\s+/g, '');
    switch (interval) {
      // real numbers
      case 'r':
        return true;
      // integers
      case 'z':
        return Number.isInteger(number);
      // natural numbers x > 0
      case 'n':
        return number > 0;
      // whole numbers x >= 0
      case 'w':
        return number >= 0;
      default: {
        if (interval.length > 0) {
          const firstChar = interval[0];
          const lastChar = interval[interval.length - 1];
          const inside = interval.slice(1, interval.length - 1).split(/;|,/);
          if (inside.length !== 2) return false;
          const intervalStart = parseFloat(inside[0]);
          const intervalEnd = parseFloat(inside[1]);

          if (firstChar === '(') {
            if (number === intervalStart) return false;
          }
          if (lastChar === ')') {
            if (number === intervalEnd) return false;
          }
          if (intervalStart <= number && number <= intervalEnd) return true;
          return false;
        }
      }
    }
  };
  private getPointsFromExpression = (expression: string, interval: string) => {
    if (!this.quadrons || !this._center) return null;
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
      for (let j = 0; j < this.pointsPerSquare; j++) {
        const x = i + j * step;
        if (!this.isInInterval(x, interval)) continue;
        const y = this.solveExpressionForX(expression, x);
        if (
          typeof y !== 'number' ||
          Number.isNaN(y) ||
          y > this.quadrons[0].height * this.squareSize ||
          y < -this.quadrons[2].height * this.squareSize
        ) {
          continue;
        }
        // y: -y to invert x axis
        functionData.push({ x, y: -y });
      }
    }
    return functionData;
  };
  drawGraph = (expression: string, color: string, interval: string) => {
    const functionData = this.getPointsFromExpression(expression, interval);
    if (!functionData) return false;
    const newGraph = { expression, data: functionData, color, interval };
    this.graphs.push({ color, expression, interval });
    this.drawGraph_(newGraph);
    return true;
  };
  clearGraph = () => {
    if (!this.ctx || !this.graphDimensions) return false;
    this.graphs = [];
    this.ctx.clearRect(
      0,
      0,
      this.graphDimensions.width,
      this.graphDimensions.height
    );
    this.initialize();
    return true;
  };

  rerenderGraph = () => {
    if (!this.ctx || !this._center || !this.graphDimensions) return false;
    this.ctx.clearRect(
      0,
      0,
      this.graphDimensions.width,
      this.graphDimensions.height
    );
    this.drawGrid(this._center);
    this.drawAxis(this._center);
    for (const graph of this.graphs) {
      const functionData = this.getPointsFromExpression(
        graph.expression,
        graph.interval
      );
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
    if (!this.ctx || !this._center) return false;
    this._center = {
      x: this._center.x + xDelta,
      y: this._center.y + yDelta,
    };

    this.rerenderGraph();
    return true;
  };

  zoomGraph = (
    zoomDelta: number,
    center: (Point | null) | undefined = this._center
  ) => {
    if (!this.ctx || !center || !this._center) return false;

    const newSquareSize = this.squareSize + zoomDelta;
    if (ZOOM_LIMIT.MIN > newSquareSize || newSquareSize > ZOOM_LIMIT.MAX) {
      return false;
    }
    const deltaX = center.x - this._center.x;
    const deltaY = center.y - this._center.y;
    const squaresX = deltaX / this.squareSize;
    const squaresY = deltaY / this.squareSize;
    const differenceX = deltaX - squaresX * newSquareSize;
    const differenceY = deltaY - squaresY * newSquareSize;

    this._squareSize = newSquareSize;
    //  this.rerenderGraph();
    this.moveGraph(differenceX, differenceY);
    return true;
  };

  moveGraphAbsolute = (x: number, y: number) => {
    this._center = {
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
    if (!this._center) return null;

    const { x: centerX, y: centerY } = this._center;

    const relX = (absX - centerX) / this.squareSize;
    const relY = (centerY - absY) / this.squareSize;
    return { x: relX, y: relY };
  };

  showFunctionValuesAtPos = (x: number, y: number): boolean => {
    const relativeCoords = this.getRelativeCoordsFromAbsolute(x, 0);
    if (!relativeCoords || !this.ctx || !this._center || !this.graphDimensions)
      return false;

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
        this._center.y - value * this.squareSize
      );
    }

    this.ctx.fillRect(x, 0, 1, this.graphDimensions.height);
    this.ctx.fillRect(0, y, this.graphDimensions.width, 1);
    return true;
  };
  resizeGraph = (newWidth: number, newHeight: number) => {
    this.graphDimensions = {
      width: newWidth,
      height: newHeight,
    };
    this.rerenderGraph();
  };
}
