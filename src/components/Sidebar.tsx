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
  { href: "/promotions", label: "プロモーション", icon: Image },
  { href: "/reservations", label: "予約状況", icon: CalendarCheck },
  { href: "/chat", label: "チャット", icon: MessageCircle },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const user = getCurrentUser();

  if (!user || pathname === "/login") return null;

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-[#1a1a2e] text-white transition-all duration-300 z-50 flex flex-col ${
        collapsed ? "w-16" : "w-60"
      }`}
    >
      {/* ロゴ */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-bold text-sm text-[#1a1a2e] flex-shrink-0">
            祥
          </div>
          {!collapsed && (
            <div>
              <div className="font-bold text-sm">祥瑞マネジメントOS</div>
              <div className="text-[10px] text-white/50">Management Platform</div>
            </div>
          )}
        </div>
      </div>

      {/* メニュー */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 mx-2 rounded-lg transition-all text-sm ${
                isActive
                  ? "bg-amber-500/20 text-amber-400"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className="flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ユーザー情報 */}
      <div className="border-t border-white/10 p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <div className="text-sm font-medium">{user.name}</div>
            <div className="text-[11px] text-white/50">{ROLE_LABELS[user.role]}</div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              logout();
              window.location.href = "/login";
            }}
            className="flex items-center gap-2 px-2 py-1.5 text-white/50 hover:text-red-400 transition-colors text-sm rounded"
            title="ログアウト"
          >
            <LogOut size={16} />
            {!collapsed && <span>ログアウト</span>}
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-1.5 text-white/50 hover:text-white transition-colors rounded"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>
      </div>
    </aside>
  );
}
