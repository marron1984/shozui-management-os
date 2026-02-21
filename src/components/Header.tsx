"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { ROLE_LABELS } from "@/types";

export default function Header({ title }: { title: string }) {
  const user = getCurrentUser();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifications = DEMO_NOTIFICATIONS.filter((n) => n.userId === user?.id);
  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) return null;

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-40">
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>
      <div className="flex items-center gap-4">
        {/* 通知 */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
              <div className="p-3 border-b border-gray-100 font-medium text-sm text-gray-700">
                通知 ({unreadCount}件の未読)
              </div>
              {notifications.length === 0 ? (
                <div className="p-4 text-sm text-gray-400 text-center">通知はありません</div>
              ) : (
                notifications.map((n) => (
                  <a
                    key={n.id}
                    href={n.link}
                    className={`block p-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                      !n.read ? "bg-amber-50/50" : ""
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-700">{n.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-gray-400 mt-1">
                      {new Date(n.createdAt).toLocaleString("ja-JP")}
                    </div>
                  </a>
                ))
              )}
            </div>
          )}
        </div>

        {/* ユーザーアバター */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-700">{user.name}</div>
            <div className="text-[10px] text-gray-400">{ROLE_LABELS[user.role]}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
