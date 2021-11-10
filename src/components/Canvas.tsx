import { useEffect, useRef, useState } from 'react';
import { AiOutlineZoomIn, AiOutlineZoomOut } from 'react-icons/ai';
import {
  FaChevronLeft,
  FaChevronRight,
  FaHome,
  FaTrashAlt,
} from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';
import { Graph } from '../graph';
import { getObjectFitSize } from '../utils/getObjectFitSize';
import { randomRGBColor } from '../utils/random';
export interface CanvasProps {}

interface GraphInput {
  expression: string;
  color: string;
}

const ZOOM_STEP = 5;
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

  const zoomIn = () => {
    if (!graph.current) return;
    const zoomDelta = ZOOM_STEP;
    graph.current.zoomGraph(zoomDelta);
  };

  const zoomOut = () => {
    if (!graph.current) return;
    const zoomDelta = -ZOOM_STEP;
    graph.current.zoomGraph(zoomDelta);
  };

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
    canvas.current.addEventListener('mousedown', () => (dragging = true));

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

    canvas.current.addEventListener('wheel', (e: WheelEvent) => {
      if (!graph.current) return;
      if (e.deltaY < 0) {
        zoomIn();
      } else {
        zoomOut();
      }
    });
    return () => {
      if (!graph.current) return;
      graph.current.clearGraph();
    };
  }, []);

  useEffect(() => {
    if (!graph.current) return;
    graph.current.clearGraph();
    graph.current.pointsPerSquare = graphDetail;
    for (const { expression, color } of graphInputs) {
      graph.current.drawGraph(expression, color);
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
  // TODO: zoom relatively to the cursor (now it is relative to the 0,0 coordinates)
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
          <table className="options-table">
            <tbody>
              <tr>
                <td>detail:</td>
                <td>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    value={graphDetail}
                    onChange={(e) => setGraphDetail(parseInt(e.target.value))}
                  />
                  <b>{graphDetail}</b>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <canvas id="graph" ref={canvas}></canvas>;
      <div className="toolbar">
        <div className="toolbar-item">
          <FaHome
            onClick={() => {
              if (!graph.current || !canvas.current) return;
              graph.current.moveGraphAbsolute(
                canvas.current.width / 2,
                canvas.current.height / 2
              );
              graph.current.resetZoom();
            }}
          />
        </div>
        <div className="toolbar-item">
          <AiOutlineZoomIn onClick={zoomIn} />
        </div>
        <div className="toolbar-item">
          <AiOutlineZoomOut onClick={zoomOut} />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
