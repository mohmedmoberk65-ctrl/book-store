"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { BookOpen, ChevronLeft, GraduationCap, ArrowLeft, Sparkles } from "lucide-react";

interface Year {
  id: number;
  name: string;
  sortOrder: number;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" as const },
  }),
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

export default function HomePage() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetch("/api/years")
      .then((res) => res.json())
      .then((data) => {
        setYears(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen">
      {/* Hero Section - redesigned */}
      <section className="relative min-h-[85vh] flex items-center justify-center px-4 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-gold/5 rounded-full blur-[150px]" />

        {/* Decorative floating elements */}
        <div className="absolute top-20 right-[10%] w-4 h-4 bg-accent/30 rounded-full float" style={{ animationDelay: "0s" }} />
        <div className="absolute top-40 left-[15%] w-3 h-3 bg-gold/30 rounded-full float" style={{ animationDelay: "0.5s" }} />
        <div className="absolute bottom-40 right-[20%] w-5 h-5 bg-accent/20 rounded-full float" style={{ animationDelay: "1s" }} />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass mb-8 border-accent/20">
              <Sparkles className="w-5 h-5 text-gold" />
              <span className="text-sm text-gold font-semibold">🔥 عرض محدود - الكمية بتخلص بسرعة!</span>
            </div>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="text-gradient block">احجز كتبك الآن</span>
            <span className="text-white">من <span className="text-accent">سنتر الأوائل</span></span>
            <span className="block text-2xl md:text-3xl text-gold mt-2">– الكمية محدودة</span>
          </motion.h1>

          <motion.div
            className="max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass rounded-2xl p-6 md:p-8 text-right">
              <p className="text-xl md:text-2xl font-bold text-accent mb-4">
                🎯 سارع بالحجز الآن قبل نفاذ الكمية!
              </p>
              <p className="text-text-muted text-lg leading-relaxed mb-4">
                كتابك متوفر دلوقتي في <span className="text-gold font-bold">سنتر الأوائل</span> — والفرصة محدودة! 🔥
              </p>
              <p className="text-text-muted text-lg leading-relaxed mb-6">
                لو عايز تضمن نسختك، متتأخرش… الكمية بتخلص بسرعة!
              </p>
              <div className="bg-gradient-to-r from-accent/10 to-gold/5 rounded-xl p-5 border border-accent/20">
                <p className="text-gold font-bold text-lg mb-3">🚀 مميزات الحجز:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {["✔️ حجز سهل وسريع", "✔️ استلام خلال 3 إلى 4 أيام فقط", "✔️ جودة مضمونة وسعر مناسب"].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center gap-2 text-text"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + i * 0.2 }}
                    >
                      <span className="text-lg">{item}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
              <motion.p
                className="text-center mt-4 text-lg font-bold text-accent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4 }}
              >
                ⏳ متستناش لحد ما يخلص… احجز دلوقتي وخليك من الأوائل!
              </motion.p>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="flex items-center gap-2 text-accent animate-bounce">
              <span className="text-sm">اختر سنتك الدراسية للبدء</span>
              <ChevronLeft className="w-5 h-5" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Promotional Image Section */}
      <motion.section
        className="relative py-16 px-4"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="glass rounded-3xl overflow-hidden">
            <div className="relative aspect-[21/9] md:aspect-[21/7] bg-gradient-to-br from-accent/5 via-surface/5 to-gold/5 flex items-center justify-center">
              {!imageError ? (
                <img
                  src="/uploads/hero-book.jpg"
                  alt="سنتر الأوائل - كتب جامعية"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="text-center p-8">
                  <BookOpen className="w-24 h-24 text-accent/30 mx-auto mb-4" />
                  <p className="text-text-muted text-xl font-bold">سنتر الأوائل</p>
                  <p className="text-text-muted">للكتب الجامعية</p>
                </div>
              )}
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-right">
                <span className="inline-block px-4 py-2 rounded-full bg-accent/80 text-white text-sm font-bold backdrop-blur-sm">
                  📚 الكتب الجامعية بأفضل الأسعار
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Years Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              اختر <span className="text-accent">سنتك</span> الدراسية
            </h2>
            <p className="text-text-muted text-lg">
              جميع الكتب التي تحتاجها في مكان واحد
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center">
              <div className="loading-spinner" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {years.map((year, i) => (
                <motion.div key={year.id} custom={i} variants={fadeInUp}>
                  <Link href={`/lectures/${year.id}`}>
                    <div className="group relative glass rounded-2xl p-8 card-hover cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-gold to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-gold/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold text-center">{year.name}</h3>
                        <div className="flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm">تصفح الكتب</span>
                          <ArrowLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && years.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted text-lg">لا توجد سنوات دراسية متاحة حالياً</p>
                <p className="text-text-muted text-sm mt-2">سيتم إضافة السنوات قريباً</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-8 px-4 border-t border-white/5">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} <span className="text-accent">سنتر الأوائل</span> - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}
