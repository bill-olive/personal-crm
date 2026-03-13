import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const contact = await prisma.contact.create({
    data: {
      name: body.name.trim(),
      email: body.email || null,
      phone: body.phone || null,
      company: body.company || null,
      notes: body.notes || null,
    },
  });

  return NextResponse.json(contact, { status: 201 });
}
