import { useEffect, useRef, useState } from 'react';
import { Graph } from '../graph';
import { getObjectFitSize } from '../utils/getObjectFitSize';
export interface CanvasProps {}

interface GraphInput {
  expression: string;
  color: string;
}
const Canvas: React.FC<CanvasProps> = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [currentExpression, setCurrentExpression] = useState<string>('');
  const graph = useRef<Graph>();
  const [graphInputs, setGraphInputs] = useState<GraphInput[]>([]);
  useEffect(() => {
    if (!canvas.current) return;
    const dimensions = getObjectFitSize(
      true,
      canvas.current.clientWidth,
      canvas.current.clientHeight,
      canvas.current.width,
      canvas.current.height
    );

    canvas.current.width = dimensions.width;
    canvas.current.height = dimensions.height;
    graph.current = new Graph(canvas.current, 20);

    graph.current.initialize();

    let dragging = false;
    canvas.current.addEventListener('mousedown', (e) => {
      dragging = true;
    });

    const stopDrag = () => {
      dragging = false;
      canvas.current?.classList.remove('dragging');
    };
    canvas.current.addEventListener('mouseup', stopDrag);
    canvas.current.addEventListener('mouseleave', stopDrag);

    canvas.current.addEventListener('mousemove', (e) => {
      if (!dragging || !graph.current) return;

      canvas.current?.classList.add('dragging');
      graph.current.moveGraph(e.movementX, e.movementY);
    });
    canvas.current.addEventListener('wheel', () => {
      console.log('scrolling');
    });
    //  canvas.current.addEventListener('mousewheel', (e: WheelEvent) => {
    //    // e.preventDefault();
    //    // if (e.wheelDelta < 0) {
    //    //   unzoom();
    //    // } else {
    //    //   zoom();
    //    // }
    //  });
  }, []);

  useEffect(() => {
    if (currentExpression.length === 0 || !graph.current) return;
    graph.current.clearGraph();
    graph.current.drawGraph(currentExpression, '#ff0000');
  }, [currentExpression]);

  const addGraph = () => {
    setGraphInputs([{ color: '#00ff00', expression: '2*x' }]);
  };
  return (
    <div>
      <div className="toolbox">
        <div className="expression-input">
          <div className="color-code"></div>
          <label>f(x) = </label>
          <input
            type="text"
            value={currentExpression}
            onChange={(e) => setCurrentExpression(e.target.value)}
          />
        </div>
        {graphInputs.map((graphInput) => (
          <div className="expression-input">
            <div
              className="color-code"
              style={{ backgroundColor: graphInput.color }}
            ></div>
            <label>f(x) = </label>
            <input type="text" value={graphInput.expression} />
          </div>
        ))}
        <div className="add-graph" onClick={addGraph}>
          +
        </div>
      </div>
      <canvas id="graph" ref={canvas}></canvas>;
    </div>
  );
};

export default Canvas;
