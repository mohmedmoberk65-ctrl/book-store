import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const lectureId = searchParams.get("lectureId");
    const all = searchParams.get("all");

    if (id) {
      const book = await prisma.book.findUnique({
        where: { id: parseInt(id) },
        include: { versions: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
      });
      return NextResponse.json(book || null);
    }

    const where: any = {};
    if (!all) where.active = true;
    if (lectureId) where.lectureId = parseInt(lectureId);

    const books = await prisma.book.findMany({
      where, orderBy: { sortOrder: "asc" },
      include: { versions: { where: { active: true }, orderBy: { sortOrder: "asc" } } },
    });
    return NextResponse.json(books);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const book = await prisma.book.create({
      data: { name: body.name, description: body.description || "", image: body.image || "", lectureId: body.lectureId, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(book, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create book" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const book = await prisma.book.update({
      where: { id: body.id },
      data: { name: body.name, description: body.description, image: body.image, lectureId: body.lectureId, sortOrder: body.sortOrder, active: body.active },
    });
    return NextResponse.json(book);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update book" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.book.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete book" }, { status: 500 });
  }
}
