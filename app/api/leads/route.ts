import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET Request: Fetches all entries for the Admin Dashboard
export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch database records' }, { status: 500 });
  }
}

// 2. POST Request: Saves a new customer submission from the public form
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, serviceRequested, message } = body;

    const newLead = await prisma.lead.create({
      data: {
        firstName,
        lastName,
        email,
        serviceRequested,
        message,
        status: 'New', // Standard baseline default status
      },
    });

    return NextResponse.json(newLead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save customer inquiry' }, { status: 500 });
  }
}

// 3. DELETE Request: Removes a specific row from the database
export async function DELETE(request: Request) {
  try {
    // Parse the ID sent by the frontend button click
    const body = await request.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required to delete a record' }, { status: 400 });
    }

    // Tell Prisma to delete that specific record from Supabase
    await prisma.lead.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: 'Successfully deleted the record' }, { status: 200 });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
  }
}