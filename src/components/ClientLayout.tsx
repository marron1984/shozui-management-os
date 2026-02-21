"use client";

import { usePathname } from "next/navigation";
import { useState, createContext, useContext, useCallback } from "react";
import Sidebar from "./Sidebar";

// モバイルメニュー開閉コンテキスト
const MobileMenuContext = createContext<{
  openMobileMenu: () => void;
}>({ openMobileMenu: () => {} });

export function useMobileMenu() {
  return useContext(MobileMenuContext);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/login";
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const openMobileMenu = useCallback(() => setMobileOpen(true), []);
  const closeMobileMenu = useCallback(() => setMobileOpen(false), []);

  return (
    <MobileMenuContext.Provider value={{ openMobileMenu }}>
      <div className="flex min-h-screen">
        {!isLogin && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            mobileOpen={mobileOpen}
            onMobileClose={closeMobileMenu}
          />
        )}
        <main
          className={`flex-1 transition-all duration-300 ${
            !isLogin ? (sidebarCollapsed ? "lg:ml-16" : "lg:ml-60") : ""
          }`}
        >
          {children}
        </main>
      </div>
    </MobileMenuContext.Provider>
  );
}
