"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { BookOpen, ArrowRight, Image as ImageIcon } from "lucide-react";
import { useImageLightbox } from "@/components/ImageLightbox";

interface Book {
  id: number;
  name: string;
  description: string;
  image: string;
  sortOrder: number;
}

interface LectureInfo {
  id: number;
  name: string;
  year?: { id: number; name: string };
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
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

export default function BooksPage() {
  const params = useParams();
  const lectureId = params.lectureId as string;
  const [books, setBooks] = useState<Book[]>([]);
  const [lectureInfo, setLectureInfo] = useState<LectureInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { openLightbox, ImageLightboxComponent } = useImageLightbox();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, lecturesRes] = await Promise.all([
          fetch(`/api/books?lectureId=${lectureId}`),
          fetch(`/api/lectures?id=${lectureId}`),
        ]);
        const booksData = await booksRes.json();
        const lecturesData = await lecturesRes.json();
        setBooks(booksData);
        const lecture = Array.isArray(lecturesData) && lecturesData.length > 0
          ? lecturesData[0]
          : lecturesData;
        setLectureInfo(lecture);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [lectureId]);

  const displayName = lectureInfo
    ? `${lectureInfo.name}${lectureInfo.year ? ` (${lectureInfo.year.name})` : ""}`
    : "";

  return (
    <div className="min-h-screen">
      {ImageLightboxComponent}

      {/* Header */}
      <div className="relative py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8"
          >
            <Link
              href={`/lectures/${params.lectureId}`}
              className="inline-flex items-center gap-2 text-text-muted hover:text-accent transition-colors glass px-4 py-2 rounded-full"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة للمواد</span>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              كتب <span className="text-accent">{displayName}</span>
            </h1>
            <p className="text-text-muted text-lg">اختر الكتاب الذي تريد شراءه</p>
          </motion.div>
        </div>
      </div>

      {/* Books Grid */}
      <section className="relative py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="loading-spinner" />
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {books.map((book, i) => (
                <motion.div key={book.id} custom={i} variants={fadeInUp}>
                  <div className="group relative glass rounded-2xl overflow-hidden card-hover cursor-pointer">
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent z-10" />

                    {/* Book Image - clickable to expand */}
                    <div
                      className="aspect-[3/4] bg-gradient-to-br from-card to-card-hover flex items-center justify-center overflow-hidden"
                      onClick={(e) => {
                        if (book.image) {
                          e.preventDefault();
                          openLightbox(book.image, book.name);
                        }
                      }}
                    >
                      {book.image ? (
                        <img
                          src={book.image}
                          alt={book.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <ImageIcon className="w-20 h-20 text-text-muted/30" />
                      )}
                      {book.image && (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-sm font-medium bg-black/50 px-4 py-2 rounded-full">
                            اضغط لتكبير الصورة
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay Content */}
                    <Link href={`/book/${book.id}`}>
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-6">
                        <h3 className="text-xl font-bold mb-2">{book.name}</h3>
                        {book.description && (
                          <p className="text-text-muted text-sm line-clamp-2">
                            {book.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-accent mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <span className="text-sm">عرض النسخ</span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>

                    <div className="absolute -inset-1 bg-gradient-to-r from-accent/10 to-gold/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {!loading && books.length === 0 && (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="glass rounded-2xl p-12 max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <p className="text-text-muted text-lg">لا توجد كتب متاحة حالياً</p>
              </div>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
