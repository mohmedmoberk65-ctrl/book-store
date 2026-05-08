import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { generateSecret, generateQRCode, enable2FA, disable2FA, verifyToken } from "@/lib/twofactor";
import prisma from "@/lib/prisma";

// GET: Generate 2FA setup (QR code + secret)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const admin = await prisma.admin.findUnique({
      where: { username: session.user.name },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Generate new secret
    const { secret, otpauth } = generateSecret(admin.username);
    const qrCode = await generateQRCode(otpauth);

    return NextResponse.json({
      secret,
      qrCode,
      isEnabled: admin.twoFactorEnabled,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to setup 2FA" }, { status: 500 });
  }
}

// POST: Enable or verify 2FA
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.name) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, secret, token } = body;

    const admin = await prisma.admin.findUnique({
      where: { username: session.user.name },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (action === "enable") {
      // Verify token before enabling
      if (!token || !verifyToken(token, secret)) {
        return NextResponse.json({ error: "رمز التحقق غير صحيح" }, { status: 400 });
      }
      await enable2FA(admin.id, secret);
      return NextResponse.json({ success: true, message: "تم تفعيل التحقق بخطوتين" });
    }

    if (action === "disable") {
      // Verify current password
      const bcrypt = await import("bcryptjs");
      if (!body.password) {
        return NextResponse.json({ error: "كلمة المرور مطلوبة" }, { status: 400 });
      }
      const isValid = await bcrypt.compare(body.password, admin.password);
      if (!isValid) {
        return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 400 });
      }
      await disable2FA(admin.id);
      return NextResponse.json({ success: true, message: "تم إلغاء التحقق بخطوتين" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update 2FA" }, { status: 500 });
  }
}
