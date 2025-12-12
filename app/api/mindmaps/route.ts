import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取所有思维导图
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const mindmaps = await prisma.mindMap.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        name: true,
        description: true,
        thumbnail: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(mindmaps);
  } catch (error) {
    console.error('获取思维导图失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// 创建新思维导图
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, nodes, edges, userId } = body;

    if (!userId) {
      return NextResponse.json({ error: '缺少用户ID' }, { status: 400 });
    }

    const mindmap = await prisma.mindMap.create({
      data: {
        name: name || '未命名思维导图',
        description,
        nodes,
        edges,
        userId,
      },
    });

    return NextResponse.json(mindmap, { status: 201 });
  } catch (error) {
    console.error('创建思维导图失败:', error);
    return NextResponse.json({ error: '创建失败' }, { status: 500 });
  }
}
