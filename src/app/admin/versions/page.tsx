"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Version { id: number; name: string; image: string; price: number; bookId: number; sortOrder: number; book?: { name: string; lecture?: { name: string; year?: { name: string } } } }
interface Book { id: number; name: string; }

export default function VersionsPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Version | null>(null);
  const [name, setName] = useState(""); const [image, setImage] = useState(""); const [price, setPrice] = useState(0); const [bookId, setBookId] = useState(0); const [sortOrder, setSortOrder] = useState(0);

  const fetchData = async () => {
    const [v, b] = await Promise.all([fetch("/api/versions?all=true"), fetch("/api/books?all=true")]);
    setVersions(await v.json()); setBooks(await b.json());
  };
  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name, image, price, bookId, sortOrder };
    try {
      if (editing) { await fetch("/api/versions", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, id: editing.id }) }); toast.success("تم التحديث"); }
      else { await fetch("/api/versions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); toast.success("تم الإضافة"); }
      setShowModal(false); setEditing(null); setName(""); setImage(""); setPrice(0); setBookId(0); setSortOrder(0); fetchData();
    } catch { toast.error("حدث خطأ"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("متأكد؟")) return;
    await fetch(`/api/versions?id=${id}`, { method: "DELETE" }); toast.success("تم الحذف"); fetchData();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">إدارة النسخ</h1><p className="text-text-muted">أضف أو عدل نسخ الكتب</p></div>
        <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setEditing(null); setName(""); setImage(""); setPrice(0); setBookId(0); setSortOrder(0); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold"><Plus className="w-5 h-5" /> إضافة نسخة</motion.button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-wrapper">

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right p-4 text-text-muted text-sm font-medium">#</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الاسم</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الكتاب</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">السعر</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {versions.map(v => (
                <tr key={v.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">{v.id}</td>
                  <td className="p-4 font-medium">{v.name}</td>
                  <td className="p-4 text-text-muted">{v.book?.name || "-"}</td>
                  <td className="p-4 text-gold font-bold">{v.price} ج.م</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(v); setName(v.name); setImage(v.image); setPrice(v.price); setBookId(v.bookId); setSortOrder(v.sortOrder); setShowModal(true); }} className="p-2 rounded-lg hover:bg-accent/10 text-accent"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editing ? "تعديل نسخة" : "إضافة نسخة"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern" placeholder="اسم النسخة" required />
              <input type="text" value={image} onChange={e => setImage(e.target.value)} className="input-modern" placeholder="رابط الصورة" />
              <div className="flex gap-4">
                <input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value))} className="input-modern flex-1" placeholder="السعر" required />
                <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} className="input-modern w-24" placeholder="ترتيب" />
              </div>
              <select value={bookId} onChange={e => setBookId(parseInt(e.target.value))} className="select-modern" required>
                <option value={0}>اختر الكتاب</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
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
