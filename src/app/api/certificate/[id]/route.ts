import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return new NextResponse(JSON.stringify({ message: 'Certificate ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const certificate = await prisma.certificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            walletAddress: true,
          },
        },
        evidence: {
          select: {
            field: true,
          },
        },
      },
    });

    if (!certificate) {
      return new NextResponse(JSON.stringify({ message: 'Certificate not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const responseData = {
      ...certificate,
      field: certificate.evidence.field,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching certificate:', error);
    return new NextResponse(
      JSON.stringify({ message: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      },
    );
  }
} 