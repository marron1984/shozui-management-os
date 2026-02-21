"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, canViewCashFlow } from "@/lib/auth";
import { DEMO_CASHFLOW } from "@/lib/demo-data";
import { User } from "@/types";
import { TrendingUp, TrendingDown, ArrowRight, Lock } from "lucide-react";

export default function FinancePage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  if (!canViewCashFlow(user.role)) {
    return (
      <div className="bg-[#fafaf7] min-h-screen">
        <Header title="資金繰り" onMobileMenuOpen={openMobileMenu} />
        <div className="p-4 lg:p-8">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
            <Lock size={36} className="mx-auto text-[#e0dbd2] mb-3" strokeWidth={1} />
            <p className="text-xs text-[#8a8a8a] tracking-wider">この機能は社長・経理のみ閲覧可能です</p>
          </div>
        </div>
      </div>
    );
  }

  const cashflow = DEMO_CASHFLOW[0];

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="資金繰り" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* サマリー */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-5 mb-6">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-5">
            <div className="text-[11px] text-[#8a8a8a] mb-1 tracking-[0.15em]">月初残高</div>
            <div className="text-xl font-light text-[#2d2d2d] tracking-wider">¥{(cashflow.openingBalance / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-5">
            <div className="text-[11px] text-[#8a8a8a] mb-1 flex items-center gap-1 tracking-[0.15em]">
              <TrendingUp size={12} className="text-green-600/60" strokeWidth={1.5} />
              収入
            </div>
            <div className="text-xl font-light text-green-700/70 tracking-wider">+¥{(cashflow.income / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-5">
            <div className="text-[11px] text-[#8a8a8a] mb-1 flex items-center gap-1 tracking-[0.15em]">
              <TrendingDown size={12} className="text-red-500/60" strokeWidth={1.5} />
              支出
            </div>
            <div className="text-xl font-light text-red-600/70 tracking-wider">-¥{(cashflow.expenses / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-[#1a1a1a] rounded-sm p-5">
            <div className="text-[11px] text-white/40 mb-1 tracking-[0.15em]">月末残高（見込）</div>
            <div className="text-xl font-light text-[#c4a265] tracking-wider">¥{(cashflow.closingBalance / 10000).toFixed(0)}万</div>
          </div>
        </div>

        {/* フロー図 */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-6 mb-6">
          <h3 className="text-sm text-[#2d2d2d] mb-5 tracking-wider">
            {cashflow.year}年{cashflow.month}月 資金繰りフロー
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 lg:gap-6 py-4 lg:py-6">
            <div className="text-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-[#e0dbd2] flex items-center justify-center mb-2 bg-[#fafaf7]">
                <div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">月初</div>
                  <div className="text-sm font-light text-[#2d2d2d] tracking-wider">¥{(cashflow.openingBalance / 10000).toFixed(0)}万</div>
                </div>
              </div>
            </div>
            <ArrowRight size={20} className="text-[#e0dbd2]" strokeWidth={1.5} />
            <div className="text-center">
              <div className="text-green-700/70 text-xs tracking-wider mb-1">+¥{(cashflow.income / 10000).toFixed(0)}万</div>
              <div className="text-red-600/70 text-xs tracking-wider">-¥{(cashflow.expenses / 10000).toFixed(0)}万</div>
            </div>
            <ArrowRight size={20} className="text-[#e0dbd2]" strokeWidth={1.5} />
            <div className="text-center">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-[#c4a265]/30 flex items-center justify-center mb-2 bg-[#c4a265]/[0.04]">
                <div>
                  <div className="text-[10px] text-[#c4a265] tracking-wider">月末</div>
                  <div className="text-sm font-light text-[#c4a265] tracking-wider">¥{(cashflow.closingBalance / 10000).toFixed(0)}万</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 明細 */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm">
          <div className="p-4 border-b border-[#e0dbd2]">
            <h3 className="text-sm text-[#2d2d2d] tracking-wider">明細</h3>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#eae6df] text-[10px] text-[#8a8a8a] tracking-[0.15em]">
                <th className="text-left p-3 font-normal">カテゴリ</th>
                <th className="text-left p-3 font-normal">説明</th>
                <th className="text-left p-3 font-normal">日付</th>
                <th className="text-right p-3 font-normal">金額</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.details.map((d, i) => (
                <tr key={i} className="border-b border-[#eae6df]/50 hover:bg-[#f5f3ee] transition-colors duration-300">
                  <td className="p-3 text-xs text-[#2d2d2d] tracking-wider">{d.category}</td>
                  <td className="p-3 text-xs text-[#8a8a8a]">{d.description}</td>
                  <td className="p-3 text-xs text-[#8a8a8a]/70 tracking-wider">{d.date}</td>
                  <td className={`p-3 text-xs text-right tracking-wider ${d.amount > 0 ? "text-green-700/70" : "text-red-600/70"}`}>
                    {d.amount > 0 ? "+" : ""}¥{Math.abs(d.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="p-3 text-[10px] text-[#8a8a8a]/50 border-t border-[#eae6df] tracking-wider">
            最終更新: {new Date(cashflow.updatedAt).toLocaleString("ja-JP")} | 更新者: 木村 健一（経理）
          </div>
        </div>
      </div>
    </div>
  );
}
