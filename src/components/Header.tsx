"use client";

import { Bell } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { ROLE_LABELS } from "@/types";

export default function Header({ title }: { title: string }) {
  const user = getCurrentUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifications = DEMO_NOTIFICATIONS.filter((n) => n.userId === user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

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

  return (
    <header className="h-14 bg-[#fafaf7] border-b border-[#e0dbd2] flex items-center justify-between px-8 sticky top-0 z-40">
      <h1 className="text-base font-medium text-[#2d2d2d] tracking-[0.1em]">{title}</h1>
      <div className="flex items-center gap-5">
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
            <div className="absolute right-0 top-11 w-80 bg-[#fafaf7] rounded-sm shadow-lg border border-[#e0dbd2] max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-[#e0dbd2] text-xs text-[#8a8a8a] tracking-wider">
                通知 ({unreadCount}件の未読)
              </div>
              {notifications.length === 0 ? (
                <div className="p-6 text-xs text-[#8a8a8a] text-center tracking-wider">通知はありません</div>
              ) : (
                notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link}
                    className={`block p-3 border-b border-[#eae6df] hover:bg-[#f5f3ee] transition-colors duration-300 ${
                      !n.read ? "bg-[#c4a265]/[0.04]" : ""
                    }`}
                  >
                    <div className="text-xs font-medium text-[#2d2d2d] tracking-wider">{n.title}</div>
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
