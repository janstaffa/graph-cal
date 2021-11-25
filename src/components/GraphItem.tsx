import { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaTrashAlt } from 'react-icons/fa';
import { GraphInput } from './Canvas';

export interface GraphInputProps {
  idx: number;
  graph: GraphInput;
  graphs: GraphInput[];
  setGraphInputs: React.Dispatch<React.SetStateAction<GraphInput[]>>;
}

const GraphItem: React.FC<GraphInputProps> = ({
  idx,
  graph,
  graphs,
  setGraphInputs,
}) => {
  const updateGraph = (updatedGraph: GraphInput) => {
    const updatedGraphInputs = [...graphs];
    updatedGraphInputs[idx] = updatedGraph;
    setGraphInputs(updatedGraphInputs);
  };

  const [showIntervalInput, setShowIntervalInput] = useState<boolean>(false);
  return (
    <div className="graph-input">
      <div
        className={'color-code' + (!graph.enabled ? ' disabled' : '')}
        style={{ backgroundColor: graph.color }}
        onClick={() => {
          updateGraph({ ...graph, enabled: !graph.enabled });
        }}
      ></div>
      <div className="function-info">
        <span>
          f<span className="function-name">{graph.id}</span>(x)
        </span>
        =
      </div>
      <div className="function-input-wrap">
        <input
          type="text"
          value={graph.expression}
          onChange={(e) => {
            updateGraph({ ...graph, expression: e.target.value });
          }}
          spellCheck={false}
        />
        <div className="function-interval">
          {showIntervalInput && (
            <>
              x∈
              <input
                type="text"
                placeholder="(0; Infinity>"
                value={graph.interval}
                onChange={(e) => {
                  updateGraph({ ...graph, interval: e.target.value });
                }}
              />
            </>
          )}

          <div
            className="function-interval-toggle"
            onClick={() => {
              setShowIntervalInput(!showIntervalInput);
            }}
          >
            {showIntervalInput ? <FaChevronRight /> : <FaChevronLeft />}
          </div>
        </div>
      </div>
      <div
        className="remove"
        onClick={() => {
          const updatedGraphInputs = [...graphs];
          updatedGraphInputs.splice(idx, 1);

          setGraphInputs(updatedGraphInputs);
        }}
      >
        <FaTrashAlt />
      </div>
    </div>
  );
};

export default GraphItem;
