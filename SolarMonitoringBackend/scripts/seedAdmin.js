const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  const username = process.env.ADMIN_USERNAME || 'admin';
  const plainPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  console.log(`Mempersiapkan user '${username}'...`);
  
  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  
  // Upsert user (Update jika ada, Insert jika belum ada)
  const user = await prisma.users.upsert({
    where: { username: username },
    update: {
      password_hash: hashedPassword,
      full_name: 'Administrator'
    },
    create: {
      username: username,
      password_hash: hashedPassword,
      full_name: 'Administrator',
      is_active: true
    }
  });
  
  console.log('✅ Berhasil menyiapkan user admin!');
  console.log('Username:', user.username);
  console.log('Password (terenkripsi):', user.password_hash);
  
  await prisma.$disconnect();
}

seed().catch(e => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
