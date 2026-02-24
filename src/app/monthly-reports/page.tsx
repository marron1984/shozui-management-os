"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser } from "@/lib/auth";
import { canViewMonthlyReports } from "@/lib/auth";
import { DEMO_MONTHLY_REPORTS } from "@/lib/demo-data";
import { User, MonthlyReport } from "@/types";
import { Store, FileDown, Lock, Printer } from "lucide-react";

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

  const handlePrintReport = (report: MonthlyReport) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8"/>
        <title>${report.storeName} - ${report.year}年${report.month}月 月次報告</title>
        <style>
          body { font-family: 'Noto Serif JP', serif; padding: 40px; color: #2d2d2d; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 18px; font-weight: 500; border-bottom: 2px solid #c4a265; padding-bottom: 8px; margin-bottom: 24px; }
          h2 { font-size: 14px; font-weight: 500; color: #c4a265; margin: 20px 0 10px; }
          .meta { font-size: 11px; color: #8a8a8a; margin-bottom: 20px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
          .card { border: 1px solid #e0dbd2; padding: 16px; border-radius: 2px; }
          .card .value { font-size: 20px; font-weight: 300; }
          .card .label { font-size: 10px; color: #8a8a8a; margin-top: 4px; letter-spacing: 0.15em; }
          .profit-positive { color: #2d7a2d; }
          .profit-negative { color: #c94040; }
          .sns { background: #fafaf7; border: 1px solid #eae6df; padding: 12px; border-radius: 2px; font-size: 12px; line-height: 1.8; color: #4a4a4a; }
          .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e0dbd2; font-size: 10px; color: #8a8a8a; text-align: right; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>月次報告書 - ${report.storeName}</h1>
        <div class="meta">${report.year}年${report.month}月 | 株式会社祥瑞</div>
        <div class="grid">
          <div class="card">
            <div class="value">¥${(report.revenue / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
            <div class="label">売上</div>
          </div>
          <div class="card">
            <div class="value">¥${(report.expenses / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
            <div class="label">経費</div>
          </div>
          <div class="card">
            <div class="value ${report.profit > 0 ? "profit-positive" : "profit-negative"}">¥${(report.profit / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
            <div class="label">利益</div>
          </div>
          <div class="card">
            <div class="value">${report.customerCount.toLocaleString()}組</div>
            <div class="label">来客数</div>
          </div>
        </div>
        <div class="grid" style="grid-template-columns: 1fr;">
          <div class="card">
            <div class="value">${((report.profit / report.revenue) * 100).toFixed(1)}%</div>
            <div class="label">利益率</div>
          </div>
        </div>
        ${report.snsReport ? `<h2>SNSレポート</h2><div class="sns">${report.snsReport}</div>` : ""}
        <div class="footer">出力日: ${new Date().toLocaleDateString("ja-JP")} | 祥瑞マネジメントOS</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

  const handlePrintAll = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const reportsHtml = reports.map((r) => `
      <div style="page-break-inside: avoid; margin-bottom: 32px;">
        <h2 style="font-size:14px; color:#c4a265; margin-bottom:12px;">${r.storeName}</h2>
        <div class="grid">
          <div class="card"><div class="value">¥${(r.revenue / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div><div class="label">売上</div></div>
          <div class="card"><div class="value ${r.profit > 0 ? "profit-positive" : "profit-negative"}">¥${(r.profit / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div><div class="label">利益</div></div>
          <div class="card"><div class="value">${r.customerCount.toLocaleString()}組</div><div class="label">来客数</div></div>
          <div class="card"><div class="value">${((r.profit / r.revenue) * 100).toFixed(1)}%</div><div class="label">利益率</div></div>
        </div>
        ${r.snsReport ? `<div class="sns">${r.snsReport}</div>` : ""}
      </div>
    `).join("");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="ja">
      <head>
        <meta charset="utf-8"/>
        <title>${selectedYear}年${selectedMonth}月 全店舗月次報告</title>
        <style>
          body { font-family: 'Noto Serif JP', serif; padding: 40px; color: #2d2d2d; max-width: 800px; margin: 0 auto; }
          h1 { font-size: 18px; font-weight: 500; border-bottom: 2px solid #c4a265; padding-bottom: 8px; margin-bottom: 8px; }
          .meta { font-size: 11px; color: #8a8a8a; margin-bottom: 24px; }
          .summary { background: #1a1a1a; color: white; padding: 24px; margin-bottom: 32px; border-radius: 2px; }
          .summary .value { font-size: 20px; font-weight: 300; color: #c4a265; }
          .summary .label { font-size: 10px; color: rgba(255,255,255,0.4); margin-top: 4px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
          .card { border: 1px solid #e0dbd2; padding: 12px; border-radius: 2px; }
          .card .value { font-size: 16px; font-weight: 300; }
          .card .label { font-size: 10px; color: #8a8a8a; margin-top: 4px; letter-spacing: 0.15em; }
          .profit-positive { color: #2d7a2d; }
          .profit-negative { color: #c94040; }
          .sns { background: #fafaf7; border: 1px solid #eae6df; padding: 12px; border-radius: 2px; font-size: 11px; line-height: 1.8; color: #4a4a4a; }
          .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e0dbd2; font-size: 10px; color: #8a8a8a; text-align: right; }
          @media print { body { padding: 20px; } .summary { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
        </style>
      </head>
      <body>
        <h1>${selectedYear}年${selectedMonth}月 全店舗月次報告</h1>
        <div class="meta">株式会社祥瑞</div>
        <div class="summary">
          <div class="grid">
            <div><div class="value">¥${(totalRevenue / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div><div class="label">売上合計</div></div>
            <div><div class="value">¥${(totalProfit / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div><div class="label">利益合計</div></div>
          </div>
        </div>
        ${reportsHtml}
        <div class="footer">出力日: ${new Date().toLocaleDateString("ja-JP")} | 祥瑞マネジメントOS</div>
      </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 300);
  };

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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider flex-shrink-0"
            >
              <option value={2026}>2026年</option>
              <option value={2025}>2025年</option>
            </select>
            <div className="w-full overflow-x-auto -mx-1 px-1">
              <div className="flex gap-1 min-w-max">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonth(m)}
                    className={`px-2.5 sm:px-3 py-1.5 text-[11px] rounded-sm transition-all duration-300 tracking-wider flex-shrink-0 ${
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
        </div>

        {/* 全店合計 */}
        <div className="bg-[#1a1a1a] rounded-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[11px] text-white/40 tracking-[0.2em]">
              {selectedYear}年{selectedMonth}月 全店舗合計
            </h3>
            {reports.length > 0 && (
              <button
                onClick={handlePrintAll}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a265]/20 text-[#c4a265] rounded-sm text-[10px] hover:bg-[#c4a265]/30 transition-colors duration-300 tracking-wider"
              >
                <Printer size={11} strokeWidth={1.5} />
                全店舗PDF
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-6">
            <div>
              <div className="text-2xl font-light text-[#c4a265] tracking-wider">¥{(totalRevenue / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">売上</div>
            </div>
            <div>
              <div className="text-2xl font-light text-white/70 tracking-wider">¥{(totalExpenses / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
              <div className="text-[10px] text-white/30 mt-1 tracking-[0.15em]">経費</div>
            </div>
            <div>
              <div className={`text-2xl font-light tracking-wider ${totalProfit > 0 ? "text-green-400/80" : "text-red-400/80"}`}>
                ¥{(totalProfit / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万
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
                <button
                  onClick={() => handlePrintReport(report)}
                  className="text-[10px] text-[#8a8a8a] hover:text-[#c4a265] flex items-center gap-1 transition-colors duration-300 tracking-wider"
                >
                  <FileDown size={11} strokeWidth={1.5} />
                  PDF
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                  <div className="text-lg font-light text-[#2d2d2d] tracking-wider">¥{(report.revenue / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万</div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">売上</div>
                </div>
                <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                  <div className={`text-lg font-light tracking-wider ${report.profit > 0 ? "text-green-700/70" : "text-red-700/70"}`}>
                    ¥{(report.profit / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 0 })}万
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
