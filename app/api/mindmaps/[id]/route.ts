import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取单个思维导图
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const mindmap = await prisma.mindMap.findUnique({
      where: { id },
    });

    if (!mindmap) {
      return NextResponse.json({ error: '思维导图不存在' }, { status: 404 });
    }

    return NextResponse.json(mindmap);
  } catch (error) {
    console.error('获取思维导图失败:', error);
    return NextResponse.json({ error: '获取失败' }, { status: 500 });
  }
}

// 更新思维导图
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, nodes, edges } = body;

    const mindmap = await prisma.mindMap.update({
      where: { id },
      data: {
        name,
        description,
        nodes,
        edges,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(mindmap);
  } catch (error) {
    console.error('更新思维导图失败:', error);
    return NextResponse.json({ error: '更新失败' }, { status: 500 });
  }
}

// 删除思维导图
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.mindMap.delete({
      where: { id },
    });

    return NextResponse.json({ message: '删除成功' });
  } catch (error) {
    console.error('删除思维导图失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }
}
