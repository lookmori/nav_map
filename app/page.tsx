'use client';

import Link from "next/link";
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

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

  if (!session) {
    return null;
  }

  const tools = [
    {
      id: 1,
      title: "思维导图",
      description: "创建和编辑思维导图，整理你的想法和知识结构",
      icon: "🧠",
      href: "/mindmap",
      color: "from-blue-500 to-cyan-500",
      features: ["无限画布", "多种节点样式", "导出图片", "云端保存"]
    },
    {
      id: 2,
      title: "流程图",
      description: "设计流程图，可视化你的业务流程和系统架构",
      icon: "📊",
      href: "/flowchart",
      color: "from-purple-500 to-pink-500",
      features: ["丰富图形库", "自动对齐", "多种连接线", "团队协作"]
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* 顶部导航栏 */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎨</div>
              <h1 className="text-2xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                可视化工具平台
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-600">
                  欢迎，<span className="font-semibold text-gray-900">{session.user?.name}</span>
                </div>
                <Link 
                  href="/files" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  我的文件
                </Link>
                <button 
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                >
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 欢迎区域 */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            让创意可视化
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            使用专业的思维导图和流程图工具，将你的想法转化为清晰的视觉表达
          </p>
        </div>

        {/* 工具卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.href}
              className="group relative bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
            >
              {/* 渐变背景 */}
              <div className={`absolute inset-0 bg-linear-to-br ${tool.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              
              <div className="relative p-8">
                {/* 图标和标题 */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-6xl">{tool.icon}</div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                  </div>
                </div>

                {/* 描述 */}
                <p className="text-gray-600 text-lg mb-6">
                  {tool.description}
                </p>

                {/* 特性列表 */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {tool.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* 按钮 */}
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-semibold bg-linear-to-r ${tool.color} bg-clip-text text-transparent`}>
                    立即开始 →
                  </span>
                  <div className="px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                    免费使用
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* 功能亮点 */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            为什么选择我们？
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">💾</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">云端存储</h4>
              <p className="text-gray-600">
                所有文件自动保存到云端，随时随地访问你的作品
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">⚡</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">快速响应</h4>
              <p className="text-gray-600">
                流畅的操作体验，让创作过程更加高效
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🔒</div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">安全可靠</h4>
              <p className="text-gray-600">
                数据加密存储，保护你的隐私和创意成果
              </p>
            </div>
          </div>
        </div>

        {/* 最近文件预览 */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">最近使用</h3>
            <Link href="/files" className="text-blue-600 hover:text-blue-700 font-medium">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center text-4xl">
                  {item % 2 === 0 ? "🧠" : "📊"}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">示例文件 {item}</h4>
                <p className="text-sm text-gray-500">2小时前编辑</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white/80 backdrop-blur-md mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>© 2024 可视化工具平台 - 让创意更清晰</p>
        </div>
      </footer>
    </div>
  );
}
