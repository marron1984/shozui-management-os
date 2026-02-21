"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, login } from "@/lib/auth";
import { ROLE_LABELS } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState("");

  const handleLogin = () => {
    if (!selectedUser) return;
    const user = login(selectedUser);
    if (user) {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f3460] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-[#1a1a2e]">祥</span>
          </div>
          <h1 className="text-2xl font-bold text-white">祥瑞マネジメントOS</h1>
          <p className="text-white/50 text-sm mt-1">社内マネジメントプラットフォーム</p>
        </div>

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6">ログイン</h2>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              ユーザーを選択してください（デモ）
            </label>
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  selectedUser === u.id
                    ? "border-amber-500 bg-amber-50"
                    : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">{u.name}</div>
                  <div className="text-xs text-gray-400">
                    {ROLE_LABELS[u.role]}
                    {u.storeId !== "all" && ` | ${u.position}`}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full mt-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold rounded-lg transition-all hover:from-amber-600 hover:to-amber-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ログイン
          </button>
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          &copy; 2026 株式会社祥瑞 All rights reserved.
        </p>
      </div>
    </div>
  );
}
