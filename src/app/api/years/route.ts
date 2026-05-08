import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const year = await prisma.year.findUnique({
        where: { id: parseInt(id) },
      });
      return NextResponse.json(year || null);
    }

    const years = await prisma.year.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json(years);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch years" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const year = await prisma.year.create({
      data: { name: body.name, sortOrder: body.sortOrder || 0 },
    });
    return NextResponse.json(year, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create year" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const year = await prisma.year.update({
      where: { id: body.id },
      data: { name: body.name, sortOrder: body.sortOrder, active: body.active },
    });
    return NextResponse.json(year);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update year" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.year.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete year" }, { status: 500 });
  }
}
