"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, User, LogIn, Eye, EyeOff, ShieldCheck, Smartphone, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast.error("اسم المستخدم أو كلمة المرور غير صحيحة");
        setLoading(false);
        return;
      }

      // Check if 2FA is enabled
      const admin = await fetch("/api/auth/2fa-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token: "check" }),
      });

      if (admin.status === 400 && (await admin.json()).error === "2FA غير مفعل") {
        // No 2FA - login directly
        router.push("/admin/dashboard");
        return;
      }

      // 2FA is enabled - go to OTP step
      setRequires2FA(true);
      setStep("otp");
      toast.success("تم التحقق من كلمة المرور، أدخل رمز التحقق");
    } catch {
      toast.error("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 6) {
      toast.error("الرجاء إدخال رمز التحقق كاملاً");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token: otpCode }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "رمز التحقق غير صحيح");
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
        return;
      }

      // Complete sign in
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.ok) {
        toast.success("تم تسجيل الدخول بنجاح");
        router.push("/admin/dashboard");
      }
    } catch {
      toast.error("حدث خطأ");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 animated-gradient">
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 md:p-10">
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.div
                key="credentials"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* Logo */}
                <motion.div
                  className="text-center mb-8"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                >
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-1">تسجيل الدخول</h1>
                  <p className="text-text-muted text-sm">لوحة التحكم - سنتر الأوائل</p>
                </motion.div>

                <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">اسم المستخدم</label>
                    <div className="relative">
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="input-modern pr-12"
                        placeholder="أدخل اسم المستخدم"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">كلمة المرور</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-modern pr-12 pl-12"
                        placeholder="أدخل كلمة المرور"
                        required
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-l from-accent to-accent-light text-white hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {loading ? (
                      <div className="loading-spinner !w-6 !h-6" />
                    ) : (
                      <><LogIn className="w-5 h-5" /> تسجيل الدخول</>
                    )}
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
              >
                {/* 2FA Header */}
                <div className="text-center mb-8">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold to-accent flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold mb-1">التحقق بخطوتين</h1>
                  <p className="text-text-muted text-sm">أدخل رمز التحقق من تطبيق المصادقة</p>
                </div>

                <form onSubmit={handleOtpSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-4 text-center text-text-muted">
                      رمز التحقق المكون من 6 أرقام
                    </label>
                    <div className="flex items-center justify-center gap-3" dir="ltr" onPaste={handlePaste}>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          id={`otp-${index}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(index, e)}
                          className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold rounded-xl bg-input-bg border border-input-border focus:border-accent focus:shadow-lg focus:shadow-accent/20 outline-none transition-all duration-200"
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading || otp.join("").length !== 6}
                    className="w-full py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-l from-gold to-accent text-white hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {loading ? (
                      <div className="loading-spinner !w-6 !h-6" />
                    ) : (
                      <><ShieldCheck className="w-5 h-5" /> تحقق</>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => setStep("credentials")}
                    className="w-full flex items-center justify-center gap-2 text-text-muted hover:text-text transition-colors text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    العودة لتسجيل الدخول
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
