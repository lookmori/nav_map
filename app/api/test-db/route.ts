import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // 测试数据库连接
    await prisma.$connect();
    
    // 获取数据库中的表数量
    const mindmapCount = await prisma.mindMap.count();
    
    return NextResponse.json({
      status: 'success',
      message: '数据库连接成功！',
      data: {
        mindmapCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('数据库连接失败:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '数据库连接失败',
        error: error instanceof Error ? error.message : '未知错误',
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
