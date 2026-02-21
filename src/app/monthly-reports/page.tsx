"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, DEMO_STORES } from "@/lib/auth";
import { canViewMonthlyReports } from "@/lib/auth";
import { DEMO_MONTHLY_REPORTS } from "@/lib/demo-data";
import { User } from "@/types";
import { BarChart3, Store, TrendingUp, TrendingDown, FileDown, Lock } from "lucide-react";

export default function MonthlyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(1);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  if (!canViewMonthlyReports(user.role)) {
    return (
      <div>
        <Header title="月次報告" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Lock size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">この機能は執行役員以上のみ閲覧可能です</p>
          </div>
        </div>
      </div>
    );
  }

  const reports = DEMO_MONTHLY_REPORTS.filter(
    (r) => r.year === selectedYear && r.month === selectedMonth
  );

  const totalRevenue = reports.reduce((s, r) => s + r.revenue, 0);
  const totalExpenses = reports.reduce((s, r) => s + r.expenses, 0);
  const totalProfit = reports.reduce((s, r) => s + r.profit, 0);
  const totalCustomers = reports.reduce((s, r) => s + r.customerCount, 0);

  return (
    <div>
      <Header title="月次報告" />
      <div className="p-6">
        {/* 月選択 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700"
            >
              <option value={2026}>2026年</option>
              <option value={2025}>2025年</option>
            </select>
            <div className="flex gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    selectedMonth === m
                      ? "bg-amber-500 text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 全店合計 */}
        <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-xl p-6 mb-6 text-white">
          <h3 className="text-sm text-white/60 mb-4">
            {selectedYear}年{selectedMonth}月 全店舗合計
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold">¥{(totalRevenue / 10000).toFixed(0)}万</div>
              <div className="text-xs text-white/50 mt-1">売上</div>
            </div>
            <div>
              <div className="text-2xl font-bold">¥{(totalExpenses / 10000).toFixed(0)}万</div>
              <div className="text-xs text-white/50 mt-1">経費</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${totalProfit > 0 ? "text-green-400" : "text-red-400"}`}>
                ¥{(totalProfit / 10000).toFixed(0)}万
              </div>
              <div className="text-xs text-white/50 mt-1">利益</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{totalCustomers.toLocaleString()}</div>
              <div className="text-xs text-white/50 mt-1">来客数</div>
            </div>
          </div>
        </div>

        {/* 各店舗レポート */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store size={16} className="text-amber-500" />
                  <h4 className="font-bold text-gray-800">{report.storeName}</h4>
                </div>
                <button className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                  <FileDown size={12} />
                  PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-lg font-bold text-blue-700">¥{(report.revenue / 10000).toFixed(0)}万</div>
                  <div className="text-[10px] text-blue-500">売上</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <div className={`text-lg font-bold ${report.profit > 0 ? "text-green-700" : "text-red-700"}`}>
                    ¥{(report.profit / 10000).toFixed(0)}万
                  </div>
                  <div className="text-[10px] text-green-500">利益</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>来客数: {report.customerCount.toLocaleString()}組</span>
                <span>利益率: {((report.profit / report.revenue) * 100).toFixed(1)}%</span>
              </div>

              {report.snsReport && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-[10px] font-bold text-purple-600 mb-1">SNSレポート</div>
                  <p className="text-xs text-gray-500">{report.snsReport}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
