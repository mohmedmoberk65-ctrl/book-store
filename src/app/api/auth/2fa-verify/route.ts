import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/twofactor";
import prisma from "@/lib/prisma";

// POST: Verify 2FA token during login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, token } = body;

    if (!username || !token) {
      return NextResponse.json({ error: "البيانات غير كاملة" }, { status: 400 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username },
    });

    if (!admin || !admin.twoFactorEnabled || !admin.twoFactorSecret) {
      return NextResponse.json({ error: "2FA غير مفعل" }, { status: 400 });
    }

    const isValid = verifyToken(token, admin.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json({ error: "رمز التحقق غير صحيح" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "فشل التحقق" }, { status: 500 });
  }
}
