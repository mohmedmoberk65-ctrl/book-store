import * as speakeasy from "speakeasy";
import prisma from "./prisma";

// Generate a 2FA secret for a user
export function generateSecret(username: string): { secret: string; otpauth: string } {
  const secret = speakeasy.generateSecret({
    name: `سنتر الأوائل:${username}`,
    issuer: "سنتر الأوائل",
  });
  return {
    secret: secret.base32,
    otpauth: secret.otpauth_url || "",
  };
}

// Verify a 2FA token
export function verifyToken(token: string, secret: string): boolean {
  if (!secret || !token) return false;
  try {
    return speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token: token.replace(/\s/g, ""),
      window: 1,
    });
  } catch {
    return false;
  }
}

// Generate a QR code data URL
export async function generateQRCode(otpauth: string): Promise<string> {
  // Return the otpauth URL directly - client can use it to generate QR
  return otpauth;
}

// Enable 2FA for an admin
export async function enable2FA(adminId: number, secret: string): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabled: true,
    },
  });
}

// Disable 2FA for an admin
export async function disable2FA(adminId: number): Promise<void> {
  await prisma.admin.update({
    where: { id: adminId },
    data: {
      twoFactorSecret: "",
      twoFactorEnabled: false,
    },
  });
}
