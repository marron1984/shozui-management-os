"use client";

import { Bell, Menu } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { ROLE_LABELS, Notification } from "@/types";

interface HeaderProps {
  title: string;
  onMobileMenuOpen?: () => void;
}

export default function Header({ title, onMobileMenuOpen }: HeaderProps) {
  const user = getCurrentUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // localStorageから通知を読み込み
  useEffect(() => {
    try {
      const stored = localStorage.getItem("shozui_notifications");
      if (stored) {
        setNotifications(JSON.parse(stored));
      } else {
        setNotifications([...DEMO_NOTIFICATIONS]);
      }
    } catch {
      setNotifications([...DEMO_NOTIFICATIONS]);
    }
  }, []);

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  if (!user) return null;

  const userNotifications = notifications.filter((n) => n.userId === user.id);
  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleMarkRead = (id: string) => {
    const updated = notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem("shozui_notifications", JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) =>
      n.userId === user.id ? { ...n, read: true } : n
    );
    setNotifications(updated);
    try {
      localStorage.setItem("shozui_notifications", JSON.stringify(updated));
    } catch { /* ignore */ }
  };

  return (
    <header className="h-14 bg-[#fafaf7] border-b border-[#e0dbd2] flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
      <div className="flex items-center gap-3">
        {/* モバイル: ハンバーガーメニュー */}
        {onMobileMenuOpen && (
          <button
            onClick={onMobileMenuOpen}
            className="p-1.5 text-[#8a8a8a] hover:text-[#4a4a4a] transition-colors duration-300 lg:hidden"
          >
            <Menu size={20} strokeWidth={1.5} />
          </button>
        )}
        <h1 className="text-sm lg:text-base font-medium text-[#2d2d2d] tracking-[0.1em]">{title}</h1>
      </div>
      <div className="flex items-center gap-3 lg:gap-5">
        {/* 通知 */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-[#8a8a8a] hover:text-[#4a4a4a] transition-colors duration-300"
          >
            <Bell size={18} strokeWidth={1.5} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#c4a265] text-white text-[9px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-11 w-[calc(100vw-2rem)] max-w-80 bg-[#fafaf7] rounded-sm shadow-lg border border-[#e0dbd2] max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-[#e0dbd2] flex items-center justify-between">
                <span className="text-xs text-[#8a8a8a] tracking-wider">
                  通知 ({unreadCount}件の未読)
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[10px] text-[#c4a265] hover:text-[#b8860b] tracking-wider transition-colors duration-300"
                  >
                    すべて既読
                  </button>
                )}
              </div>
              {userNotifications.length === 0 ? (
                <div className="p-6 text-xs text-[#8a8a8a] text-center tracking-wider">通知はありません</div>
              ) : (
                userNotifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link}
                    onClick={() => handleMarkRead(n.id)}
                    className={`block p-3 border-b border-[#eae6df] hover:bg-[#f5f3ee] transition-colors duration-300 ${
                      !n.read ? "bg-[#c4a265]/[0.04]" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c4a265] flex-shrink-0" />
                      )}
                      <div className="text-xs font-medium text-[#2d2d2d] tracking-wider">{n.title}</div>
                    </div>
                    <div className="text-[11px] text-[#8a8a8a] mt-0.5">{n.message}</div>
                    <div className="text-[9px] text-[#8a8a8a]/60 mt-1">
                      {new Date(n.createdAt).toLocaleString("ja-JP")}
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* ユーザー */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-[#c4a265]/30 bg-[#1a1a1a] flex items-center justify-center text-[#c4a265] text-[11px] font-medium">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:block">
            <div className="text-xs text-[#2d2d2d] tracking-wider">{user.name}</div>
            <div className="text-[9px] text-[#8a8a8a] tracking-wider">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
