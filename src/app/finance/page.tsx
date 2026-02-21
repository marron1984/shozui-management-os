"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, canViewCashFlow } from "@/lib/auth";
import { DEMO_CASHFLOW } from "@/lib/demo-data";
import { User } from "@/types";
import { Wallet, TrendingUp, TrendingDown, ArrowRight, Lock } from "lucide-react";

export default function FinancePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  if (!canViewCashFlow(user.role)) {
    return (
      <div>
        <Header title="資金繰り" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Lock size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">この機能は社長・経理のみ閲覧可能です</p>
          </div>
        </div>
      </div>
    );
  }

  const cashflow = DEMO_CASHFLOW[0];

  return (
    <div>
      <Header title="資金繰り" />
      <div className="p-6">
        {/* サマリー */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1">月初残高</div>
            <div className="text-xl font-bold text-gray-800">¥{(cashflow.openingBalance / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <TrendingUp size={14} className="text-green-500" />
              収入
            </div>
            <div className="text-xl font-bold text-green-600">+¥{(cashflow.income / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="text-sm text-gray-500 mb-1 flex items-center gap-1">
              <TrendingDown size={14} className="text-red-500" />
              支出
            </div>
            <div className="text-xl font-bold text-red-600">-¥{(cashflow.expenses / 10000).toFixed(0)}万</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl shadow-sm p-5 text-white">
            <div className="text-sm text-white/80 mb-1">月末残高（見込）</div>
            <div className="text-xl font-bold">¥{(cashflow.closingBalance / 10000).toFixed(0)}万</div>
          </div>
        </div>

        {/* フロー図 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">
            {cashflow.year}年{cashflow.month}月 資金繰りフロー
          </h3>
          <div className="flex items-center justify-center gap-4 py-4">
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mb-2">
                <div>
                  <div className="text-xs text-blue-500">月初</div>
                  <div className="text-sm font-bold text-blue-700">¥{(cashflow.openingBalance / 10000).toFixed(0)}万</div>
                </div>
              </div>
            </div>
            <ArrowRight size={24} className="text-gray-300" />
            <div className="text-center">
              <div className="text-green-600 text-sm font-bold mb-1">+¥{(cashflow.income / 10000).toFixed(0)}万</div>
              <div className="text-red-600 text-sm font-bold">-¥{(cashflow.expenses / 10000).toFixed(0)}万</div>
            </div>
            <ArrowRight size={24} className="text-gray-300" />
            <div className="text-center">
              <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                <div>
                  <div className="text-xs text-amber-500">月末</div>
                  <div className="text-sm font-bold text-amber-700">¥{(cashflow.closingBalance / 10000).toFixed(0)}万</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 明細 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-800">明細</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 text-xs text-gray-400 uppercase">
                <th className="text-left p-3">カテゴリ</th>
                <th className="text-left p-3">説明</th>
                <th className="text-left p-3">日付</th>
                <th className="text-right p-3">金額</th>
              </tr>
            </thead>
            <tbody>
              {cashflow.details.map((d, i) => (
                <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="p-3 text-sm text-gray-700">{d.category}</td>
                  <td className="p-3 text-sm text-gray-500">{d.description}</td>
                  <td className="p-3 text-sm text-gray-400">{d.date}</td>
                  <td className={`p-3 text-sm text-right font-medium ${d.amount > 0 ? "text-green-600" : "text-red-600"}`}>
                    {d.amount > 0 ? "+" : ""}¥{Math.abs(d.amount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-3 text-[10px] text-gray-400 border-t border-gray-100">
            最終更新: {new Date(cashflow.updatedAt).toLocaleString("ja-JP")} | 更新者: 木村 健一（経理）
          </div>
        </div>
      </div>
    </div>
  );
}
