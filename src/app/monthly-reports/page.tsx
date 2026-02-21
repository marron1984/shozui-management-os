"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser } from "@/lib/auth";
import { canViewMonthlyReports } from "@/lib/auth";
import { DEMO_MONTHLY_REPORTS } from "@/lib/demo-data";
import { User } from "@/types";
import { Store, FileDown, Lock } from "lucide-react";

export default function MonthlyReportsPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
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
      <div className="bg-[#fafaf7] min-h-screen">
        <Header title="月次報告" onMobileMenuOpen={openMobileMenu} />
        <div className="p-4 lg:p-8">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
            <Lock size={36} className="mx-auto text-[#e0dbd2] mb-3" strokeWidth={1} />
            <p className="text-xs text-[#8a8a8a] tracking-wider">この機能は執行役員以上のみ閲覧可能です</p>
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
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="月次報告" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* 月選択 */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
            >
              <option value={2026}>2026年</option>
              <option value={2025}>2025年</option>
            </select>
            <div className="flex gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3 py-1.5 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
                    selectedMonth === m
                      ? "bg-[#c4a265] text-white"
                      : "text-[#8a8a8a] hover:bg-[#f5f3ee]"
                  }`}
                >
                  {m}月
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 全店合計 */}
        <div className="bg-[#1a1a1a] rounded-sm p-6 mb-6">
          <h3 className="text-[11px] text-white/40 mb-5 tracking-[0.2em]">
            {selectedYear}年{selectedMonth}月 全店舗合計
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
            <div>
              <div className="text-2xl font-light text-[#c4a265] tracking-wider">¥{(totalRevenue / 10000).toFixed(0)}万</div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">売上</div>
            </div>
            <div>
              <div className="text-2xl font-light text-white/70 tracking-wider">¥{(totalExpenses / 10000).toFixed(0)}万</div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">経費</div>
            </div>
            <div>
              <div className={`text-2xl font-light tracking-wider ${totalProfit > 0 ? "text-green-400/80" : "text-red-400/80"}`}>
                ¥{(totalProfit / 10000).toFixed(0)}万
              </div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">利益</div>
            </div>
            <div>
              <div className="text-2xl font-light text-white/70 tracking-wider">{totalCustomers.toLocaleString()}</div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">来客数</div>
            </div>
          </div>
        </div>

        {/* 各店舗レポート */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {reports.map((report) => (
            <div key={report.id} className="bg-white border border-[#e0dbd2] rounded-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Store size={14} className="text-[#c4a265]" strokeWidth={1.5} />
                  <h4 className="text-sm text-[#2d2d2d] tracking-wider">{report.storeName}</h4>
                </div>
                <button className="text-[10px] text-[#8a8a8a] hover:text-[#c4a265] flex items-center gap-1 transition-colors duration-300 tracking-wider">
                  <FileDown size={11} strokeWidth={1.5} />
                  PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                  <div className="text-lg font-light text-[#2d2d2d] tracking-wider">¥{(report.revenue / 10000).toFixed(0)}万</div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">売上</div>
                </div>
                <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                  <div className={`text-lg font-light tracking-wider ${report.profit > 0 ? "text-green-700/70" : "text-red-700/70"}`}>
                    ¥{(report.profit / 10000).toFixed(0)}万
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">利益</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#8a8a8a] tracking-wider">
                <span>来客数: {report.customerCount.toLocaleString()}組</span>
                <span>利益率: {((report.profit / report.revenue) * 100).toFixed(1)}%</span>
              </div>

              {report.snsReport && (
                <div className="mt-4 pt-4 border-t border-[#eae6df]">
                  <div className="text-[10px] text-[#c4a265] mb-1 tracking-[0.15em]">SNSレポート</div>
                  <p className="text-xs text-[#8a8a8a] leading-relaxed">{report.snsReport}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
