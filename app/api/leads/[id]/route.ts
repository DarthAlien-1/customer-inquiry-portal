import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // In Next.js 15+, we must 'await' the params before extracting the ID
    const { id } = await params;

    await prisma.lead.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Record successfully deleted' });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}