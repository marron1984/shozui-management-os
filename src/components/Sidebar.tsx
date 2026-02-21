"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  ClipboardCheck,
  Wallet,
  Users,
  UserPlus,
  Image,
  CalendarCheck,
  MessageCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { getCurrentUser, logout } from "@/lib/auth";
import { ROLE_LABELS } from "@/types";

const menuItems = [
  { href: "/", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/daily-reports", label: "日報管理", icon: FileText },
  { href: "/monthly-reports", label: "月次報告", icon: BarChart3 },
  { href: "/approval", label: "稟議書", icon: ClipboardCheck },
  { href: "/finance", label: "資金繰り", icon: Wallet },
  { href: "/employees", label: "社員管理", icon: Users },
  { href: "/recruitment", label: "採用管理", icon: UserPlus },
  { href: "/promotions", label: "販促素材", icon: Image },
  { href: "/reservations", label: "予約状況", icon: CalendarCheck },
  { href: "/chat", label: "連絡", icon: MessageCircle },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const user = getCurrentUser();

  if (!user || pathname === "/login") return null;

  const showLabels = !collapsed || mobileOpen;

  return (
    <>
      {/* モバイル: オーバーレイ背景 */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* サイドバー本体 */}
      <aside
        className={[
          "fixed left-0 top-0 h-full bg-[#1a1a1a] text-white z-[60] flex flex-col transition-all duration-300",
          "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0",
          collapsed ? "lg:w-16" : "lg:w-60",
        ].join(" ")}
      >
        {/* ロゴ */}
        <div className="p-4 lg:p-5 border-b border-[#c4a265]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0 border border-[#c4a265]/40 bg-gradient-to-br from-[#c4a265]/10 to-transparent">
              <span className="text-[#c4a265] font-semibold text-base tracking-widest">祥</span>
            </div>
            {showLabels && (
              <div>
                <div className="text-sm font-medium tracking-[0.15em] text-[#c4a265]">祥瑞</div>
                <div className="text-[9px] text-white/30 tracking-[0.2em] mt-0.5">MANAGEMENT OS</div>
              </div>
            )}
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 text-white/40 hover:text-white/70 lg:hidden"
          >
            <X size={18} strokeWidth={1.5} />
          </button>
        </div>

        {/* メニュー */}
        <nav className="flex-1 py-3 lg:py-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={`flex items-center gap-3 px-4 py-3 lg:py-2.5 mx-2 rounded transition-all duration-300 text-[13px] tracking-wider ${
                  isActive
                    ? "bg-[#c4a265]/10 text-[#c4a265] border-l-2 border-[#c4a265]"
                    : "text-white/40 hover:text-white/70 hover:bg-white/[0.03]"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon size={16} className="flex-shrink-0" strokeWidth={1.5} />
                {showLabels && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* ユーザー情報 */}
        <div className="border-t border-[#c4a265]/10 p-3">
          {showLabels && (
            <div className="mb-3 px-2">
              <div className="text-xs font-medium text-white/70 tracking-wider">{user.name}</div>
              <div className="text-[10px] text-white/30 tracking-wider mt-0.5">{ROLE_LABELS[user.role]}</div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                logout();
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 px-2 py-1.5 text-white/30 hover:text-[#c4a265]/70 transition-colors duration-300 text-xs rounded tracking-wider"
              title="ログアウト"
            >
              <LogOut size={14} strokeWidth={1.5} />
              {showLabels && <span>退出</span>}
            </button>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-white/20 hover:text-white/50 transition-colors duration-300 rounded hidden lg:block"
            >
              {collapsed ? <ChevronRight size={14} strokeWidth={1.5} /> : <ChevronLeft size={14} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
