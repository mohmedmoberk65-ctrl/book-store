"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Check, X } from "lucide-react";
import toast from "react-hot-toast";

interface Year {
  id: number;
  name: string;
  sortOrder: number;
  active: boolean;
}

export default function YearsPage() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Year | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);

  const fetchYears = async () => {
    const res = await fetch("/api/years");
    const data = await res.json();
    setYears(data);
    setLoading(false);
  };

  useEffect(() => { fetchYears(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editing) {
        await fetch("/api/years", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editing.id, name, sortOrder, active: true }),
        });
        toast.success("تم تحديث السنة بنجاح");
      } else {
        await fetch("/api/years", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, sortOrder }),
        });
        toast.success("تم إضافة السنة بنجاح");
      }
      setShowModal(false);
      setEditing(null);
      setName("");
      setSortOrder(0);
      fetchYears();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("هل أنت متأكد من حذف هذه السنة؟")) return;
    try {
      await fetch(`/api/years?id=${id}`, { method: "DELETE" });
      toast.success("تم حذف السنة بنجاح");
      fetchYears();
    } catch {
      toast.error("حدث خطأ");
    }
  };

  const openEdit = (year: Year) => {
    setEditing(year);
    setName(year.name);
    setSortOrder(year.sortOrder);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">إدارة السنوات</h1>
          <p className="text-text-muted">أضف أو عدل السنوات الدراسية</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setEditing(null); setName(""); setSortOrder(0); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-light transition-colors"
        >
          <Plus className="w-5 h-5" />
          إضافة سنة
        </motion.button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-wrapper">

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right p-4 text-text-muted text-sm font-medium">#</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الاسم</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الترتيب</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year) => (
                <tr key={year.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">{year.id}</td>
                  <td className="p-4 font-medium">{year.name}</td>
                  <td className="p-4 text-text-muted">{year.sortOrder}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(year)} className="p-2 rounded-lg hover:bg-accent/10 text-accent transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(year.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {years.length === 0 && !loading && (
                <tr><td colSpan={4} className="p-8 text-center text-text-muted">لا توجد سنوات</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-8 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold mb-6">{editing ? "تعديل سنة" : "إضافة سنة"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">اسم السنة</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-modern" placeholder="مثال: السنة الأولى" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-text-muted">الترتيب</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value))} className="input-modern" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 py-3 rounded-xl bg-accent text-white font-bold hover:bg-accent-light transition-colors">
                  {editing ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="py-3 px-6 rounded-xl bg-white/5 text-text-muted hover:bg-white/10 transition-colors">
                  إلغاء
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
