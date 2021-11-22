import { useEffect, useRef, useState } from 'react';
import {
  AiOutlineAim,
  AiOutlineZoomIn,
  AiOutlineZoomOut,
} from 'react-icons/ai';
import { FaChevronLeft, FaChevronRight, FaHome } from 'react-icons/fa';
import { IoMdAddCircle } from 'react-icons/io';
import { Graph } from '../graph';
import { getObjectFitSize } from '../utils/getObjectFitSize';
import { randomRGBColor } from '../utils/random';
import GraphList from './GraphList';
export interface CanvasProps {}

export interface GraphInput {
  id: number;
  expression: string;
  color: string;
  enabled: boolean;
  interval: string;
}

const ZOOM_STEP = 5;
const Canvas: React.FC<CanvasProps> = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const graph = useRef<Graph>();
  const [graphInputs, setGraphInputs] = useState<GraphInput[]>([
    {
      id: 1,
      expression: 'x',
      color: randomRGBColor(),
      enabled: true,
      interval: 'R',
    },
  ]);
  const graphInputsRef = useRef<GraphInput[]>(graphInputs);
  graphInputsRef.current = graphInputs;

  const addGraphRef = useRef<HTMLDivElement>(null);

  const [toolboxOpen, setToolBoxOpen] = useState<boolean>(true);

  const [graphDetail, setGraphDetail] = useState<number>(15);
  const graphDetailRef = useRef<number>(graphDetail);
  graphDetailRef.current = graphDetail;

  const [relativeCoords, setRelativeCoords] = useState<{
    x: number;
    y: number;
  }>({ x: 0, y: 0 });

  const [showValueAtX, setShowValueAtX] = useState<boolean>(false);
  const showValueAtXRef = useRef<boolean>(showValueAtX);
  showValueAtXRef.current = showValueAtX;

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
      if (!graph.current) return;
      if (dragging) {
        canvas.current?.classList.add('dragging');
        graph.current.moveGraph(e.movementX, e.movementY);
      }

      const relCoords = graph.current.getRelativeCoordsFromAbsolute(e.x, e.y);
      if (!relCoords) return;

      setRelativeCoords(relCoords);
      if (showValueAtXRef.current) {
        graph.current.showFunctionValuesAtPos(e.x, e.y);
      }
    });

    canvas.current.addEventListener('wheel', (e: WheelEvent) => {
      if (!graph.current) return;
      let zoomDelta = ZOOM_STEP;
      if (e.deltaY > 0) {
        zoomDelta = -ZOOM_STEP;
      }
      graph.current.zoomGraph(zoomDelta, { x: e.x, y: e.y });
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
    for (const { expression, color, enabled, interval } of graphInputs) {
      if (!enabled) continue;
      graph.current.drawGraph(expression, color, interval);
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
    const lastGraph = graphInputsRef.current[graphInputsRef.current.length - 1];

    const newId = lastGraph ? lastGraph.id + 1 : 1;
    const newGraphInput: GraphInput = {
      id: newId,
      color: randomRGBColor(),
      expression: '',
      enabled: true,
      interval: 'R',
    };
    setGraphInputs([...graphInputsRef.current, newGraphInput]);
  };

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
        <GraphList graphs={graphInputs} setGraphInputs={setGraphInputs} />
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
      <canvas id="graph" ref={canvas}></canvas>
      <div className="graph-info">
        <div className="relative-wrap">
          X: <div className="relative-value">{relativeCoords.x.toFixed(2)}</div>
        </div>
        <div className="relative-wrap">
          Y: <div className="relative-value">{relativeCoords.y.toFixed(2)}</div>
        </div>
      </div>
      <div className="toolbar">
        <div
          className={'toolbar-item' + (!showValueAtX ? ' disabled' : '')}
          onClick={() => {
            if (showValueAtXRef) {
              graph.current?.rerenderGraph();
            }
            setShowValueAtX(!showValueAtX);
          }}
        >
          <AiOutlineAim />
        </div>
        <div
          className="toolbar-item"
          onClick={() => {
            if (!graph.current || !canvas.current) return;
            graph.current.moveGraphAbsolute(
              canvas.current.width / 2,
              canvas.current.height / 2
            );
            graph.current.resetZoom();
          }}
        >
          <FaHome />
        </div>
        <div
          className="toolbar-item"
          onClick={() => {
            if (!canvas.current) return;
            graph.current?.zoomGraph(ZOOM_STEP, {
              x: canvas.current.width / 2,
              y: canvas.current.height / 2,
            });
          }}
        >
          <AiOutlineZoomIn />
        </div>
        <div
          className="toolbar-item"
          onClick={() => {
            if (!canvas.current) return;
            graph.current?.zoomGraph(-ZOOM_STEP, {
              x: canvas.current.width / 2,
              y: canvas.current.height / 2,
            });
          }}
        >
          <AiOutlineZoomOut />
        </div>
      </div>
    </div>
  );
};

export default Canvas;
