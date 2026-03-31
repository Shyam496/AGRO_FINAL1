import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        console.log('✅ Connection successful. User count:', userCount);
        const users = await prisma.user.findMany();
        console.log('Users:', users.map(u => u.email));
    } catch (error) {
        console.error('❌ Error connecting to database:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
