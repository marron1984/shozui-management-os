"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="flex min-h-screen">
      {!isLogin && <Sidebar />}
      <main className={`flex-1 transition-all duration-300 ${!isLogin ? "ml-60" : ""}`}>
        {children}
      </main>
    </div>
  );
}
