'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

const CodeNode = ({ data, selected, id }: NodeProps) => {
  const [code, setCode] = useState(data.code || '// 输入代码...');
  const [language, setLanguage] = useState(data.language || 'javascript');
  const [isEditing, setIsEditing] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '🟨' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
  ];

  const currentLang = languages.find((l) => l.value === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = () => {
    if (data.onCodeChange) {
      data.onCodeChange(id, code, language);
    }
    setIsEditing(false);
  };

  return (
    <div
      className={`bg-gray-900 rounded-xl shadow-lg border-2 transition-all duration-200 overflow-visible ${
        selected ? 'ring-4 ring-blue-400 ring-opacity-50 scale-105' : 'border-gray-700 hover:border-blue-400'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 bg-blue-500!" />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">💻</span>
            
            {/* 自定义下拉框 */}
            <div ref={langRef} className="relative">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 bg-gray-800 text-white text-xs px-3 py-1.5 rounded-lg border border-gray-700 hover:border-blue-500 transition-all"
              >
                <span>{currentLang.icon}</span>
                <span>{currentLang.label}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${isLangOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isLangOpen && (
                <div className="absolute z-50 top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                  {languages.map((lang) => (
                    <button
                      key={lang.value}
                      onClick={() => {
                        setLanguage(lang.value);
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                        language === lang.value
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span>{lang.icon}</span>
                      <span>{lang.label}</span>
                      {language === lang.value && (
                        <svg className="w-3 h-3 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-white text-xs px-3 py-1.5 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            {isEditing ? '✓ 完成' : '✏️ 编辑'}
          </button>
        </div>

        {isEditing ? (
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onBlur={handleSave}
            className="w-64 h-32 bg-gray-800 text-green-400 font-mono text-xs p-3 rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all"
            spellCheck={false}
          />
        ) : (
          <pre className="w-64 h-32 bg-gray-800 text-green-400 font-mono text-xs p-3 rounded-lg overflow-auto border border-gray-700">
            {code}
          </pre>
        )}

        <div className="mt-2 text-center text-sm font-medium text-white">{data.label}</div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 bg-blue-500!" />
    </div>
  );
};

export default memo(CodeNode);
