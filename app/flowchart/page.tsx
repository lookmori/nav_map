'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  addEdge,
  BaseEdge,
  Background,
  BackgroundVariant,
  Connection,
  Controls,
  Edge,
  EdgeLabelRenderer,
  EdgeProps,
  Handle,
  getSmoothStepPath,
  MarkerType,
  MiniMap,
  Node,
  NodeProps,
  OnSelectionChangeParams,
  Position,
  ReactFlow,
  useReactFlow,
  useEdgesState,
  useNodesState,
} from 'reactflow';
import 'reactflow/dist/style.css';

type FlowNodeVariant = 'start' | 'end' | 'process' | 'decision' | 'io';

type FlowNodeData = {
  label: string;
  variant: FlowNodeVariant;
};

type FlowEdgeData = {
  label?: string;
};

const VARIANT_THEME: Record<FlowNodeVariant, { bg: string; border: string; handle: string; text: string }> = {
  start: { bg: 'bg-emerald-50', border: 'border-emerald-300', handle: '#10b981', text: 'text-emerald-700' },
  end: { bg: 'bg-rose-50', border: 'border-rose-300', handle: '#f43f5e', text: 'text-rose-700' },
  process: { bg: 'bg-purple-50', border: 'border-purple-300', handle: '#8b5cf6', text: 'text-purple-700' },
  decision: { bg: 'bg-amber-50', border: 'border-amber-300', handle: '#f59e0b', text: 'text-amber-800' },
  io: { bg: 'bg-blue-50', border: 'border-blue-300', handle: '#3b82f6', text: 'text-blue-700' },
};

const INITIAL_NODES: Node<FlowNodeData>[] = [
  {
    id: 'start',
    type: 'flow',
    position: { x: 520, y: 80 },
    data: { label: '开始', variant: 'start' },
  },
  {
    id: 'io-1',
    type: 'flow',
    position: { x: 520, y: 230 },
    data: { label: '输入/输出', variant: 'io' },
  },
  {
    id: 'process-1',
    type: 'flow',
    position: { x: 520, y: 380 },
    data: { label: '处理', variant: 'process' },
  },
  {
    id: 'decision-1',
    type: 'flow',
    position: { x: 520, y: 520 },
    data: { label: '判断？', variant: 'decision' },
  },
  {
    id: 'end',
    type: 'flow',
    position: { x: 520, y: 690 },
    data: { label: '结束', variant: 'end' },
  },
];

const EditableStepEdge = memo((props: EdgeProps<FlowEdgeData>) => {
  const { id, data, selected, markerEnd, style } = props;
  const { setEdges } = useReactFlow<FlowNodeData, FlowEdgeData>();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition,
    targetPosition: props.targetPosition,
    borderRadius: 0,
  });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = useCallback(() => {
    const v = draft.trim();
    setEdges((eds) =>
      eds.map((e) => {
        if (e.id !== id) return e;
        return { ...e, data: { ...(e.data ?? {}), label: v } };
      })
    );
    setIsEditing(false);
  }, [draft, id, setEdges]);

  const label = (data?.label ?? '').trim();

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="nodrag nopan"
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          onDoubleClick={(e) => {
            e.stopPropagation();
            setDraft(label);
            setIsEditing(true);
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
          {isEditing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={commit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setIsEditing(false);
              }}
              className="w-28 px-2 py-1 text-xs rounded-md border border-blue-300 bg-white shadow-sm outline-none"
            />
          ) : (
            <div
              className={`px-2 py-1 text-xs rounded-md border shadow-sm select-none whitespace-nowrap ${
                selected ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 bg-white text-slate-600'
              }`}
            >
              {label || '双击输入'}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
});
EditableStepEdge.displayName = 'EditableStepEdge';

