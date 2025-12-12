'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from './Button';

interface ToolbarProps {
  fileName: string;
  onFileNameChange: (name: string) => void;
  onSave: () => void;
  onExport: () => void;
}

export default function Toolbar({ fileName, onFileNameChange, onSave, onExport }: ToolbarProps) {
  const [isEditingName, setIsEditingName] = useState(false);

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/files"
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="font-medium">返回文件列表</span>
          </Link>
          
          <div className="h-8 w-px bg-gray-300" />
          
          {isEditingName ? (
            <input
              type="text"
              value={fileName}
              onChange={(e) => onFileNameChange(e.target.value)}
              onBlur={() => setIsEditingName(false)}
              onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
              className="text-xl font-semibold text-gray-900 border-b-2 border-blue-500 outline-none px-2 bg-blue-50 rounded"
              autoFocus
            />
          ) : (
            <button
              onClick={() => setIsEditingName(true)}
              className="text-xl font-semibold text-gray-900 hover:text-blue-600 px-2 py-1 hover:bg-blue-50 rounded transition-all flex items-center gap-2"
            >
              <span>📝</span>
              <span>{fileName}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onExport} variant="secondary" icon="📥">
            导出
          </Button>
          <Button onClick={onSave} variant="primary" icon="💾">
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
