import { useEffect, useRef, useState } from "react";
import { Graph } from "../graph";
import { getObjectFitSize } from "../utils/getObjectFitSize";
export interface CanvasProps {}

const Canvas: React.FC<CanvasProps> = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [currentExpression, setCurrentExpression] = useState<string>("");
  const graph = useRef<Graph>();

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
    graph.current = new Graph(canvas.current, 40);

    graph.current.initialize();
  }, []);

  useEffect(() => {
    if (currentExpression.length === 0 || !graph.current) return;
    graph.current.clearGraph();
    graph.current.drawFunction(currentExpression, 5, "#ff0000");
  }, [currentExpression]);
  return (
    <div>
      <div className="toolbox">
        <div className="expression-input">
          <label>f(x) = </label>
          <input
            type="text"
            value={currentExpression}
            onChange={(e) => setCurrentExpression(e.target.value)}
          />
        </div>
      </div>
      <canvas ref={canvas}></canvas>;
    </div>
  );
};

export default Canvas;
