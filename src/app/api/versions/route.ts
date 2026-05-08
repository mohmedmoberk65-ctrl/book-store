import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const bookId = searchParams.get("bookId");
    const all = searchParams.get("all");

    if (id) {
      const version = await prisma.bookVersion.findUnique({ where: { id: parseInt(id) } });
      return NextResponse.json(version || null);
    }

    const where: any = {};
    if (!all) where.active = true;
    if (bookId) where.bookId = parseInt(bookId);

    const versions = await prisma.bookVersion.findMany({
      where, orderBy: { sortOrder: "asc" },
      include: { book: { select: { name: true, lecture: { select: { name: true, year: { select: { name: true } } } } } } },
    });
    return NextResponse.json(versions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const version = await prisma.bookVersion.create({
      data: { name: body.name, image: body.image || "", price: parseFloat(body.price), bookId: body.bookId, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(version, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const version = await prisma.bookVersion.update({
      where: { id: body.id },
      data: { name: body.name, image: body.image, price: body.price ? parseFloat(body.price) : undefined, bookId: body.bookId, sortOrder: body.sortOrder, active: body.active },
    });
    return NextResponse.json(version);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update version" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.bookVersion.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete version" }, { status: 500 });
  }
}
