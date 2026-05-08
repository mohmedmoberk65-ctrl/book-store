"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ChevronLeft, ArrowRight, GraduationCap } from "lucide-react";

interface Lecture {
  id: number;
  name: string;
  sortOrder: number;
}

interface YearData {
  id: number;
  name: string;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};


const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 },
  },
};

export default function LecturesPage() {
  const params = useParams();
  const yearId = params.yearId as string;
  const [year, setYear] = useState<YearData | null>(null);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [lecturesRes, yearRes] = await Promise.all([
          fetch(`/api/lectures?yearId=${yearId}`),
          fetch(`/api/years?id=${yearId}`),
        ]);
        const lecturesData = await lecturesRes.json();
        const yearData = await yearRes.json();
        setLectures(lecturesData);
        setYear(Array.isArray(yearData) ? yearData[0] : yearData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [yearId]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors glass px-4 py-2 rounded-full"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للصفحة الرئيسية</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass mb-4">
              <GraduationCap className="w-5 h-5 text-accent" />
              <span className="text-text-muted">
                {year ? year.name : "جاري التحميل..."}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              اختر <span className="text-accent">المادة</span>
            </h1>
            <p className="text-text-muted text-lg">
              {year ? `جميع مواد ${year.name}` : ""}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Lectures Grid */}
      <section className="relative py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loading-spinner" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {lectures.map((lecture, i) => (
                <motion.div key={lecture.id} custom={i} variants={fadeInUp}>
                  <Link href={`/books/${lecture.id}`}>
                    <div className="group relative glass rounded-2xl p-8 card-hover cursor-pointer overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-surface/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent via-gold to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-surface-light/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <BookOpen className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-2xl font-bold text-center">
                          {lecture.name}
                          {year && <span className="block text-sm font-normal text-text-muted mt-1">({year.name})</span>}
                        </h3>

                        <div className="flex items-center gap-2 text-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm">تصفح الكتب</span>
                          <ChevronLeft className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && lectures.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted text-lg">لا توجد مواد متاحة حالياً</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
