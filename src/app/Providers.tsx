"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#1e2a45",
            color: "#eaeaea",
            border: "1px solid rgba(233, 69, 96, 0.2)",
            borderRadius: "12px",
            direction: "rtl",
            fontFamily: "'Cairo', sans-serif",
          },
          success: {
            iconTheme: {
              primary: "#2ecc71",
              secondary: "#1e2a45",
            },
          },
          error: {
            iconTheme: {
              primary: "#e74c3c",
              secondary: "#1e2a45",
            },
          },
        }}
      />
    </SessionProvider>
  );
}
