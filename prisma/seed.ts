import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@mindmap.com' },
    update: {},
    create: {
      id: 'admin-user',
      email: 'admin@mindmap.com',
      name: '管理员',
      password: 'hashed-password-not-used', // 不使用数据库密码验证
    },
  });

  console.log('✅ 管理员用户已创建:', adminUser);
}

main()
  .catch((e) => {
    console.error('❌ 种子数据创建失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
