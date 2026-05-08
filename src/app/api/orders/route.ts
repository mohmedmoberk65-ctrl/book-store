import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendTelegramNotification, formatOrderNotification } from "@/lib/telegram";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      const order = await prisma.order.findUnique({
        where: { id: parseInt(id) },
        include: { bookVersion: { include: { book: { include: { lecture: { include: { year: true } } } } } } },
      });
      return NextResponse.json(order || null);
    }

    const where: any = {};
    if (status) where.status = status;

    const orders = await prisma.order.findMany({
      where, orderBy: { createdAt: "desc" },
      include: { bookVersion: { include: { book: { include: { lecture: { include: { year: true } } } } } } },
    });
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const order = await prisma.order.create({
      data: {
        customerName: body.customerName,
        phone: body.phone,
        transferFrom: body.transferFrom || "",
        paymentMethod: body.paymentMethod,
        screenshot: body.screenshot || "",
        notes: body.notes || "",
        status: "pending",
        bookVersionId: body.bookVersionId,
      },
      include: { bookVersion: { include: { book: true } } },
    });

    // Send Telegram notification
    try {
      const message = formatOrderNotification({
        id: order.id,
        customerName: order.customerName,
        phone: order.phone,
        transferFrom: order.transferFrom,
        paymentMethod: order.paymentMethod,
        bookVersionName: order.bookVersion.name,
        bookName: order.bookVersion.book.name,
        price: order.bookVersion.price,
        notes: order.notes,
        createdAt: order.createdAt,
      });
      await sendTelegramNotification(message, order.screenshot || undefined);
    } catch (telegramError) {
      console.error("Telegram notification error:", telegramError);
    }

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Order creation error:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const order = await prisma.order.update({
      where: { id: body.id },
      data: { status: body.status, notes: body.notes },
    });
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required" }, { status: 400 });

    await prisma.order.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete order" }, { status: 500 });
  }
}
