"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Smartphone, Building } from "lucide-react";
import toast from "react-hot-toast";

interface Account { id: number; name: string; type: string; accountName: string; number: string; description: string; sortOrder: number; }

export default function PaymentsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [name, setName] = useState(""); const [type, setType] = useState("instapay"); const [accountName, setAccountName] = useState("");
  const [number, setNumber] = useState(""); const [description, setDescription] = useState(""); const [sortOrder, setSortOrder] = useState(0);

  const fetchAccounts = async () => {
    const res = await fetch("/api/payment-accounts"); setAccounts(await res.json());
  };
  useEffect(() => { fetchAccounts(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const body = { name, type, accountName, number, description, sortOrder };
    try {
      if (editing) { await fetch("/api/payment-accounts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...body, id: editing.id }) }); toast.success("تم التحديث"); }
      else { await fetch("/api/payment-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }); toast.success("تم الإضافة"); }
      setShowModal(false); setEditing(null); setName(""); setType("instapay"); setAccountName(""); setNumber(""); setDescription(""); setSortOrder(0);
      fetchAccounts();
    } catch { toast.error("حدث خطأ"); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("متأكد؟")) return;
    await fetch(`/api/payment-accounts?id=${id}`, { method: "DELETE" }); toast.success("تم الحذف"); fetchAccounts();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold">حسابات الدفع</h1><p className="text-text-muted">أرقام الحسابات التي سيتم التحويل إليها</p></div>
        <motion.button whileHover={{ scale: 1.02 }}
          onClick={() => { setEditing(null); setName(""); setType("instapay"); setAccountName(""); setNumber(""); setDescription(""); setSortOrder(0); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-white font-bold"><Plus className="w-5 h-5" /> إضافة حساب</motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="glass rounded-2xl p-6 card-hover">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${acc.type === "instapay" ? "bg-accent/10" : "bg-gold/10"}`}>
                  {acc.type === "instapay" ? <Smartphone className="w-6 h-6 text-accent" /> : <Building className="w-6 h-6 text-gold" />}
                </div>
                <div>
                  <h3 className="font-bold">{acc.name}</h3>
                  <span className="text-text-muted text-sm">{acc.type === "instapay" ? "InstaPay" : "محفظة موبايل"}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditing(acc); setName(acc.name); setType(acc.type); setAccountName(acc.accountName); setNumber(acc.number); setDescription(acc.description); setSortOrder(acc.sortOrder); setShowModal(true); }}
                  className="p-2 rounded-lg hover:bg-accent/10 text-accent"><Edit2 className="w-4 h-4" /></button>
                <button onClick={() => handleDelete(acc.id)} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="space-y-2">
              {acc.accountName && <p className="text-text-muted text-sm">اسم الحساب: {acc.accountName}</p>}
              <p className={`text-2xl font-bold ${acc.type === "instapay" ? "text-accent" : "text-gold"}`} dir="ltr">{acc.number}</p>
              {acc.description && <p className="text-text-muted text-sm">{acc.description}</p>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">{editing ? "تعديل حساب" : "إضافة حساب"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" value={name} onChange={e => setName(e.target.value)} className="input-modern" placeholder="اسم الحساب" required />
              <select value={type} onChange={e => setType(e.target.value)} className="select-modern">
                <option value="instapay">InstaPay</option>
                <option value="mobile_wallet">محفظة موبايل</option>
              </select>
              <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} className="input-modern" placeholder="اسم صاحب الحساب" />
              <input type="text" value={number} onChange={e => setNumber(e.target.value)} className="input-modern" placeholder="رقم الحساب" required />
              <textarea value={description} onChange={e => setDescription(e.target.value)} className="input-modern min-h-[60px]" placeholder="وصف (اختياري)" />
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
