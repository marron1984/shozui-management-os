"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_STORES } from "@/lib/auth";
import {
  DEMO_DAILY_REPORTS,
  DEMO_MONTHLY_REPORTS,
  DEMO_APPROVAL_REQUESTS,
  DEMO_RESERVATIONS,
  DEMO_SUGGESTIONS,
} from "@/lib/demo-data";
import {
  FileText,
  ClipboardCheck,
  CalendarCheck,
  TrendingUp,
  AlertCircle,
  Store,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { User } from "@/types";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const now = new Date();
  const today = now.toISOString().split("T")[0];
  // デモデータは2026-02-22固定なので、デモ用にフォールバック
  const demoToday = "2026-02-22";
  const todayReports = DEMO_DAILY_REPORTS.filter((r) => r.date === today || r.date === demoToday);
  const pendingApprovals = DEMO_APPROVAL_REQUESTS.filter((a) => a.status === "pending");
  const todayReservations = DEMO_RESERVATIONS.filter((r) => r.date === today || r.date === demoToday);

  const totalRevenue = DEMO_MONTHLY_REPORTS.filter((r) => r.year === 2026 && r.month === 1).reduce(
    (sum, r) => sum + r.revenue,
    0
  );
  const totalProfit = DEMO_MONTHLY_REPORTS.filter((r) => r.year === 2026 && r.month === 1).reduce(
    (sum, r) => sum + r.profit,
    0
  );

  const statCards = [
    {
      label: "本日の日報",
      value: `${todayReports.length} / ${DEMO_STORES.length}`,
      sub: "店舗提出済み",
      icon: FileText,
      href: "/daily-reports",
    },
    {
      label: "未決済の稟議",
      value: pendingApprovals.length.toString(),
      sub: "件の承認待ち",
      icon: ClipboardCheck,
      href: "/approval",
    },
    {
      label: "本日の予約",
      value: todayReservations.length.toString(),
      sub: `組（計${todayReservations.reduce((s, r) => s + r.guestCount, 0)}名）`,
      icon: CalendarCheck,
      href: "/reservations",
    },
    {
      label: "月間売上（1月）",
      value: `¥${(totalRevenue / 10000).toFixed(0)}万`,
      sub: `利益 ¥${(totalProfit / 10000).toFixed(0)}万`,
      icon: TrendingUp,
      href: "/monthly-reports",
    },
  ];

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="ダッシュボード" />
      <div className="p-8">
        {/* 挨拶 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-[#2d2d2d] tracking-wider">
            おはようございます、{user.name}さん
          </h2>
          <p className="text-xs text-[#8a8a8a] mt-1.5 tracking-wider">
            {now.toLocaleDateString("ja-JP", {
              year: "numeric",
              month: "long",
              day: "numeric",
              weekday: "long",
            })}
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white border border-[#e0dbd2] rounded-sm p-5 hover:border-[#c4a265]/40 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[11px] text-[#8a8a8a] tracking-[0.15em]">{card.label}</div>
                  <div className="text-2xl font-light text-[#2d2d2d] mt-2 tracking-wider">{card.value}</div>
                  <div className="text-[10px] text-[#8a8a8a]/70 mt-1 tracking-wider">{card.sub}</div>
                </div>
                <div className="w-9 h-9 rounded-sm bg-[#c4a265]/[0.08] flex items-center justify-center group-hover:bg-[#c4a265]/[0.15] transition-colors duration-300">
                  <card.icon size={16} className="text-[#c4a265]" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 本日の日報 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm">
            <div className="p-4 border-b border-[#e0dbd2] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#2d2d2d] flex items-center gap-2 tracking-wider">
                <FileText size={15} className="text-[#c4a265]" strokeWidth={1.5} />
                本日の日報
              </h3>
              <Link href="/daily-reports" className="text-[10px] text-[#c4a265] hover:text-[#b8860b] tracking-wider transition-colors duration-300">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-[#eae6df]">
              {todayReports.map((report) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Store size={13} className="text-[#8a8a8a]" strokeWidth={1.5} />
                      <span className="text-sm text-[#2d2d2d] tracking-wider">{report.storeName}</span>
                    </div>
                    <span className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
                      {new Date(report.submittedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-[#8a8a8a] line-clamp-2 leading-relaxed">{report.hallReport}</p>
                </div>
              ))}
              {DEMO_STORES.filter((s) => !todayReports.find((r) => r.storeId === s.id)).map((store) => (
                <div key={store.id} className="p-4 bg-red-50/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={13} className="text-red-400/70" strokeWidth={1.5} />
                    <span className="text-sm text-red-600/70 tracking-wider">{store.name}</span>
                    <span className="text-[10px] text-red-400/60 ml-auto tracking-wider">未提出</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 稟議書 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm">
            <div className="p-4 border-b border-[#e0dbd2] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#2d2d2d] flex items-center gap-2 tracking-wider">
                <ClipboardCheck size={15} className="text-[#c4a265]" strokeWidth={1.5} />
                稟議書
              </h3>
              <Link href="/approval" className="text-[10px] text-[#c4a265] hover:text-[#b8860b] tracking-wider transition-colors duration-300">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-[#eae6df]">
              {DEMO_APPROVAL_REQUESTS.map((req) => (
                <div key={req.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#2d2d2d] tracking-wider">{req.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${
                        req.status === "pending"
                          ? "bg-[#c4a265]/10 text-[#c4a265]"
                          : req.status === "approved"
                          ? "bg-green-50 text-green-700/70"
                          : "bg-red-50 text-red-600/70"
                      }`}
                    >
                      {req.status === "pending" ? "承認待ち" : req.status === "approved" ? "承認済み" : "却下"}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    {req.storeName} | {req.requestedByName} | ¥{req.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 意見・提案 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm">
            <div className="p-4 border-b border-[#e0dbd2] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#2d2d2d] flex items-center gap-2 tracking-wider">
                <MessageSquare size={15} className="text-[#c4a265]" strokeWidth={1.5} />
                意見・提案
              </h3>
              <Link href="/employees" className="text-[10px] text-[#c4a265] hover:text-[#b8860b] tracking-wider transition-colors duration-300">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-[#eae6df]">
              {DEMO_SUGGESTIONS.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#2d2d2d] tracking-wider">{s.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${
                        s.status === "new" ? "bg-blue-50 text-blue-600/70" : "bg-green-50 text-green-700/70"
                      }`}
                    >
                      {s.status === "new" ? "新規" : "対応済み"}
                    </span>
                  </div>
                  <div className="text-xs text-[#8a8a8a] line-clamp-1">{s.content}</div>
                  <div className="text-[10px] text-[#8a8a8a]/60 mt-1 tracking-wider">
                    {s.employeeName} | {s.storeName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 本日の予約 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm">
            <div className="p-4 border-b border-[#e0dbd2] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[#2d2d2d] flex items-center gap-2 tracking-wider">
                <CalendarCheck size={15} className="text-[#c4a265]" strokeWidth={1.5} />
                本日の予約状況
              </h3>
              <Link href="/reservations" className="text-[10px] text-[#c4a265] hover:text-[#b8860b] tracking-wider transition-colors duration-300">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-[#eae6df]">
              {todayReservations.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-[#2d2d2d] tracking-wider">
                      {r.time} - {r.guestName}
                    </span>
                    <span className="text-[10px] text-[#8a8a8a] tracking-wider">{r.guestCount}名</span>
                  </div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    {r.storeName}
                    {r.tableNumber && ` | ${r.tableNumber}`}
                  </div>
                  {r.specialRequest && (
                    <div className="text-[10px] text-[#c4a265] mt-1 tracking-wider">{r.specialRequest}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
