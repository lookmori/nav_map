'use client';

import imageCompression from 'browser-image-compression';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type TargetFormat = 'image/png' | 'image/jpeg' | 'image/webp';

const FORMAT_OPTIONS: Array<{ label: string; value: TargetFormat; ext: string }> = [
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'JPG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'WEBP', value: 'image/webp', ext: 'webp' },
];

export default function ImageConvertPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);

  const [targetFormat, setTargetFormat] = useState<TargetFormat>('image/png');
  const [isFormatOpen, setIsFormatOpen] = useState(false);
  const formatDropdownRef = useRef<HTMLDivElement | null>(null);

  const [convertedFile, setConvertedFile] = useState<File | null>(null);
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);

  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourceFile) {
      setSourceUrl(null);
      return;
    }

    const url = URL.createObjectURL(sourceFile);
    setSourceUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [sourceFile]);

  useEffect(() => {
    if (!convertedFile) {
      setConvertedUrl(null);
      return;
    }

    const url = URL.createObjectURL(convertedFile);
    setConvertedUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [convertedFile]);

  const outputFileName = useMemo(() => {
    if (!sourceFile) return 'converted';

    const base = sourceFile.name.replace(/\.[^./\\]+$/, '');
    const ext = FORMAT_OPTIONS.find((o) => o.value === targetFormat)?.ext ?? 'png';
    return `${base}.${ext}`;
  }, [sourceFile, targetFormat]);

  const isSvgSource = useMemo(() => {
    if (!sourceFile) return false;
    const name = sourceFile.name.toLowerCase();
    return sourceFile.type === 'image/svg+xml' || name.endsWith('.svg');
  }, [sourceFile]);

  const selectedFormatLabel = useMemo(() => {
    return FORMAT_OPTIONS.find((o) => o.value === targetFormat)?.label ?? 'PNG';
  }, [targetFormat]);

  useEffect(() => {
    const onDocMouseDown = (e: MouseEvent) => {
      if (!isFormatOpen) return;
      const el = formatDropdownRef.current;
      if (!el) return;
      if (e.target instanceof Node && el.contains(e.target)) return;
      setIsFormatOpen(false);
    };

    document.addEventListener('mousedown', onDocMouseDown);
    return () => document.removeEventListener('mousedown', onDocMouseDown);
  }, [isFormatOpen]);

  const handlePickFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError(null);
    setConvertedFile(null);
    setSourceFile(file);
  }, []);

  const convertSvgToRasterFile = useCallback(
    async (file: File, fileType: TargetFormat, fileName: string) => {
      const svgText = await file.text();

      const parseSize = () => {
        try {
          const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
          const svg = doc.querySelector('svg');
          if (!svg) return { width: 1024, height: 1024 };

          const widthAttr = svg.getAttribute('width');
          const heightAttr = svg.getAttribute('height');
          const viewBoxAttr = svg.getAttribute('viewBox');

          const parsePx = (v: string | null) => {
            if (!v) return null;
            const n = Number(String(v).replace(/px$/i, ''));
            return Number.isFinite(n) && n > 0 ? n : null;
          };

          const width = parsePx(widthAttr);
          const height = parsePx(heightAttr);
          if (width && height) return { width, height };

          if (viewBoxAttr) {
            const parts = viewBoxAttr.split(/\s+/).map((p) => Number(p));
            if (parts.length === 4 && parts.every((n) => Number.isFinite(n))) {
              const vbWidth = Math.max(1, parts[2]);
              const vbHeight = Math.max(1, parts[3]);
              return { width: Math.round(vbWidth), height: Math.round(vbHeight) };
            }
          }

          return { width: 1024, height: 1024 };
        } catch {
          return { width: 1024, height: 1024 };
        }
      };

      const { width, height } = parseSize();
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('无法创建画布上下文');

      if (fileType === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const { Canvg } = await import('canvg');
      const v = await Canvg.from(ctx, svgText);
      await v.render();

      const blob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (b) => {
            if (b) resolve(b);
            else reject(new Error('导出失败'));
          },
          fileType,
          fileType === 'image/jpeg' ? 0.92 : undefined
        );
      });

      return new File([blob], fileName, { type: fileType });
    },
    []
  );

  const handleConvert = useCallback(async () => {
    if (!sourceFile) return;

    setIsConverting(true);
    setError(null);
    setConvertedFile(null);

    try {
      if (isSvgSource) {
        const result = await convertSvgToRasterFile(sourceFile, targetFormat, outputFileName);
        setConvertedFile(result);
      } else {
        const converted = await imageCompression(sourceFile, {
          fileType: targetFormat,
          useWebWorker: true,
          maxSizeMB: 10,
          maxWidthOrHeight: 8192,
        });

        const result = new File([converted], outputFileName, { type: targetFormat });
        setConvertedFile(result);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败');
    } finally {
      setIsConverting(false);
    }
  }, [convertSvgToRasterFile, isSvgSource, outputFileName, sourceFile, targetFormat]);

  const handleDownload = useCallback(() => {
    if (!convertedUrl) return;

    const a = document.createElement('a');
    a.href = convertedUrl;
    a.download = outputFileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }, [convertedUrl, outputFileName]);

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
              <h1 className="text-xl font-bold text-gray-900">图片格式转换</h1>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">上传图片</h2>
              <p className="text-gray-600 mb-6">选择一张图片，然后选择目标格式进行转换并下载。</p>

              <label className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium cursor-pointer">
                选择图片
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePickFile}
                />
              </label>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">目标格式</label>
                <div ref={formatDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setIsFormatOpen((v) => !v)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white text-left focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{selectedFormatLabel}</span>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${isFormatOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>

                  {isFormatOpen ? (
                    <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                      {FORMAT_OPTIONS.map((opt) => {
                        const isActive = opt.value === targetFormat;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setTargetFormat(opt.value);
                              setIsFormatOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-colors ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{opt.label}</span>
                              {isActive ? (
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              ) : null}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleConvert}
                  disabled={!sourceFile || isConverting}
                  className="px-6 py-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isConverting ? '转换中...' : '开始转换'}
                </button>

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!convertedFile}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下载
                </button>
              </div>

              {error ? <div className="mt-4 text-sm text-red-600">{error}</div> : null}

              <div className="mt-6 text-sm text-gray-500">
                输出文件名：<span className="font-medium text-gray-700">{outputFileName}</span>
              </div>
              {isSvgSource ? (
                <div className="mt-3 text-xs text-gray-500">
                  SVG 会在转换时被栅格化为位图（可能受字体/外链资源影响）。
                </div>
              ) : null}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">预览</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">原图</div>
                  <div className="aspect-video bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                    {sourceUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={sourceUrl} alt="source" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-gray-400">未选择</div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm font-medium text-gray-700 mb-3">转换后</div>
                  <div className="aspect-video bg-white rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                    {convertedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={convertedUrl} alt="converted" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-gray-400">未转换</div>
                    )}
                  </div>
                </div>
              </div>

              {convertedFile ? (
                <div className="mt-4 text-sm text-gray-600">
                  转换结果：<span className="font-medium text-gray-800">{convertedFile.type}</span>，大小：
                  <span className="font-medium text-gray-800">
                    {(convertedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
