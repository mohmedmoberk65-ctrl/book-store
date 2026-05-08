"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Settings as SettingsIcon, ShieldCheck, QrCode, Smartphone, Copy, Check, Loader } from "lucide-react";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [loading, setLoading] = useState(true);

  // 2FA state
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otpToken, setOtpToken] = useState("");
  const [showQR, setShowQR] = useState(false);
  const [enabling2FA, setEnabling2FA] = useState(false);
  const [disabling2FA, setDisabling2FA] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then(r => r.json()),
      fetch("/api/auth/2fa-setup").then(r => r.json()),
    ]).then(([settingsData, faData]) => {
      setTelegramToken(settingsData.telegram_token || "");
      setTelegramChatId(settingsData.telegram_chat_id || "");
      setIs2FAEnabled(faData.isEnabled || false);
      if (faData.qrCode) {
        // If it's an otpauth URL, use Google Charts to render QR
        const qrSrc = faData.qrCode.startsWith("otpauth://")
          ? `https://chart.googleapis.com/chart?chs=300x300&chld=M|0&cht=qr&chl=${encodeURIComponent(faData.qrCode)}`
          : faData.qrCode;
        setQrCode(qrSrc);
        setSecret(faData.secret);
      }

      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSaveTelegram = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ telegram_token: telegramToken, telegram_chat_id: telegramChatId }),
      });
      toast.success("تم حفظ الإعدادات");
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleEnable2FA = async () => {
    if (!showQR) {
      // Generate QR code
      const res = await fetch("/api/auth/2fa-setup");
      const data = await res.json();
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShowQR(true);
      return;
    }

    if (!otpToken || otpToken.length !== 6) {
      toast.error("الرجاء إدخال رمز التحقق");
      return;
    }

    setEnabling2FA(true);
    try {
      const res = await fetch("/api/auth/2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", secret, token: otpToken }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIs2FAEnabled(true);
        setShowQR(false);
        setOtpToken("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setEnabling2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!showDisableConfirm) {
      setShowDisableConfirm(true);
      return;
    }

    if (!disablePassword) {
      toast.error("الرجاء إدخال كلمة المرور");
      return;
    }

    setDisabling2FA(true);
    try {
      const res = await fetch("/api/auth/2fa-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable", password: disablePassword }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        setIs2FAEnabled(false);
        setShowDisableConfirm(false);
        setDisablePassword("");
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setDisabling2FA(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("تم النسخ");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">الإعدادات</h1>
        <p className="text-text-muted">إعدادات التطبيق والأمان</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Telegram Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <SettingsIcon className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold">إعدادات تلغرام</h2>
          </div>

          <form onSubmit={handleSaveTelegram} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-text-muted">توكن بوت تلغرام</label>
              <input type="text" value={telegramToken} onChange={e => setTelegramToken(e.target.value)}
                className="input-modern" placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-text-muted">معرف المحادثة (Chat ID)</label>
              <input type="text" value={telegramChatId} onChange={e => setTelegramChatId(e.target.value)}
                className="input-modern" placeholder="-1001234567890" />
            </div>
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4">
              <p className="text-sm text-text-muted">
                💡 سيصلك إشعار بكل طلب جديد مع تفاصيل العميل والكتاب
              </p>
            </div>
            <motion.button type="submit" whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-accent text-white font-bold">
              <Save className="w-5 h-5" /> حفظ الإعدادات
            </motion.button>
          </form>
        </motion.div>

        {/* 2FA Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-6 h-6 text-gold" />
            <h2 className="text-xl font-bold">التحقق بخطوتين (2FA)</h2>
          </div>

          <div className="space-y-6">
            {/* Status */}
            <div className={`p-4 rounded-xl ${is2FAEnabled ? "bg-success/10 border border-success/20" : "bg-gold/5 border border-gold/20"}`}>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${is2FAEnabled ? "bg-success" : "bg-gold"} pulse-glow`} />
                <span className="font-medium">
                  {is2FAEnabled ? "✓ التحقق بخطوتين مفعل" : "التحقق بخطوتين غير مفعل"}
                </span>
              </div>
              <p className="text-text-muted text-sm mt-2">
                {is2FAEnabled
                  ? "حسابك محمي برمز تحقق إضافي من تطبيق Google Authenticator"
                  : "فعّل التحقق بخطوتين لزيادة أمان حسابك"}
              </p>
            </div>

            {!is2FAEnabled && !showQR && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                onClick={handleEnable2FA}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-l from-gold to-accent text-white font-bold flex items-center justify-center gap-3"
              >
                <ShieldCheck className="w-5 h-5" />
                تفعيل التحقق بخطوتين
              </motion.button>
            )}

            {/* QR Code Setup */}
            {showQR && !is2FAEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div className="flex justify-center">
                  {qrCode && (
                    <div className="p-4 bg-white rounded-2xl">
                      <img src={qrCode} alt="QR Code" className="w-48 h-48 md:w-56 md:h-56" />
                    </div>
                  )}
                </div>

                <p className="text-text-muted text-sm text-center">
                  1. افتح تطبيق Google Authenticator
                  <br />2. امسح رمز QR هذا
                  <br />3. أدخل الرمز المكون من 6 أرقام أدناه
                </p>

                {/* Manual secret */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-black/20">
                  <code className="flex-1 text-sm font-mono text-accent" dir="ltr">{secret}</code>
                  <button onClick={() => copyToClipboard(secret)}
                    className="p-2 rounded-lg hover:bg-accent/10 text-accent">
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-center">
                  <div className="flex gap-3" dir="ltr">
                    {[0, 1, 2, 3, 4, 5].map((i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        inputMode="numeric"
                        value={otpToken[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newToken = otpToken.split("");
                          newToken[i] = val;
                          setOtpToken(newToken.join(""));
                          if (val && i < 5) {
                            const next = document.getElementById(`2fa-${i + 1}`);
                            next?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otpToken[i] && i > 0) {
                            const prev = document.getElementById(`2fa-${i - 1}`);
                            prev?.focus();
                          }
                        }}
                        id={`2fa-${i}`}
                        className="w-12 h-14 text-center text-2xl font-bold rounded-xl bg-input-bg border border-input-border focus:border-accent outline-none transition-all"
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={handleEnable2FA}
                    disabled={enabling2FA || otpToken.length !== 6}
                    className="flex-1 py-3 rounded-xl bg-accent text-white font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {enabling2FA ? <Loader className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                    تفعيل
                  </motion.button>
                  <button onClick={() => setShowQR(false)}
                    className="px-6 py-3 rounded-xl bg-white/5 text-text-muted">
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}

            {/* Disable 2FA */}
            {is2FAEnabled && !showDisableConfirm && (
              <button
                onClick={handleDisable2FA}
                className="w-full py-3 px-6 rounded-xl bg-danger/10 text-danger font-bold hover:bg-danger/20 transition-colors"
              >
                إلغاء التحقق بخطوتين
              </button>
            )}

            {showDisableConfirm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 p-4 rounded-xl bg-danger/5 border border-danger/20"
              >
                <p className="text-sm text-text-muted">أدخل كلمة المرور لتأكيد إلغاء التحقق بخطوتين:</p>
                <input
                  type="password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  className="input-modern"
                  placeholder="كلمة المرور"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleDisable2FA}
                    disabled={disabling2FA || !disablePassword}
                    className="flex-1 py-3 rounded-xl bg-danger text-white font-bold disabled:opacity-50"
                  >
                    {disabling2FA ? "جاري..." : "تأكيد الإلغاء"}
                  </button>
                  <button onClick={() => { setShowDisableConfirm(false); setDisablePassword(""); }}
                    className="px-6 py-3 rounded-xl bg-white/5 text-text-muted">
                    إلغاء
                  </button>
                </div>
              </motion.div>
            )}

            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4">
              <p className="text-sm text-text-muted">
                🔒 التحقق بخطوتين يضيف طبقة أمان إضافية لحسابك. بعد التفعيل، ستحتاج إلى إدخال رمز من تطبيق Google Authenticator عند تسجيل الدخول.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
