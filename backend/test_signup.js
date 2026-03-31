import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testSignup() {
    try {
        const email = 'test_user_' + Date.now() + '@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName: 'Test',
                lastName: 'User'
            }
        });
        console.log('✅ Signup successful. Created user:', user.email);
    } catch (error) {
        console.error('❌ Signup failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

testSignup();
