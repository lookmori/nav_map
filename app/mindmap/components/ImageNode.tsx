'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const ImageNode = ({ data, selected, id }: NodeProps) => {
  const [imageUrl, setImageUrl] = useState(data.imageUrl || '');
  const [isEditing, setIsEditing] = useState(!data.imageUrl);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImageUrl(url);
        if (data.onImageChange) {
          data.onImageChange(id, url);
        }
        setIsEditing(false);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-200 overflow-hidden ${
        selected ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'border-gray-200 hover:border-blue-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500!" />
      
      <div className="p-3">
        {imageUrl && !isEditing ? (
          <div className="relative group">
            <img
              src={imageUrl}
              alt={data.label as string}
              className="w-48 h-32 object-cover rounded-lg"
            />
            <button
              onClick={() => setIsEditing(true)}
              className="absolute top-2 right-2 bg-white/90 p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✏️
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-4xl mb-2">🖼️</span>
            <span className="text-sm text-gray-600">点击上传图片</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
        <div className="mt-2 text-center text-sm font-medium text-gray-700">{data.label}</div>
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500!" />
    </div>
  );
};

export default memo(ImageNode);
