// WorkflowEditor.tsx
import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

const STORAGE_KEY = "workflow-flow";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "input",
    data: { label: "User Question" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    data: { label: "Retriever (Chroma)" },
    position: { x: 200, y: 0 },
  },
  {
    id: "3",
    type: "output",
    data: { label: "LLM Answer" },
    position: { x: 400, y: 0 },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
];

export default function WorkflowEditor() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // загрузка из localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const { nodes: n, edges: e } = JSON.parse(saved);
        setNodes(n);
        setEdges(e);
      } else {
        setNodes(initialNodes);
        setEdges(initialEdges);
      }
    } catch {
      setNodes(initialNodes);
      setEdges(initialEdges);
    }
  }, [setNodes, setEdges]);

  // сохранение при изменении
  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ nodes, edges })
    );
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <ReactFlowProvider>
      <div style={{ height: "100vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
}
