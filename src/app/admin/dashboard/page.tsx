"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  Eye,
} from "lucide-react";

interface OrderStats {
  total: number;
  pending: number;
  confirmed: number;
  cancelled: number;
}

interface RecentOrder {
  id: number;
  customerName: string;
  phone: string;
  status: string;
  price: number;
  createdAt: string;
  bookVersion: {
    name: string;
    book: { name: string };
  };
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/orders?all=true");
        const orders = await res.json();

        if (Array.isArray(orders)) {
          setStats({
            total: orders.length,
            pending: orders.filter((o: any) => o.status === "pending").length,
            confirmed: orders.filter((o: any) => o.status === "confirmed").length,
            cancelled: orders.filter((o: any) => o.status === "cancelled").length,
          });
          setRecentOrders(orders.slice(0, 10));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "إجمالي الطلبات",
      value: stats.total,
      icon: ShoppingCart,
      color: "from-accent/20 to-accent/5",
      textColor: "text-accent",
    },
    {
      label: "قيد الانتظار",
      value: stats.pending,
      icon: Clock,
      color: "from-gold/20 to-gold/5",
      textColor: "text-gold",
    },
    {
      label: "مؤكد",
      value: stats.confirmed,
      icon: CheckCircle2,
      color: "from-success/20 to-success/5",
      textColor: "text-success",
    },
    {
      label: "ملغي",
      value: stats.cancelled,
      icon: XCircle,
      color: "from-danger/20 to-danger/5",
      textColor: "text-danger",
    },
  ];

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      pending: "bg-gold/10 text-gold border-gold/20",
      confirmed: "bg-success/10 text-success border-success/20",
      cancelled: "bg-danger/10 text-danger border-danger/20",
    };
    const labels: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "مؤكد",
      cancelled: "ملغي",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${
          styles[status] || styles.pending
        }`}
      >
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
        <p className="text-text-muted mb-8">نظرة عامة على متجر كتبك</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
          >
            <div className="glass rounded-2xl p-6 card-hover">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <card.icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                <TrendingUp className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-text-muted text-sm mb-1">{card.label}</p>
              <p className={`text-3xl font-bold ${card.textColor}`}>
                {loading ? (
                  <span className="loading-spinner !w-6 !h-6 inline-block" />
                ) : (
                  card.value
                )}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Links */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {[
          { href: "/admin/years", label: "إدارة السنوات", color: "bg-accent/10 text-accent" },
          { href: "/admin/lectures", label: "إدارة المحاضرات", color: "bg-gold/10 text-gold" },
          { href: "/admin/books", label: "إدارة الكتب", color: "bg-surface-light/30 text-text" },
          { href: "/admin/orders", label: "عرض الطلبات", color: "bg-success/10 text-success" },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <div className={`glass rounded-xl p-4 text-center card-hover ${link.color}`}>
              <span className="text-sm font-medium">{link.label}</span>
            </div>
          </Link>
        ))}
      </motion.div>

      {/* Recent Orders */}
      <motion.div
        className="glass rounded-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold">آخر الطلبات</h2>
          <Link
            href="/admin/orders"
            className="text-accent text-sm hover:underline flex items-center gap-1"
          >
            <Eye className="w-4 h-4" />
            عرض الكل
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-right p-4 text-text-muted text-sm font-medium">#</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">العميل</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الكتاب</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">السعر</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">الحالة</th>
                <th className="text-right p-4 text-text-muted text-sm font-medium">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="p-4 text-sm">{order.id}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{order.customerName}</p>
                      <p className="text-text-muted text-xs">{order.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-sm">{order.bookVersion?.book?.name}</td>
                  <td className="p-4 text-sm text-gold font-bold">
                    {order.bookVersion?.name ? `${order.bookVersion.name}` : "-"}
                  </td>
                  <td className="p-4">{statusBadge(order.status)}</td>
                  <td className="p-4 text-sm text-text-muted">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-text-muted">
                    لا توجد طلبات حتى الآن
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