const INITIAL_EDGES: Edge<FlowEdgeData>[] = [
  {
    id: 'e-start-io',
    source: 'start',
    target: 'io-1',
    type: 'step',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  },
  {
    id: 'e-io-process',
    source: 'io-1',
    target: 'process-1',
    type: 'step',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  },
  {
    id: 'e-process-decision',
    source: 'process-1',
    target: 'decision-1',
    type: 'step',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  },
  {
    id: 'e-decision-end',
    source: 'decision-1',
    target: 'end',
    sourceHandle: 'out-bottom',
    type: 'step',
    animated: false,
    style: { stroke: '#94a3b8', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
  },
];

const FlowNode = memo(({ id, data, selected }: NodeProps<FlowNodeData>) => {
  const { setNodes } = useReactFlow<FlowNodeData>();
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = VARIANT_THEME[data.variant];

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const commit = useCallback(() => {
    const v = draftLabel.trim();
    if (!v) {
      setIsEditing(false);
      return;
    }

    setNodes((nds) =>
      nds.map((n) => {
        if (n.id !== id) return n;
        return { ...n, data: { ...n.data, label: v } };
      })
    );
    setIsEditing(false);
  }, [draftLabel, id, setNodes]);

  const common = useMemo(() => {
    return `shadow-lg border-2 ${theme.bg} ${theme.border} text-gray-800 font-medium transition-all duration-150 ${
      selected ? 'ring-4 ring-blue-400 ring-opacity-40 scale-[1.02] border-blue-400' : ''
    }`;
  }, [selected, theme.bg, theme.border]);

  const content = isEditing ? (
    <input
      ref={inputRef}
      value={draftLabel}
      onChange={(e) => setDraftLabel(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === 'Enter') commit();
        if (e.key === 'Escape') {
          setIsEditing(false);
        }
      }}
      className="w-full text-center bg-transparent border-b-2 border-blue-500 outline-none"
    />
  ) : (
    <div className="text-center whitespace-nowrap cursor-pointer select-none">{data.label}</div>
  );

  if (data.variant === 'decision') {
    return (
      <div
        onDoubleClick={() => {
          setDraftLabel(data.label);
          setIsEditing(true);
        }}
        className="relative"
      >
        <Handle
          type="target"
          position={Position.Top}
          id="in-top"
          className="w-3 h-3"
          style={{ background: theme.handle, top: 2, left: '50%', transform: 'translate(-50%, -50%)' }}
        />

        <Handle
          type="source"
          position={Position.Left}
          id="out-left"
          className="w-3 h-3"
          style={{ background: theme.handle, left: 2, top: '50%', transform: 'translate(-50%, -50%)' }}
        />
        <Handle
          type="source"
          position={Position.Right}
          id="out-right"
          className="w-3 h-3"
          style={{ background: theme.handle, right: 2, top: '50%', transform: 'translate(50%, -50%)' }}
        />

        <div className="w-52 h-28 relative flex items-center justify-center">
          <svg
            className="absolute inset-0"
            viewBox="0 0 200 120"
            preserveAspectRatio="none"
          >
            <polygon
              points="100,4 196,60 100,116 4,60"
              fill="#FFFBEB"
              stroke="#FCD34D"
              strokeWidth="3"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className={`relative px-6 ${theme.text}`}>{content}</div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          id="out-bottom"
          className="w-3 h-3"
          style={{ background: theme.handle, bottom: 2, left: '50%', transform: 'translate(-50%, 50%)' }}
        />
      </div>
    );
  }

  if (data.variant === 'io') {
    return (
      <div
        onDoubleClick={() => {
          setDraftLabel(data.label);
          setIsEditing(true);
        }}
        className="relative"
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3"
          style={{ background: theme.handle }}
        />
        <div className={`${common} px-8 py-4 rounded-xl -skew-x-12`}>
          <div className={`skew-x-12 ${theme.text}`}>{content}</div>
        </div>
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3"
          style={{ background: theme.handle }}
        />
      </div>
    );
  }

  const isStartEnd = data.variant === 'start' || data.variant === 'end';

  return (
    <div
      onDoubleClick={() => {
        setDraftLabel(data.label);
        setIsEditing(true);
      }}
      className={`${common} ${isStartEnd ? 'rounded-full' : 'rounded-2xl'} px-8 py-4 min-w-[180px]`}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3"
        style={{ background: theme.handle }}
      />
      <div className={theme.text}>{content}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3"
        style={{ background: theme.handle }}
      />
    </div>
  );
});
FlowNode.displayName = 'FlowNode';

const nodeTypes = { flow: FlowNode };
const edgeTypes = { editableStep: EditableStepEdge };

