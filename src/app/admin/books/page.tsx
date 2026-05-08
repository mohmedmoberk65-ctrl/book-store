"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Book { id: number; name: string; description: string; image: string; lectureId: number; sortOrder: number; }
interface Lecture { id: number; name: string; year: { name: string }; }

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Book | null>(null);
  const [name, setName] = useState(""); const [description, setDescription] = useState("");
  const [image, setImage] = useState(""); const [lectureId, setLectureId] = useState(0); const [sortOrder, setSortOrder] = useState(0);

  const fetchData = async () => {
    const [b, l] = await Promise.all([fetch("/api/books?all=true"), fetch("/api/lectures?all=true")]);
    setBooks(await b.json()); setLectures(await l.json());
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name, description, image, lectureId, sortOrder };
    try {
      if (editing) { await fetch("/api/books", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, id: editing.id }) }); toast.success("تم التحديث"); }
      else { await fetch("/api/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); toast.success("تم الإضافة"); }
      setShowModal(false); setEditing(null); setName(""); setDescription(""); setImage(""); setLectureId(0); setSortOrder(0); fetchData();
    } catch { toast.error("حدث خطأ"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("متأكد؟")) return;
    await fetch(`/api/books?id=${id}`, { method: "DELETE" }); toast.success("تم الحذف"); fetchData();
  };

  const getLecture = (id: number) => lectures.find(l => l.id === id);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">إدارة الكتب</h1><p className="text-text-muted">أضف أو عدل الكتب</p></div>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setEditing(null); setName(""); setDescription(""); setImage(""); setLectureId(0); setSortOrder(0); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold"><Plus className="w-5 h-5" /> إضافة كتاب</motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map(book => {
          const lecture = getLecture(book.lectureId);
          return (
            <div key={book.id} className="glass rounded-2xl p-6 card-hover">
              <div className="aspect-[3/2] rounded-xl bg-gradient-to-br from-card to-card-hover mb-4 overflow-hidden">
                {book.image ? <img src={book.image} alt={book.name} className="w-full h-full object-cover" /> :
                  <div className="w-full h-full flex items-center justify-center text-text-muted/30">📚</div>}
              </div>
              <h3 className="font-bold text-lg mb-1">{book.name}</h3>
              {lecture && <p className="text-text-muted text-sm mb-3">{lecture.name} - {lecture.year?.name}</p>}
              <p className="text-text-muted text-sm mb-4 line-clamp-2">{book.description}</p>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(book); setName(book.name); setDescription(book.description); setImage(book.image); setLectureId(book.lectureId); setSortOrder(book.sortOrder); setShowModal(true); }}
                  className="p-2 rounded-lg hover:bg-accent/10 text-accent"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(book.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editing ? "تعديل كتاب" : "إضافة كتاب"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern" placeholder="اسم الكتاب" required />
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-modern min-h-[80px]" placeholder="وصف الكتاب" />
              <input type="text" value={image} onChange={e => setImage(e.target.value)} className="input-modern" placeholder="رابط الصورة" />
              <select value={lectureId} onChange={e => setLectureId(parseInt(e.target.value))} className="select-modern" required>
                <option value={0}>اختر المحاضرة</option>
                {lectures.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
              <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} className="input-modern" placeholder="الترتيب" />
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-white font-bold">{editing ? "تحديث" : "إضافة"}</button>
                <button type="button" onClick={() => setShowModal(false)} className="py-3 px-6 rounded-xl bg-white/5 text-text-muted">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
