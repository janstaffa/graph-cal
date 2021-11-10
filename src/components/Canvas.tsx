import { useEffect, useRef, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTrashAlt } from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';
import { Graph } from '../graph';
import { getObjectFitSize } from '../utils/getObjectFitSize';
import { randomRGBColor } from '../utils/random';
export interface CanvasProps {}

interface GraphInput {
  expression: string;
  color: string;
}

const ZOOM_STEP = 3;
const MAX_ZOOM = {
  MAX: 200,
  MIN: 10,
};
const Canvas: React.FC<CanvasProps> = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const graph = useRef<Graph>();
  const [graphInputs, setGraphInputs] = useState<GraphInput[]>([
    { expression: 'x', color: randomRGBColor() },
  ]);
  const graphInputsRef = useRef<GraphInput[]>(graphInputs);
  graphInputsRef.current = graphInputs;

  const addGraphRef = useRef<HTMLDivElement>(null);

  const [toolboxOpen, setToolBoxOpen] = useState<boolean>(true);

  const [graphDetail, setGraphDetail] = useState<number>(15);
  const graphDetailRef = useRef<number>(graphDetail);
  graphDetailRef.current = graphDetail;

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
    graph.current = new Graph(canvas.current);

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
      graph.current.transformGraph({
        xDelta: e.movementX,
        yDelta: e.movementY,
        points: graphDetailRef.current,
      });
    });
    canvas.current.addEventListener('wheel', (e: WheelEvent) => {
      if (!graph.current) return;
      let zoomDelta = 0;
      if (e.deltaY < 0) {
        if (graph.current.squareSize + ZOOM_STEP > MAX_ZOOM.MAX) return;
        zoomDelta = ZOOM_STEP;
      } else {
        if (graph.current.squareSize - ZOOM_STEP < MAX_ZOOM.MIN) return;
        zoomDelta = -ZOOM_STEP;
      }
      graph.current.transformGraph({
        xDelta: 0,
        yDelta: 0,
        zoomDelta: zoomDelta,
        points: graphDetailRef.current,
      });
    });
  }, []);

  useEffect(() => {
    if (!graph.current) return;
    graph.current.clearGraph();
    for (const { expression, color } of graphInputs) {
      graph.current.drawGraph(expression, color, graphDetail);
    }

    if (graphInputs.filter((graph) => graph.expression === '').length > 0) {
      addGraphRef.current?.classList.add('banned');
    } else {
      addGraphRef.current?.classList.remove('banned');
    }
  }, [graphInputs, graphDetail]);

  const addGraph = () => {
    if (
      graphInputsRef.current.filter((graph) => graph.expression === '').length >
      0
    )
      return;
    const newGraphInput: GraphInput = {
      color: randomRGBColor(),
      expression: '',
    };
    setGraphInputs([...graphInputsRef.current, newGraphInput]);
  };

  // TODO: store graph data in URL
  return (
    <div>
      <div
        className="toolbox-control"
        onClick={() => setToolBoxOpen(!toolboxOpen)}
      >
        {toolboxOpen ? <FaChevronLeft /> : <FaChevronRight />}
      </div>
      <div
        className="toolbox"
        style={{ visibility: toolboxOpen ? 'visible' : 'hidden' }}
      >
        {/* <h1>Graph-cal</h1> */}
        {graphInputs.map((graphInput, idx) => (
          <div className="graph-input" key={idx}>
            <div
              className="color-code"
              style={{ backgroundColor: graphInput.color }}
            ></div>
            <div className="graph-info">
              <span>f(x)</span> =
            </div>
            <input
              type="text"
              value={graphInput.expression}
              onChange={(e) => {
                const updatedGraphInputs = [...graphInputs];
                const thisGraph = updatedGraphInputs[idx];
                updatedGraphInputs[idx] = {
                  ...thisGraph,
                  expression: e.target.value,
                };

                setGraphInputs(updatedGraphInputs);
              }}
            />
            <div
              className="remove"
              onClick={() => {
                const updatedGraphInputs = [...graphInputs];
                updatedGraphInputs.splice(idx, 1);

                setGraphInputs(updatedGraphInputs);
              }}
            >
              <FaTrashAlt />
            </div>
          </div>
        ))}
        <div className="add-graph" onClick={addGraph} ref={addGraphRef}>
          <IoMdAddCircle />
        </div>
        <hr />
        <div className="toolbox-options">
          <div>
            <b>Options:</b>
          </div>
          <div>
            <label>detail: </label>
            <input
              type="range"
              min={1}
              max={20}
              value={graphDetail}
              onChange={(e) => setGraphDetail(parseInt(e.target.value))}
            />
            {graphDetail}
          </div>
        </div>
      </div>
      <canvas id="graph" ref={canvas}></canvas>;
    </div>
  );
};

export default Canvas;
