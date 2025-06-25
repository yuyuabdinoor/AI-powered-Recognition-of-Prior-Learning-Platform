import { NextResponse } from 'next/server';
import { db } from '~/server/db';
import bcrypt from 'bcrypt';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        emailVerified: new Date(), // Automatically verify email for now
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
} 