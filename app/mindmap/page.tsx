'use client';

import { useCallback, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  BackgroundVariant,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import toast, { Toaster } from 'react-hot-toast';
import Toolbar from './components/Toolbar';
import Sidebar from './components/Sidebar';
import CustomNode from './components/CustomNode';
import ImageNode from './components/ImageNode';
import CodeNode from './components/CodeNode';
import AudioNode from './components/AudioNode';
import VideoNode from './components/VideoNode';
import { getLayoutedElements } from './utils/elkLayout';

type MindMapNodeType = 'custom' | 'image' | 'code' | 'audio' | 'video';

type MindMapNodeData = {
  label: string;
  color?: string;
  isRoot?: boolean;
  onLabelChange?: (id: string, label: string) => void;
  onImageChange?: (id: string, imageUrl: string) => void;
  onCodeChange?: (id: string, code: string, language: string) => void;
  onAudioChange?: (id: string, audioUrl: string) => void;
  onVideoChange?: (id: string, videoUrl: string) => void;
  imageUrl?: string;
  code?: string;
  language?: string;
  audioUrl?: string;
  videoUrl?: string;
};

const nodeTypes = {
  custom: CustomNode,
  image: ImageNode,
  code: CodeNode,
  audio: AudioNode,
  video: VideoNode,
};

const createInitialNodes = (
  updateNodeLabel: (id: string, label: string) => void
): Node<MindMapNodeData>[] => [
  {
    id: '1',
    type: 'custom',
    data: { label: '中心主题', isRoot: true, onLabelChange: updateNodeLabel },
    position: { x: 400, y: 300 },
  },
];

const initialEdges: Edge[] = [];

const colors = [
  { main: '#3b82f6', light: '#60a5fa' }, // blue
  { main: '#10b981', light: '#34d399' }, // green
  { main: '#f59e0b', light: '#fbbf24' }, // amber
  { main: '#ec4899', light: '#f472b6' }, // pink
  { main: '#8b5cf6', light: '#a78bfa' }, // violet
  { main: '#06b6d4', light: '#22d3ee' }, // cyan
  { main: '#ef4444', light: '#f87171' }, // red
];

export default function MindMapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [nodeName, setNodeName] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [fileName, setFileName] = useState('未命名思维导图');
  const [nodeType, setNodeType] = useState<MindMapNodeType>('custom');

  const [nodes, setNodes, onNodesChange] = useNodesState<MindMapNodeData>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  // 更新节点标签的回调
  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: { ...node.data, label: newLabel },
            };
          }
          return node;
        })
      );
      toast.success('节点名称已更新');
    },
    [setNodes]
  );

  // 初始化中心主题节点（避免把 hook 放在 early return 之后）
  useEffect(() => {
    setNodes((nds) => (nds.length ? nds : createInitialNodes(updateNodeLabel)));
  }, [setNodes, updateNodeLabel]);

  // 检查登录状态
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#94a3b8', strokeWidth: 2 },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#94a3b8',
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  // 自动布局
  const onLayout = useCallback(async () => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(nodes, edges);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [nodes, edges, setNodes, setEdges]);



  // 多媒体处理函数
  const handleImageChange = useCallback((nodeId: string, imageUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, imageUrl } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleCodeChange = useCallback((nodeId: string, code: string, language: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, code, language } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleAudioChange = useCallback((nodeId: string, audioUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, audioUrl } };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleVideoChange = useCallback((nodeId: string, videoUrl: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return { ...node, data: { ...node.data, videoUrl } };
        }
        return node;
      })
    );
  }, [setNodes]);

  // 添加子节点（带名称）
  const addChildNode = useCallback(async () => {
    if (!selectedNode) {
      toast.error('请先选择一个父节点');
      return;
    }

    if (!nodeName.trim()) {
      toast.error('请输入节点名称');
      return;
    }

    const parentNode = nodes.find((n) => n.id === selectedNode);
    if (!parentNode) return;

    const newNodeId = `${Date.now()}`;
    const color = colors[Math.floor(Math.random() * colors.length)];

    const baseData: MindMapNodeData = {
      label: nodeName,
      color: color.main,
      isRoot: false,
    };

    // 根据节点类型添加对应的处理函数
    if (nodeType === 'custom') {
      baseData.onLabelChange = updateNodeLabel;
    } else if (nodeType === 'image') {
      baseData.onImageChange = handleImageChange;
    } else if (nodeType === 'code') {
      baseData.onCodeChange = handleCodeChange;
      baseData.code = '// 输入代码...';
      baseData.language = 'javascript';
    } else if (nodeType === 'audio') {
      baseData.onAudioChange = handleAudioChange;
    } else if (nodeType === 'video') {
      baseData.onVideoChange = handleVideoChange;
    }

    const newNode: Node<MindMapNodeData> = {
      id: newNodeId,
      type: nodeType,
      data: baseData,
      position: {
        x: parentNode.position.x + 250,
        y: parentNode.position.y + (Math.random() - 0.5) * 100,
      },
    };

    const newEdge: Edge = {
      id: `e${selectedNode}-${newNodeId}`,
      source: selectedNode,
      target: newNodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: color.main, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: color.main,
      },
    };

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setNodeName('');
    
    const nodeTypeNames = {
      custom: '文本节点',
      image: '图片节点',
      code: '代码节点',
      audio: '音频节点',
      video: '视频节点',
    };
    toast.success(`已添加${nodeTypeNames[nodeType]}: ${nodeName}`);

    // 自动布局
    setTimeout(async () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        updatedNodes,
        updatedEdges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }, 100);
  }, [selectedNode, nodeName, nodeType, nodes, edges, setNodes, setEdges, updateNodeLabel, handleImageChange, handleCodeChange, handleAudioChange, handleVideoChange]);

  // 快速添加默认节点（快捷键用）
  const addQuickNode = useCallback(async () => {
    if (!selectedNode) {
      toast.error('请先选择一个父节点');
      return;
    }

    const parentNode = nodes.find((n) => n.id === selectedNode);
    if (!parentNode) return;

    const newNodeId = `${Date.now()}`;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const defaultName = '新节点';

    const baseData: MindMapNodeData = {
      label: defaultName,
      color: color.main,
      isRoot: false,
    };

    // 根据节点类型添加对应的处理函数
    if (nodeType === 'custom') {
      baseData.onLabelChange = updateNodeLabel;
    } else if (nodeType === 'image') {
      baseData.onImageChange = handleImageChange;
    } else if (nodeType === 'code') {
      baseData.onCodeChange = handleCodeChange;
      baseData.code = '// 输入代码...';
      baseData.language = 'javascript';
    } else if (nodeType === 'audio') {
      baseData.onAudioChange = handleAudioChange;
    } else if (nodeType === 'video') {
      baseData.onVideoChange = handleVideoChange;
    }

    const newNode: Node<MindMapNodeData> = {
      id: newNodeId,
      type: nodeType,
      data: baseData,
      position: {
        x: parentNode.position.x + 250,
        y: parentNode.position.y + (Math.random() - 0.5) * 100,
      },
    };

    const newEdge: Edge = {
      id: `e${selectedNode}-${newNodeId}`,
      source: selectedNode,
      target: newNodeId,
      type: 'smoothstep',
      animated: true,
      style: { stroke: color.main, strokeWidth: 2 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: color.main,
      },
    };

    const updatedNodes = [...nodes, newNode];
    const updatedEdges = [...edges, newEdge];

    setNodes(updatedNodes);
    setEdges(updatedEdges);
    setSelectedNode(newNodeId); // 自动选中新节点
    
    const nodeTypeNames = {
      custom: '文本节点',
      image: '图片节点',
      code: '代码节点',
      audio: '音频节点',
      video: '视频节点',
    };
    toast.success(`已添加${nodeTypeNames[nodeType]}，双击可编辑`);

    // 自动布局
    setTimeout(async () => {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        updatedNodes,
        updatedEdges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    }, 100);
  }, [selectedNode, nodeType, nodes, edges, setNodes, setEdges, updateNodeLabel, handleImageChange, handleCodeChange, handleAudioChange, handleVideoChange]);

  // 删除选中节点及其所有子节点
  const deleteSelectedNode = useCallback(() => {
    if (!selectedNode) {
      toast.error('请先选择一个节点');
      return;
    }

    if (selectedNode === '1') {
      toast.error('不能删除中心主题节点');
      return;
    }

    const node = nodes.find((n) => n.id === selectedNode);
    const nodeName = node?.data?.label || '节点';
    const nodeType = node?.type || 'custom';
    
    const nodeTypeNames: Record<string, string> = {
      custom: '文本节点',
      image: '图片节点',
      code: '代码节点',
      audio: '音频节点',
      video: '视频节点',
    };

    // 找到所有需要删除的节点（包括子节点）
    const nodesToDelete = new Set<string>([selectedNode]);
    const findChildren = (nodeId: string) => {
      edges.forEach((edge) => {
        if (edge.source === nodeId && !nodesToDelete.has(edge.target)) {
          nodesToDelete.add(edge.target);
          findChildren(edge.target);
        }
      });
    };
    findChildren(selectedNode);

    const deleteCount = nodesToDelete.size;

    setNodes((nds) => nds.filter((n) => !nodesToDelete.has(n.id)));
    setEdges((eds) =>
      eds.filter((e) => !nodesToDelete.has(e.source) && !nodesToDelete.has(e.target))
    );
    setSelectedNode(null);
    
    if (deleteCount > 1) {
      toast.success(`已删除 ${nodeTypeNames[nodeType]} "${nodeName}" 及其 ${deleteCount - 1} 个子节点`);
    } else {
      toast.success(`已删除 ${nodeTypeNames[nodeType]} "${nodeName}"`);
    }
  }, [selectedNode, nodes, edges, setNodes, setEdges]);

  // 保存思维导图
  const saveMindMap = useCallback(async () => {
    const data = {
      name: fileName,
      nodes,
      edges,
      userId: (session?.user as any)?.id || 'admin-user',
    };

    toast.promise(
      fetch('/api/mindmaps', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(async (res) => {
        if (!res.ok) throw new Error('保存失败');
        const result = await res.json();
        console.log('保存成功:', result);
        return result;
      }),
      {
        loading: '正在保存到数据库...',
        success: '思维导图已保存！',
        error: '保存失败，请重试',
      }
    );
  }, [fileName, nodes, edges]);

  // 导出为图片
  const exportAsImage = useCallback(() => {
    toast('导出功能开发中...', {
      icon: '🚧',
    });
  }, []);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入，不触发快捷键
      if (document.activeElement?.tagName === 'INPUT') {
        return;
      }

      // Ctrl/Cmd + S: 保存
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveMindMap();
      }
      
      // Tab 或 Insert: 快速添加默认节点
      if (e.key === 'Tab' || e.key === 'Insert') {
        e.preventDefault();
        addQuickNode();
      }
      
      // Ctrl/Cmd + Enter: 添加节点（需要输入名称）
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (nodeName.trim()) {
          addChildNode();
        } else {
          addQuickNode();
        }
      }
      
      // Delete/Backspace: 删除节点
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNode) {
        e.preventDefault();
        deleteSelectedNode();
      }
      
      // Ctrl/Cmd + E: 导出
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        exportAsImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveMindMap, addChildNode, addQuickNode, deleteSelectedNode, exportAsImage, selectedNode, nodeName]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
            padding: '16px',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />

      <Toolbar
        fileName={fileName}
        onFileNameChange={setFileName}
        onSave={saveMindMap}
        onExport={exportAsImage}
      />

      <div className="flex-1 flex">
        <Sidebar
          nodes={nodes}
          edges={edges}
          selectedNode={selectedNode}
          nodeName={nodeName}
          nodeType={nodeType}
          onNodeNameChange={setNodeName}
          onNodeTypeChange={(type) => setNodeType(type as any)}
          onSelectedNodeChange={setSelectedNode}
          onAddNode={addChildNode}
          onDeleteNode={deleteSelectedNode}
        />

        <div className="flex-1 relative bg-linear-to-br from-slate-50 to-blue-50">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={(_, node) => setSelectedNode(node.id)}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-left"
            defaultEdgeOptions={{
              type: 'smoothstep',
              animated: true,
            }}
          >
            <Controls />
            <MiniMap
              nodeColor={(node) => {
                if (node.data?.isRoot) return '#6366f1';
                return node.data?.color || '#94a3b8';
              }}
              maskColor="rgba(0, 0, 0, 0.05)"
              className="bg-white! border-2! border-gray-200! rounded-xl!"
            />
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#cbd5e1" />
          </ReactFlow>

          {/* 自动布局按钮 */}
          <button
            onClick={onLayout}
            className="absolute bottom-24 right-6 px-4 py-3 bg-white text-gray-700 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-gray-200 hover:border-blue-400 font-medium flex items-center gap-2"
          >
            <span className="text-lg">🎯</span>
            <span>自动布局</span>
          </button>
        </div>
      </div>
    </div>
  );
}
