import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { RoleId } from '../src/user/roles.enum';

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { id: RoleId.ADMIN, name: 'ADMIN',  description: 'Permissão para administrar artigos e usuários.' },
    { id: RoleId.EDITOR, name: 'EDITOR', description: 'Permissão para administrar artigos.' },
    { id: RoleId.READER, name: 'READER', description: 'Permissão para apenas ler artigos.' },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: { name: r.name as any, description: r.description },
      create: { id: r.id, name: r.name as any, description: r.description },
    });
  }

  console.log('Roles criadas/atualizadas.');

  const rootEmail = 'root@root.root';
  const rootPassword = 'admin123';
  const hashedPassword = await bcrypt.hash(rootPassword, 12);

  const rootRole = await prisma.role.findUnique({ where: { id: RoleId.ADMIN } });
  if (!rootRole) throw new Error('Role ADMIN não encontrada durante seed');

  const rootUser = await prisma.user.upsert({
    where: { email: rootEmail },
    update: {},
    create: {
      email: rootEmail,
      password: hashedPassword,
      name: 'Root User',
      roleId: rootRole.id,
    },
  });

  console.log('Usuário root criado:', rootUser.email);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });