"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Download, Upload, Search, Eye, CheckCircle2, XCircle, Filter } from "lucide-react";
import toast from "react-hot-toast";

interface Order {
  id: number; customerName: string; phone: string; transferFrom: string;
  paymentMethod: string; status: string; screenshot: string; notes: string;
  createdAt: string;
  bookVersion: { name: string; price: number; book: { name: string; lecture: { name: string; year: { name: string } } } };
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const fetchOrders = async () => {
    const params = statusFilter ? `?status=${statusFilter}` : "?all=true";
    const res = await fetch(`/api/orders${params}`);
    const data = await res.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const updateStatus = async (id: number, status: string) => {
    await fetch("/api/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    toast.success(`تم ${status === "confirmed" ? "تأكيد" : "إلغاء"} الطلب`);
    fetchOrders();
  };

  const exportCSV = () => {
    const headers = ["#", "العميل", "الهاتف", "رقم التحويل", "طريقة الدفع", "الكتاب", "النسخة", "السعر", "الحالة", "التاريخ", "ملاحظات"];
    const rows = orders.map(o => [
      o.id, o.customerName, o.phone, o.transferFrom, o.paymentMethod,
      o.bookVersion?.book?.name || "", o.bookVersion?.name || "", o.bookVersion?.price || 0,
      o.status, new Date(o.createdAt).toLocaleString("ar-EG"), o.notes
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("تم تصدير الملف");
  };

  const importCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const lines = text.split("\n").slice(1).filter(l => l.trim());
    
    try {
      let imported = 0;
      for (const line of lines) {
        const cols = line.split(",");
        if (cols.length >= 6) {
          await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerName: cols[1], phone: cols[2], transferFrom: cols[3] || "",
              paymentMethod: cols[4], bookVersionId: parseInt(cols[0]) || 1,
              notes: cols[10] || "",
            }),
          });
          imported++;
        }
      }
      toast.success(`تم استيراد ${imported} طلب`);
      fetchOrders();
    } catch { toast.error("خطأ في استيراد الملف"); }
  };

  const paymentLabels: Record<string, string> = {
    instapay: "InstaPay", orange_cash: "Orange Cash",
    vodafone_cash: "Vodafone Cash", etisalat_cash: "Etisalat Cash",
  };

  const filteredOrders = orders.filter(o =>
    o.customerName?.includes(searchTerm) || o.phone?.includes(searchTerm)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div><h1 className="text-3xl font-bold">الطلبات</h1><p className="text-text-muted">عرض وإدارة طلبات الشراء</p></div>
        <div className="flex gap-3">
          <motion.button whileHover={{ scale: 1.02 }} onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-success/20 text-success font-bold">
            <Download className="w-4 h-4" /> تصدير CSV
          </motion.button>
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl bg-surface-light/30 text-text font-bold cursor-pointer">
            <Upload className="w-4 h-4" /> استيراد CSV
            <input type="file" accept=".csv" onChange={importCSV} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-modern pr-12" placeholder="بحث..." />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="select-modern w-40">
          <option value="">الكل</option>
          <option value="pending">قيد الانتظار</option>
          <option value="confirmed">مؤكد</option>
          <option value="cancelled">ملغي</option>
        </select>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <div className="table-wrapper">

          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right p-4 text-text-muted text-sm font-medium">#</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">العميل</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الكتاب</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">طريقة الدفع</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الحالة</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">التاريخ</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(o => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">{o.id}</td>
                  <td className="p-4"><div className="font-medium">{o.customerName}</div><div className="text-text-muted text-xs">{o.phone}</div></td>
                  <td className="p-4 text-sm">{o.bookVersion?.book?.name || "-"}</td>
                  <td className="p-4 text-sm">{paymentLabels[o.paymentMethod] || o.paymentMethod}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      o.status === "confirmed" ? "bg-success/10 text-success border-success/20" :
                      o.status === "cancelled" ? "bg-danger/10 text-danger border-danger/20" :
                      "bg-gold/10 text-gold border-gold/20"
                    }`}>
                      {o.status === "confirmed" ? "مؤكد" : o.status === "cancelled" ? "ملغي" : "قيد الانتظار"}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-text-muted">{new Date(o.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => setSelectedOrder(o)} className="p-2 rounded-lg hover:bg-surface-light/30 text-text-muted"><Eye className="w-4 h-4" /></button>
                      {o.status === "pending" && (
                        <>
                          <button onClick={() => updateStatus(o.id, "confirmed")} className="p-2 rounded-lg hover:bg-success/10 text-success"><CheckCircle2 className="w-4 h-4" /></button>
                          <button onClick={() => updateStatus(o.id, "cancelled")} className="p-2 rounded-lg hover:bg-danger/10 text-danger"><XCircle className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={() => setSelectedOrder(null)}>
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="glass rounded-2xl p-8 w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-bold mb-6">تفاصيل الطلب #{selectedOrder.id}</h2>
            <div className="space-y-3">
              <div><span className="text-text-muted">العميل: </span><span className="font-medium">{selectedOrder.customerName}</span></div>
              <div><span className="text-text-muted">الهاتف: </span><span>{selectedOrder.phone}</span></div>
              {selectedOrder.transferFrom && <div><span className="text-text-muted">رقم التحويل من: </span><span>{selectedOrder.transferFrom}</span></div>}
              <div><span className="text-text-muted">طريقة الدفع: </span><span>{paymentLabels[selectedOrder.paymentMethod]}</span></div>
              <div><span className="text-text-muted">الكتاب: </span><span>{selectedOrder.bookVersion?.book?.name}</span></div>
              <div><span className="text-text-muted">النسخة: </span><span>{selectedOrder.bookVersion?.name}</span></div>
              <div><span className="text-text-muted">السعر: </span><span className="text-gold font-bold">{selectedOrder.bookVersion?.price} ج.م</span></div>
              {selectedOrder.notes && <div><span className="text-text-muted">ملاحظات: </span><span>{selectedOrder.notes}</span></div>}
              {selectedOrder.screenshot && (
                <div><span className="text-text-muted">صورة الإيصال: </span>
                  <img src={selectedOrder.screenshot} alt="إيصال" className="mt-2 rounded-xl max-h-48 object-contain bg-black/20" />
                </div>
              )}
              <div><span className="text-text-muted">التاريخ: </span><span>{new Date(selectedOrder.createdAt).toLocaleString("ar-EG")}</span></div>
            </div>
            <button onClick={() => setSelectedOrder(null)} className="mt-6 px-6 py-3 rounded-xl bg-accent text-white font-bold w-full">إغلاق</button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
