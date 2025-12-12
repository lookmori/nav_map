'use client';

import { Node, Edge } from 'reactflow';
import Select from './Select';
import Input from './Input';
import Button from './Button';

interface SidebarProps {
  nodes: Node[];
  edges: Edge[];
  selectedNode: string | null;
  nodeName: string;
  nodeType: string;
  onNodeNameChange: (value: string) => void;
  onNodeTypeChange: (value: string) => void;
  onSelectedNodeChange: (value: string) => void;
  onAddNode: () => void;
  onDeleteNode: () => void;
}

export default function Sidebar({
  nodes,
  edges,
  selectedNode,
  nodeName,
  nodeType,
  onNodeNameChange,
  onNodeTypeChange,
  onSelectedNodeChange,
  onAddNode,
  onDeleteNode,
}: SidebarProps) {
  const nodeOptions = nodes.map((node) => ({
    value: node.id,
    label: node.data.label as string,
  }));

  const nodeTypeOptions = [
    { value: 'custom', label: '📝 文本节点', icon: '📝' },
    { value: 'image', label: '🖼️ 图片节点', icon: '🖼️' },
    { value: 'code', label: '💻 代码节点', icon: '💻' },
    { value: 'audio', label: '🎵 音频节点', icon: '🎵' },
    { value: 'video', label: '🎬 视频节点', icon: '🎬' },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 space-y-6">
        {/* 添加节点 */}
        <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border-2 border-blue-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">➕</span>
            <span>添加节点</span>
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                节点类型
              </label>
              <div className="grid grid-cols-2 gap-2">
                {nodeTypeOptions.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => onNodeTypeChange(type.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      nodeType === type.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-gray-700">
                      {type.label.replace(/^..\s/, '')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                选择父节点
              </label>
              <Select
                options={nodeOptions}
                value={selectedNode || ''}
                onChange={onSelectedNodeChange}
                placeholder="请选择父节点..."
              />
            </div>

            <Input
              value={nodeName}
              onChange={onNodeNameChange}
              onKeyDown={(e) => e.key === 'Enter' && onAddNode()}
              placeholder="输入节点名称..."
              label="节点名称"
            />

            <Button
              onClick={onAddNode}
              disabled={!selectedNode || !nodeName.trim()}
              variant="success"
              fullWidth
              icon="✨"
            >
              添加节点
            </Button>
          </div>
        </div>

        {/* 节点操作 */}
        {selectedNode && (
          <div className="bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>节点操作</span>
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">当前选中</p>
                <p className="font-semibold text-gray-900 text-lg">
                  {nodes.find((n) => n.id === selectedNode)?.data.label as string}
                </p>
              </div>
              {selectedNode !== '1' && (
                <Button onClick={onDeleteNode} variant="danger" fullWidth icon="🗑️">
                  删除节点
                </Button>
              )}
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span>统计信息</span>
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-gray-600 flex items-center gap-2">
                <span className="text-xl">🔵</span>
                <span>节点数量</span>
              </span>
              <span className="text-2xl font-bold text-blue-600">{nodes.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-xl">
              <span className="text-gray-600 flex items-center gap-2">
                <span className="text-xl">🔗</span>
                <span>连接数量</span>
              </span>
              <span className="text-2xl font-bold text-purple-600">{edges.length}</span>
            </div>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className="bg-linear-to-br from-gray-50 to-slate-50 rounded-2xl p-6 border-2 border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span className="text-2xl">⌨️</span>
            <span>快捷键</span>
          </h3>
          <div className="space-y-2 text-sm">
            <div className="p-2 bg-blue-50 rounded-lg mb-2">
              <p className="text-xs text-blue-700 font-medium">💡 提示：先选择节点类型，再添加节点</p>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
              <span className="text-gray-600">快速添加</span>
              <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                Tab
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
              <span className="text-gray-600">编辑节点</span>
              <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                双击
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
              <span className="text-gray-600">删除节点</span>
              <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                Delete
              </kbd>
            </div>
            <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
              <span className="text-gray-600">保存</span>
              <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                Ctrl + S
              </kbd>
            </div>
            <div className="pt-3 border-t-2 border-gray-200 mt-3">
              <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                <span className="text-gray-600">自动布局</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                  点击按钮
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                <span className="text-gray-600">拖动画布</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                  鼠标拖动
                </kbd>
              </div>
              <div className="flex justify-between items-center p-2 hover:bg-white rounded-lg transition-colors">
                <span className="text-gray-600">缩放</span>
                <kbd className="px-3 py-1 bg-white border-2 border-gray-300 rounded-lg font-mono text-xs font-semibold shadow-sm">
                  滚轮
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
