import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const yearId = searchParams.get("yearId");

    if (id) {
      const lecture = await prisma.lecture.findUnique({ where: { id: parseInt(id) } });
      return NextResponse.json(lecture || null);
    }

    const where: any = { active: true };
    if (yearId) where.yearId = parseInt(yearId);

    const lectures = await prisma.lecture.findMany({ where, orderBy: { sortOrder: "asc" } });
    return NextResponse.json(lectures);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch lectures" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const lecture = await prisma.lecture.create({
      data: { name: body.name, yearId: body.yearId, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(lecture, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lecture" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const lecture = await prisma.lecture.update({
      where: { id: body.id },
      data: { name: body.name, yearId: body.yearId, sortOrder: body.sortOrder, active: body.active },
    });
    return NextResponse.json(lecture);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lecture" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.lecture.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lecture" }, { status: 500 });
  }
}
