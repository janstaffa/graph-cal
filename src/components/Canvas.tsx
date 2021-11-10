import { useEffect, useRef, useState } from "react";
import { Graph } from "../graph";
import { getObjectFitSize } from "../utils/getObjectFitSize";
import { randomRGBColor } from "../utils/random";
import { FaTrashAlt } from "react-icons/fa";
export interface CanvasProps {}

interface GraphInput {
  expression: string;
  color: string;
}
const Canvas: React.FC<CanvasProps> = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [currentExpression, setCurrentExpression] = useState<string>("");
  const graph = useRef<Graph>();
  const [graphInputs, setGraphInputs] = useState<GraphInput[]>([
    { expression: "x", color: "#f00" },
    { expression: "", color: "#00f" },
  ]);
  const graphInputsRef = useRef<GraphInput[]>(graphInputs);
  graphInputsRef.current = graphInputs;

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
    canvas.current.addEventListener("mousedown", (e) => {
      dragging = true;
    });

    const stopDrag = () => {
      dragging = false;
      canvas.current?.classList.remove("dragging");
    };
    canvas.current.addEventListener("mouseup", stopDrag);
    canvas.current.addEventListener("mouseleave", stopDrag);

    canvas.current.addEventListener("mousemove", (e) => {
      if (!dragging || !graph.current) return;

      canvas.current?.classList.add("dragging");
      graph.current.moveGraph(e.movementX, e.movementY);
    });
    canvas.current.addEventListener("wheel", () => {
      console.log("scrolling");
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
    if (!graph.current) return;
    graph.current.clearGraph();
    for (const input of graphInputs) {
      graph.current.drawGraph(input.expression, input.color);
    }
  }, [graphInputs]);
  const addGraph = () => {
    console.log("called");
    const newGraphInput: GraphInput = {
      color: randomRGBColor(),
      expression: "",
    };
    setGraphInputs([...graphInputsRef.current, newGraphInput]);
  };
  return (
    <div>
      <div className="toolbox">
        {graphInputs.map((graphInput, idx) => (
          <div className="expression-input" key={idx}>
            <div
              className="color-code"
              style={{ backgroundColor: graphInput.color }}
            ></div>
            <label>f(x) = </label>
            <input
              type="text"
              value={graphInput.expression}
              onChange={(e) => {
                const updatedGraphInputs = [...graphInputs];
                const thisGraph = updatedGraphInputs[idx];
                const newGraphInput: GraphInput = {
                  color: randomRGBColor(),
                  expression: "",
                };
                updatedGraphInputs[idx] = {
                  ...thisGraph,
                  expression: e.target.value,
                };
                if (idx === graphInputs.length - 1) {
                  if (thisGraph.expression === "" && e.target.value !== "") {
                    updatedGraphInputs.push(newGraphInput);
                  }
                }

                setGraphInputs(updatedGraphInputs);
              }}
            />
            <div className="remove">
              <FaTrashAlt />
            </div>
          </div>
        ))}
      </div>
      <canvas id="graph" ref={canvas}></canvas>;
    </div>
  );
};

export default Canvas;
