'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CustomNode = ({ data, selected, id }: NodeProps) => {
  const isRoot = data.isRoot;
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    if (label.trim() && data.onLabelChange) {
      data.onLabelChange(id, label.trim());
    } else {
      setLabel(data.label as string);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBlur();
    } else if (e.key === 'Escape') {
      setLabel(data.label as string);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`px-6 py-3 rounded-xl shadow-lg transition-all duration-200 ${
        isRoot
          ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold min-w-[200px]'
          : 'bg-white text-gray-800 font-medium border-2 min-w-[160px]'
      } ${
        selected
          ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105'
          : isRoot
          ? 'border-indigo-700'
          : 'border-gray-200 hover:border-blue-400'
      }`}
      style={{
        borderColor: !isRoot && data.color ? data.color : undefined,
      }}
      onDoubleClick={handleDoubleClick}
    >
      {!isRoot && <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500!" />}
      
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="text-center bg-transparent border-b-2 border-blue-500 outline-none w-full min-w-[100px]"
          style={{ color: isRoot ? 'white' : 'inherit' }}
        />
      ) : (
        <div className="text-center whitespace-nowrap cursor-pointer">{data.label}</div>
      )}
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500!" />
    </div>
  );
};

export default memo(CustomNode);
