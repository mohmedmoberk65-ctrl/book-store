"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

interface Lecture { id: number; name: string; yearId: number; sortOrder: number; active: boolean; }
interface Year { id: number; name: string; }

export default function LecturesPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Lecture | null>(null);
  const [name, setName] = useState("");
  const [yearId, setYearId] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);

  const fetchData = async () => {
    const [lecturesRes, yearsRes] = await Promise.all([fetch("/api/lectures?all=true"), fetch("/api/years")]);
    setLectures(await lecturesRes.json());
    setYears(await yearsRes.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch("/api/lectures", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editing.id, name, yearId, sortOrder, active: true }) });
        toast.success("تم تحديث المحاضرة");
      } else {
        await fetch("/api/lectures", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, yearId, sortOrder }) });
        toast.success("تم إضافة المحاضرة");
      }
      setShowModal(false); setEditing(null); setName(""); setYearId(0); setSortOrder(0);
      fetchData();
    } catch { toast.error("حدث خطأ"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await fetch(`/api/lectures?id=${id}`, { method: "DELETE" });
    toast.success("تم الحذف");
    fetchData();
  };

  const getYearName = (id: number) => years.find(y => y.id === id)?.name || "-";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة المحاضرات</h1>
          <p className="text-text-muted">أضف أو عدل المحاضرات للمواد الدراسية</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => { setEditing(null); setName(""); setYearId(0); setSortOrder(0); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold">
          <Plus className="w-5 h-5" /> إضافة محاضرة
        </motion.button>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-wrapper">

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right p-4 text-text-muted text-sm font-medium">#</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الاسم</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">السنة</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الترتيب</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {lectures.map(l => (
                <tr key={l.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">{l.id}</td>
                  <td className="p-4 font-medium">{l.name}</td>
                  <td className="p-4 text-text-muted">{getYearName(l.yearId)}</td>
                  <td className="p-4 text-text-muted">{l.sortOrder}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(l); setName(l.name); setYearId(l.yearId); setSortOrder(l.sortOrder); setShowModal(true); }} className="p-2 rounded-lg hover:bg-accent/10 text-accent"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(l.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
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
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editing ? "تعديل محاضرة" : "إضافة محاضرة"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">اسم المحاضرة</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">السنة الدراسية</label>
                <select value={yearId} onChange={e => setYearId(parseInt(e.target.value))} className="select-modern" required>
                  <option value={0}>اختر السنة</option>
                  {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">الترتيب</label>
                <input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value))} className="input-modern" />
              </div>
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
