const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

export async function sendTelegramNotification(
  message: string,
  photoPath?: string
): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("Telegram not configured");
    return false;
  }

  try {
    const baseUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

    if (photoPath) {
      // Send photo with caption
      const formData = new FormData();
      formData.append("chat_id", TELEGRAM_CHAT_ID);
      formData.append("caption", message);
      formData.append("parse_mode", "HTML");

      // Read the file and send as multipart
      const fs = await import("fs");
      const fileBuffer = fs.readFileSync(photoPath);
      const blob = new Blob([fileBuffer]);
      formData.append("photo", blob, "screenshot.jpg");

      const response = await fetch(`${baseUrl}/sendPhoto`, {
        method: "POST",
        body: formData,
      });
      return response.ok;
    } else {
      const response = await fetch(`${baseUrl}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "HTML",
        }),
      });
      return response.ok;
    }
  } catch (error) {
    console.error("Telegram notification failed:", error);
    return false;
  }
}

export function formatOrderNotification(order: {
  id: number;
  customerName: string;
  phone: string;
  transferFrom: string;
  paymentMethod: string;
  bookVersionName: string;
  bookName: string;
  price: number;
  notes: string;
  createdAt: Date;
}): string {
  const paymentLabels: Record<string, string> = {
    instapay: "InstaPay",
    orange_cash: "Orange Cash",
    vodafone_cash: "Vodafone Cash",
    etisalat_cash: "Etisalat Cash",
  };

  return `
<b>🆕 طلب جديد #${order.id}</b>

<b>📚 الكتاب:</b> ${order.bookName}
<b>📖 النسخة:</b> ${order.bookVersionName}
<b>💰 السعر:</b> ${order.price} ج.م

<b>👤 اسم العميل:</b> ${order.customerName}
<b>📞 الهاتف:</b> ${order.phone}
<b>📱 رقم التحويل من:</b> ${order.transferFrom}
<b>💳 طريقة الدفع:</b> ${paymentLabels[order.paymentMethod] || order.paymentMethod}

${order.notes ? `<b>📝 ملاحظات:</b> ${order.notes}` : ""}
<b>🕐 التاريخ:</b> ${new Date(order.createdAt).toLocaleString("ar-EG")}
  `.trim();
}
