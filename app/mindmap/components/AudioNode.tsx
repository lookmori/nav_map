'use client';

import { memo, useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const AudioNode = ({ data, selected, id }: NodeProps) => {
  const [audioUrl, setAudioUrl] = useState(data.audioUrl || '');
  const [isEditing, setIsEditing] = useState(!data.audioUrl);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setAudioUrl(url);
        if (data.onAudioChange) {
          data.onAudioChange(id, url);
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
      
      <div className="p-4 w-64">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🎵</span>
          <span className="font-semibold text-gray-800">{data.label}</span>
        </div>
        
        {audioUrl && !isEditing ? (
          <div className="space-y-2">
            <audio controls className="w-full">
              <source src={audioUrl} />
              您的浏览器不支持音频播放
            </audio>
            <button
              onClick={() => setIsEditing(true)}
              className="w-full text-xs text-blue-600 hover:text-blue-700"
            >
              更换音频
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center h-20 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
            <span className="text-sm text-gray-600">点击上传音频</span>
            <span className="text-xs text-gray-400 mt-1">支持 MP3, WAV, OGG</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioUpload}
              className="hidden"
            />
          </label>
        )}
      </div>
      
      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500!" />
    </div>
  );
};

export default memo(AudioNode);
