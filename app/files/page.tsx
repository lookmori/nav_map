'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface MindMap {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function FilesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mindmaps, setMindmaps] = useState<MindMap[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      loadMindMaps();
    }
  }, [session]);

  const loadMindMaps = async () => {
    try {
      setLoading(true);
      const userId = (session?.user as any)?.id || 'admin-user';
      const response = await fetch(`/api/mindmaps?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('加载失败');
      }

      const data = await response.json();
      setMindmaps(data);
    } catch (error) {
      toast.error('加载文件列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMindMap = async (id: string, name: string) => {
    if (!confirm(`确定要删除"${name}"吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/mindmaps/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('删除失败');
      }

      toast.success('删除成功');
      loadMindMaps();
    } catch (error) {
      toast.error('删除失败');
      console.error(error);
    }
  };

  const filteredMindmaps = mindmaps.filter((mindmap) =>
    mindmap.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
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

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Toaster position="top-center" />

      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>返回首页</span>
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-bold text-gray-900">我的文件</h1>
            </div>

            <Link
              href="/mindmap"
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
            >
              ➕ 新建思维导图
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="搜索思维导图..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600">
            共 <span className="font-semibold text-gray-900">{filteredMindmaps.length}</span> 个文件
          </p>
          <button
            onClick={loadMindMaps}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>
        </div>

        {/* 文件列表 */}
        {filteredMindmaps.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchQuery ? '没有找到匹配的文件' : '还没有思维导图'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery ? '尝试其他搜索词' : '创建你的第一个思维导图吧！'}
            </p>
            {!searchQuery && (
              <Link
                href="/mindmap"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
              >
                <span>➕</span>
                <span>新建思维导图</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMindmaps.map((mindmap) => (
              <div
                key={mindmap.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all overflow-hidden border-2 border-gray-100 group"
              >
                {/* 缩略图区域 */}
                <Link href={`/mindmap/${mindmap.id}`}>
                  <div className="aspect-video bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center cursor-pointer group-hover:from-blue-200 group-hover:to-purple-200 transition-all">
                    {mindmap.thumbnail ? (
                      <img
                        src={mindmap.thumbnail}
                        alt={mindmap.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">🧠</div>
                    )}
                  </div>
                </Link>

                {/* 文件信息 */}
                <div className="p-4">
                  <Link href={`/mindmap/${mindmap.id}`}>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer truncate">
                      {mindmap.name}
                    </h3>
                  </Link>
                  
                  {mindmap.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {mindmap.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <span>
                      更新于 {new Date(mindmap.updatedAt).toLocaleDateString('zh-CN')}
                    </span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Link
                      href={`/mindmap/${mindmap.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center font-medium"
                    >
                      打开
                    </Link>
                    <button
                      onClick={() => deleteMindMap(mindmap.id, mindmap.name)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      title="删除"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
