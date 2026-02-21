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
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装飾 - 金箔の粒子 */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "radial-gradient(circle at 30% 20%, #c4a265 1px, transparent 1px), radial-gradient(circle at 70% 60%, #c4a265 1px, transparent 1px), radial-gradient(circle at 50% 80%, #c4a265 0.5px, transparent 0.5px)",
        backgroundSize: "120px 120px, 80px 80px, 60px 60px"
      }} />

      <div className="w-full max-w-md relative z-10">
        {/* ロゴ */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 mx-auto flex items-center justify-center mb-6 border border-[#c4a265]/30 rounded-sm bg-[#c4a265]/[0.04]">
            <span className="text-3xl text-[#c4a265] font-light tracking-widest">祥</span>
          </div>
          <h1 className="text-xl text-[#c4a265] tracking-[0.3em] font-light">祥瑞</h1>
          <div className="w-12 h-px bg-[#c4a265]/30 mx-auto my-3" />
          <p className="text-[10px] text-white/25 tracking-[0.3em]">MANAGEMENT OS</p>
        </div>

        {/* ログインカード */}
        <div className="bg-[#242424] border border-[#333] rounded-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-sm text-white/50 tracking-[0.2em] font-light">ログイン</h2>
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] text-white/30 mb-3 tracking-[0.15em]">
              ユーザーを選択してください
            </label>
            {DEMO_USERS.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUser(u.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-sm border transition-all duration-300 text-left ${
                  selectedUser === u.id
                    ? "border-[#c4a265]/50 bg-[#c4a265]/[0.06]"
                    : "border-[#333] hover:border-[#444] hover:bg-white/[0.02]"
                }`}
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 border ${
                  selectedUser === u.id
                    ? "border-[#c4a265]/40 text-[#c4a265] bg-[#c4a265]/10"
                    : "border-[#444] text-white/40 bg-transparent"
                }`}>
                  {u.name.charAt(0)}
                </div>
                <div>
                  <div className={`text-xs tracking-wider ${selectedUser === u.id ? "text-[#c4a265]" : "text-white/60"}`}>
                    {u.name}
                  </div>
                  <div className="text-[10px] text-white/25 tracking-wider">
                    {ROLE_LABELS[u.role]}
                    {u.storeId !== "all" && ` / ${u.position}`}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selectedUser}
            className="w-full mt-8 py-3 bg-[#c4a265] text-[#1a1a1a] text-xs tracking-[0.2em] font-medium rounded-sm transition-all duration-300 hover:bg-[#d4b275] disabled:opacity-20 disabled:cursor-not-allowed"
          >
            入 室
          </button>
        </div>

        <div className="text-center mt-8">
          <div className="w-8 h-px bg-[#c4a265]/20 mx-auto mb-3" />
          <p className="text-[9px] text-white/15 tracking-[0.2em]">
            &copy; 2026 株式会社祥瑞
          </p>
        </div>
      </div>
    </div>
  );
}
