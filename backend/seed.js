import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('password123', 10);

    const user = await prisma.user.upsert({
        where: { email: 'farmer@agromind.com' },
        update: {},
        create: {
            email: 'farmer@agromind.com',
            password: hashedPassword,
            firstName: 'Rajesh',
            lastName: 'Kumar',
            role: 'farmer'
        }
    });

    console.log('✅ User seeded:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
