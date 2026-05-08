"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  BookOpen,
  ArrowRight,
  Image as ImageIcon,
  Check,
  Upload,
  CreditCard,
  Smartphone,
  Building,
  Send,
  Loader,
  CheckCircle2,
  ShoppingCart,
  Minus,
  Plus,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import { useImageLightbox } from "@/components/ImageLightbox";

interface BookVersion {

  id: number;
  name: string;
  image: string;
  price: number;
  sortOrder: number;
}

interface Book {
  id: number;
  name: string;
  description: string;
  image: string;
  versions: BookVersion[];
}

interface PaymentAccount {
  id: number;
  name: string;
  type: string;
  accountName: string;
  number: string;
  description: string;
}

interface CartItem {
  version: BookVersion;
  quantity: number;
}

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.bookId as string;
  const [book, setBook] = useState<Book | null>(null);
  const { openLightbox, ImageLightboxComponent } = useImageLightbox();

  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [transferFrom, setTransferFrom] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookRes, accountsRes] = await Promise.all([
          fetch(`/api/books?id=${bookId}`),
          fetch("/api/payment-accounts"),
        ]);
        const bookData = await bookRes.json();
        const accountsData = await accountsRes.json();
        setBook(Array.isArray(bookData) ? bookData[0] : bookData);
        setPaymentAccounts(Array.isArray(accountsData) ? accountsData : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [bookId]);

  const toggleVersion = (version: BookVersion) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.version.id === version.id);
      if (exists) {
        return prev.filter((item) => item.version.id !== version.id);
      }
      return [...prev, { version, quantity: 1 }];
    });
  };

  const updateQuantity = (versionId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.version.id === versionId
            ? { ...item, quantity: Math.max(1, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (versionId: number) => {
    setCart((prev) => prev.filter((item) => item.version.id !== versionId));
  };

  const totalPrice = cart.reduce(
    (sum, item) => sum + item.version.price * item.quantity,
    0
  );

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setScreenshot(file);
      const reader = new FileReader();
      reader.onload = () => setScreenshotPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("الرجاء اختيار نسخة واحدة على الأقل");
      return;
    }
    if (!customerName || !phone || !paymentMethod) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    setSubmitting(true);
    try {
      let screenshotPath = "";

      if (screenshot) {
        const formData = new FormData();
        formData.append("file", screenshot);
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const uploadData = await uploadRes.json();
        screenshotPath = uploadData.path || "";
      }

      // Create an order for each cart item
      for (const item of cart) {
        for (let i = 0; i < item.quantity; i++) {
          const orderRes = await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName,
              phone,
              transferFrom,
              paymentMethod,
              bookVersionId: item.version.id,
              notes: `${notes}${cart.length > 1 ? ` (طلب متعدد - ${item.version.name})` : ""}`,
              screenshot: screenshotPath,
            }),
          });

          if (!orderRes.ok) throw new Error("فشل إرسال الطلب");
        }
      }

      setSubmitted(true);
      setShowCheckout(false);
      toast.success("تم إرسال طلبك بنجاح! سنتواصل معك قريباً");
    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال الطلب. الرجاء المحاولة مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { value: "instapay", label: "InstaPay" },
    { value: "orange_cash", label: "Orange Cash" },
    { value: "vodafone_cash", label: "Vodafone Cash" },
    { value: "etisalat_cash", label: "Etisalat Cash" },
  ];

  const resetForm = () => {
    setCustomerName("");
    setPhone("");
    setTransferFrom("");
    setPaymentMethod("");
    setNotes("");
    setScreenshot(null);
    setScreenshotPreview("");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-4 text-center">
          <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <p className="text-text-muted text-lg">الكتاب غير موجود</p>
          <Link href="/" className="inline-flex items-center gap-2 text-accent mt-4 hover:underline">
            <ArrowRight className="w-4 h-4" /> العودة للرئيسية
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {ImageLightboxComponent}
      <div className="relative py-8 px-4">

        <div className="max-w-6xl mx-auto">
          {/* Back button */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-8">
            <Link
              href={`/books/${params.bookId}`}
              className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors glass px-4 py-2 rounded-full"
            >
              <ArrowRight className="w-4 h-4" /> <span>العودة للكتب</span>
            </Link>
          </motion.div>

          {/* Book Info */}
          <motion.div className="glass rounded-2xl p-8 mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div
                className="w-full md:w-64 aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-card to-card-hover flex-shrink-0 cursor-pointer group relative"
                onClick={() => book.image && openLightbox(book.image, book.name)}
              >
                {book.image ? (
                  <>
                    <img src={book.image} alt={book.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                      <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm bg-black/50 px-3 py-1 rounded-full">تكبير</span>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-16 h-16 text-text-muted/30" />
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{book.name}</h1>
                {book.description && <p className="text-text-muted text-lg mb-6">{book.description}</p>}
                <div className="flex items-center gap-2 text-sm text-text-muted">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>{book.versions?.length || 0} نسخة متاحة</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Versions Section - Multi-select */}
          <motion.div className="mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <h2 className="text-2xl font-bold mb-6">
              اختر <span className="text-accent">النسخ</span> التي تريدها
            </h2>
            <p className="text-text-muted mb-6">يمكنك اختيار أكثر من نسخة - سيتم إضافة كل ما تختاره إلى سلة الطلب</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {book.versions?.map((version, i) => {
                const isSelected = cart.some((item) => item.version.id === version.id);
                const cartItem = cart.find((item) => item.version.id === version.id);
                return (
                  <motion.div
                    key={version.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                  >
                    <div
                      onClick={() => toggleVersion(version)}
                      className={`group relative glass rounded-2xl overflow-hidden card-hover cursor-pointer transition-all duration-300 ${
                        isSelected ? "ring-2 ring-accent shadow-lg shadow-accent/20" : ""
                      }`}
                    >
                      {/* Selection indicator */}
                      <div
                        className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isSelected ? "bg-accent scale-100" : "bg-white/10 scale-75"
                        }`}
                      >
                        {isSelected ? (
                          <Check className="w-5 h-5 text-white" />
                        ) : (
                          <Plus className="w-4 h-4 text-text-muted" />
                        )}
                      </div>

                      <div className="aspect-[4/3] bg-gradient-to-br from-card to-card-hover overflow-hidden">
                        {version.image ? (
                          <img src={version.image} alt={version.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="w-12 h-12 text-text-muted/30" />
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2">{version.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-bold text-gold">
                            {version.price} <span className="text-sm">ج.م</span>
                          </span>
                          {isSelected && cartItem && cartItem.quantity > 0 && (
                            <span className="text-accent text-sm font-bold">العدد: {cartItem.quantity}</span>
                          )}
                        </div>

                        {/* Quantity controls for selected items */}
                        {isSelected && (
                          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/10" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => updateQuantity(version.id, -1)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-accent/20 flex items-center justify-center transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="font-bold text-lg min-w-[30px] text-center">
                              {cartItem?.quantity || 0}
                            </span>
                            <button
                              onClick={() => updateQuantity(version.id, 1)}
                              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-accent/20 flex items-center justify-center transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeFromCart(version.id)}
                              className="mr-auto p-1 rounded-lg hover:bg-danger/10 text-danger/50 hover:text-danger transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Floating Cart Bar */}
          <AnimatePresence>
            {cart.length > 0 && !submitted && (
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-6 right-6 z-50 max-w-4xl mx-auto"
                style={{ left: "50%", transform: "translateX(-50%)" }}
              >
                <div className="glass rounded-2xl p-4 shadow-2xl shadow-accent/10 border border-accent/20">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-sm text-text-muted">
                          {cart.length} {cart.length === 1 ? "نسخة" : "نسخ"} مختارة
                        </p>
                        <p className="text-xl font-bold text-gold">{totalPrice.toFixed(2)} ج.م</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setCart([])}
                        className="px-4 py-2 rounded-xl bg-white/5 text-text-muted hover:bg-white/10 transition-colors text-sm"
                      >
                        تفريغ
                      </button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowCheckout(true);
                          setSubmitted(false);
                        }}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-l from-accent to-accent-light text-white font-bold"
                      >
                        <Send className="w-5 h-5" />
                        إتمام الطلب
                      </motion.button>
                    </div>
                  </div>

                  {/* Cart items preview */}
                  <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                    {cart.map((item) => (
                      <span key={item.version.id} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/5 text-sm">
                        {item.version.name}
                        <span className="text-gold font-bold">x{item.quantity}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success Message */}
          <AnimatePresence>
            {submitted && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-12 mb-12 text-center max-w-lg mx-auto"
              >
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.2 }}>
                  <CheckCircle2 className="w-20 h-20 text-success mx-auto mb-6" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-4">تم استلام طلبك! 🎉</h2>
                <p className="text-text-muted text-lg mb-8">
                  سنقوم بالتواصل معك قريباً على الرقم {phone} لتأكيد الطلب
                </p>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 py-3 px-8 rounded-xl bg-accent text-white font-bold hover:bg-accent-light transition-colors"
                >
                  <ArrowRight className="w-5 h-5" /> العودة للصفحة الرئيسية
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Checkout Dialog/Modal */}
      <AnimatePresence>
        {showCheckout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowCheckout(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass rounded-3xl p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto my-8 dialog-mobile"

              onClick={(e) => e.stopPropagation()}
            >
              {/* Dialog Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">إتمام الطلب</h2>
                <button onClick={() => setShowCheckout(false)} className="p-2 rounded-xl hover:bg-white/5 text-text-muted hover:text-text transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Order Summary */}
              <div className="bg-gradient-to-br from-accent/5 to-gold/5 rounded-xl p-5 mb-6 border border-accent/10">
                <h3 className="font-bold mb-3 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-accent" /> ملخص الطلب
                </h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.version.id} className="flex items-center justify-between text-sm">
                      <span>
                        {item.version.name} <span className="text-gold">x{item.quantity}</span>
                      </span>
                      <span className="text-gold font-bold">
                        {(item.version.price * item.quantity).toFixed(2)} ج.م
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-white/10 pt-2 flex items-center justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-gold">{totalPrice.toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>

              {/* Payment Accounts Info */}
              {paymentAccounts.length > 0 && (
                <div className="mb-6 p-5 bg-gradient-to-br from-accent/10 to-gold/5 rounded-xl border border-accent/20">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-accent" /> حسابات الدفع المتاحة
                  </h3>
                  <div className="space-y-3">
                    {paymentAccounts.map((account) => (
                      <div key={account.id} className="flex items-center justify-between p-3 rounded-lg bg-black/20">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {account.type === "instapay" ? (
                              <Smartphone className="w-4 h-4 text-accent" />
                            ) : (
                              <Building className="w-4 h-4 text-gold" />
                            )}
                            <span className="font-medium">{account.name}</span>
                            {account.accountName && (
                              <span className="text-text-muted text-sm">({account.accountName})</span>
                            )}
                          </div>
                          <span className="text-accent font-bold text-lg" dir="ltr">
                            {account.number}
                          </span>
                          {account.description && (
                            <p className="text-text-muted text-sm mt-1">{account.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">الاسم بالكامل *</label>
                    <input type="text" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="input-modern" placeholder="أدخل اسمك الكامل" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">رقم الهاتف *</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-modern" placeholder="أدخل رقم هاتفك" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">رقم التحويل من</label>
                    <input type="tel" value={transferFrom} onChange={(e) => setTransferFrom(e.target.value)} className="input-modern" placeholder="رقم المحفظة أو الحساب المحول منه" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-text-muted">طريقة الدفع *</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} className="select-modern" required>
                      <option value="">اختر طريقة الدفع</option>
                      {paymentMethods.map((pm) => (
                        <option key={pm.value} value={pm.value}>{pm.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-text-muted">إرفاق صورة الإيصال (اختياري)</label>
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" id="screenshot-upload" />
                    <label htmlFor="screenshot-upload" className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-input-border hover:border-accent/50 transition-colors cursor-pointer">
                      <Upload className="w-6 h-6 text-text-muted" />
                      <span className="text-text-muted">{screenshot ? screenshot.name : "اختر صورة الإيصال"}</span>
                    </label>
                    {screenshotPreview && (
                      <div className="mt-3 relative w-32 h-32 rounded-xl overflow-hidden">
                        <img src={screenshotPreview} alt="معاينة" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-text-muted">ملاحظات (اختياري)</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input-modern min-h-[80px] resize-none" placeholder="أي ملاحظات إضافية..." />
                </div>

                <div className="flex gap-3">
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-4 px-8 rounded-2xl font-bold text-lg bg-gradient-to-l from-accent to-accent-light text-white hover:shadow-lg hover:shadow-accent/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {submitting ? (
                      <><Loader className="w-5 h-5 animate-spin" /> جاري إرسال الطلب...</>
                    ) : (
                      <><Send className="w-5 h-5" /> تأكيد الطلب ({totalPrice.toFixed(2)} ج.م)</>
                    )}
                  </motion.button>
                  <button type="button" onClick={() => setShowCheckout(false)} className="px-6 py-4 rounded-2xl bg-white/5 text-text-muted hover:bg-white/10 transition-colors font-medium">
                    إلغاء
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
