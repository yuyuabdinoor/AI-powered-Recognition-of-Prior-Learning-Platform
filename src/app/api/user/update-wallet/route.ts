import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId, walletAddress } = await request.json();

    if (!userId || !walletAddress) {
      return NextResponse.json(
        { message: 'User ID and wallet address are required' },
        { status: 400 },
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating wallet address:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 },
    );
  }
} 