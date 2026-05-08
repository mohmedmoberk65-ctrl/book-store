"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  BookCopy,
  FileText,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Layers,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const sidebarLinks = [
  { href: "/admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/admin/years", label: "السنوات", icon: GraduationCap },
  { href: "/admin/lectures", label: "المحاضرات", icon: BookCopy },
  { href: "/admin/books", label: "الكتب", icon: BookOpen },
  { href: "/admin/versions", label: "النسخ", icon: Layers },
  { href: "/admin/orders", label: "الطلبات", icon: FileText },
  { href: "/admin/payments", label: "حسابات الدفع", icon: CreditCard },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login");
    }
  }, [status, pathname, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a1a]">
        <div className="loading-spinner" />
      </div>
    );
  }

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 right-0 z-50 w-72 bg-gradient-to-b from-[#1a1a2e] to-[#16213e] border-l border-white/5 transform transition-transform duration-300 lg:transform-none ${
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-white/5">
            <div className="flex items-center justify-between">
              <Link href="/admin/dashboard" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-light flex items-center justify-center">
                  <span className="text-white font-bold text-lg">ك</span>
                </div>
                <span className="text-xl font-bold">لوحة التحكم</span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-text-muted hover:text-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : "text-text-muted hover:bg-white/5 hover:text-text"
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  <span className="font-medium">{link.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="w-1 h-6 rounded-full bg-accent mr-auto"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/5">
            <Link
              href="/"
              className="flex items-center gap-2 px-4 py-3 rounded-xl text-text-muted hover:text-text hover:bg-white/5 transition-all mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm">العودة للموقع</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-muted hover:text-danger hover:bg-danger/5 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass border-b border-white/5">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-text-muted hover:text-text"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4">
              <div className="text-sm text-text-muted">
                مرحباً، <span className="text-text font-medium">{session.user?.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
