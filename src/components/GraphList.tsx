import { GraphInput } from './Canvas';
import GraphItem from './GraphItem';

export interface GraphListProps {
  graphs: GraphInput[];
  setGraphInputs: React.Dispatch<React.SetStateAction<GraphInput[]>>;
}

const GraphList: React.FC<GraphListProps> = ({ graphs, setGraphInputs }) => {
  return (
    <>
      {graphs.map((graphInput, idx) => (
        <GraphItem
          idx={idx}
          graph={graphInput}
          graphs={graphs}
          setGraphInputs={setGraphInputs}
          key={idx}
        />
      ))}
    </>
  );
};

export default GraphList;