export default function FlowchartPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);

  const [nodes, setNodes, onNodesChange] = useNodesState<FlowNodeData>(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState<FlowEdgeData>(INITIAL_EDGES);

  const onConnect = useCallback(
    (params: Connection) => {
      const isDecisionBranch = params.sourceHandle === 'out-left' || params.sourceHandle === 'out-right';
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: isDecisionBranch ? 'editableStep' : 'step',
            data: isDecisionBranch ? { label: '' } : undefined,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const addNode = useCallback(
    (variant: FlowNodeVariant) => {
      const id = `${variant}-${Date.now()}`;
      const label =
        variant === 'start'
          ? '开始'
          : variant === 'end'
          ? '结束'
          : variant === 'process'
          ? '处理'
          : variant === 'decision'
          ? '判断？'
          : '输入/输出';

      setNodes((nds) => {
        const last = nds[nds.length - 1];
        const x = last ? last.position.x : 520;
        const y = last ? last.position.y + 160 : 80;
        const n: Node<FlowNodeData> = {
          id,
          type: 'flow',
          position: { x, y },
          data: { label, variant },
        };
        return [...nds, n];
      });
    },
    [setNodes]
  );

  const connectSelected = useCallback(() => {
    if (selectedNodeIds.length !== 2) return;

    const [source, target] = selectedNodeIds;
    setEdges((eds) =>
      addEdge(
        {
          id: `e-${source}-${target}-${Date.now()}`,
          source,
          target,
          type: 'step',
          style: { stroke: '#94a3b8', strokeWidth: 2 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
        },
        eds
      )
    );
  }, [selectedNodeIds, setEdges]);

  const deleteSelected = useCallback(() => {
    if (!selectedNodeIds.length) return;

    const ids = new Set(selectedNodeIds);
    setNodes((nds) => nds.filter((n) => !ids.has(n.id)));
    setEdges((eds) => eds.filter((e) => !ids.has(e.source) && !ids.has(e.target)));
    setSelectedNodeIds([]);
  }, [selectedNodeIds, setEdges, setNodes]);

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    setSelectedNodeIds(params.nodes.map((n) => n.id));
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="h-screen flex flex-col bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                <span>返回首页</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">流程图</h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => addNode('start')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors font-medium"
              >
                开始
              </button>
              <button
                type="button"
                onClick={() => addNode('end')}
                className="px-4 py-2 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-colors font-medium"
              >
                结束
              </button>
              <button
                type="button"
                onClick={() => addNode('io')}
                className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
              >
                输入/输出
              </button>
              <button
                type="button"
                onClick={() => addNode('process')}
                className="px-4 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium"
              >
                处理
              </button>
              <button
                type="button"
                onClick={() => addNode('decision')}
                className="px-4 py-2 bg-amber-600 text-white rounded-full hover:bg-amber-700 transition-colors font-medium"
              >
                判断
              </button>

              <div className="h-6 w-px bg-gray-300" />

              <button
                type="button"
                onClick={connectSelected}
                disabled={selectedNodeIds.length !== 2}
                className="px-4 py-2 bg-gray-900 text-white rounded-full hover:bg-black transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                连线
              </button>

              <button
                type="button"
                onClick={deleteSelected}
                disabled={!selectedNodeIds.length}
                className="px-4 py-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-colors font-medium border-2 border-gray-200 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onSelectionChange={onSelectionChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionRadius={40}
          fitView
          attributionPosition="bottom-left"
          defaultEdgeOptions={{
            type: 'step',
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' },
          }}
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const v = (node.data as FlowNodeData | undefined)?.variant;
              if (v === 'start') return '#10b981';
              if (v === 'end') return '#f43f5e';
              if (v === 'decision') return '#f59e0b';
              if (v === 'io') return '#3b82f6';
              return '#8b5cf6';
            }}
            maskColor="rgba(0, 0, 0, 0.05)"
            className="bg-white! border-2! border-gray-200! rounded-xl!"
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
        </ReactFlow>

        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur rounded-2xl shadow-lg border border-gray-200 px-4 py-3 text-sm text-gray-600">
          <div className="font-medium text-gray-800 mb-1">操作提示</div>
          <div>拖拽节点移动；拖拽节点上下连接点创建箭头连线。</div>
          <div>选中 2 个节点后可点击“连线”。双击节点可编辑文字。</div>
        </div>
      </div>
    </div>
  );
}
