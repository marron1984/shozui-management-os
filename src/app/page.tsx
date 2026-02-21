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
  DEMO_NOTIFICATIONS,
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

  const today = "2026-02-22";
  const todayReports = DEMO_DAILY_REPORTS.filter((r) => r.date === today);
  const pendingApprovals = DEMO_APPROVAL_REQUESTS.filter((a) => a.status === "pending");
  const todayReservations = DEMO_RESERVATIONS.filter((r) => r.date === today);

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
      color: "from-blue-500 to-blue-600",
      href: "/daily-reports",
    },
    {
      label: "未決済の稟議",
      value: pendingApprovals.length.toString(),
      sub: "件の承認待ち",
      icon: ClipboardCheck,
      color: "from-orange-500 to-orange-600",
      href: "/approval",
    },
    {
      label: "本日の予約",
      value: todayReservations.length.toString(),
      sub: `組（計${todayReservations.reduce((s, r) => s + r.guestCount, 0)}名）`,
      icon: CalendarCheck,
      color: "from-green-500 to-green-600",
      href: "/reservations",
    },
    {
      label: "月間売上（1月）",
      value: `¥${(totalRevenue / 10000).toFixed(0)}万`,
      sub: `利益 ¥${(totalProfit / 10000).toFixed(0)}万`,
      icon: TrendingUp,
      color: "from-purple-500 to-purple-600",
      href: "/monthly-reports",
    },
  ];

  return (
    <div>
      <Header title="ダッシュボード" />
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            おはようございます、{user.name}さん
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            2026年2月22日（日曜日）
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statCards.map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-gray-500">{card.label}</div>
                  <div className="text-2xl font-bold text-gray-800 mt-1">{card.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{card.sub}</div>
                </div>
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}
                >
                  <card.icon size={20} className="text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 本日の日報 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <FileText size={18} className="text-blue-500" />
                本日の日報
              </h3>
              <Link href="/daily-reports" className="text-xs text-amber-600 hover:text-amber-700">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {todayReports.map((report) => (
                <div key={report.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-gray-400" />
                      <span className="font-medium text-sm text-gray-700">{report.storeName}</span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {new Date(report.submittedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">{report.hallReport}</p>
                </div>
              ))}
              {DEMO_STORES.filter((s) => !todayReports.find((r) => r.storeId === s.id)).map((store) => (
                <div key={store.id} className="p-4 bg-red-50/30">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-red-400" />
                    <span className="text-sm text-red-600">{store.name}</span>
                    <span className="text-xs text-red-400 ml-auto">未提出</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 稟議書 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <ClipboardCheck size={18} className="text-orange-500" />
                稟議書
              </h3>
              <Link href="/approval" className="text-xs text-amber-600 hover:text-amber-700">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {DEMO_APPROVAL_REQUESTS.map((req) => (
                <div key={req.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-700">{req.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        req.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : req.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {req.status === "pending" ? "承認待ち" : req.status === "approved" ? "承認済み" : "却下"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {req.storeName} | {req.requestedByName} | ¥{req.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 意見・提案 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <MessageSquare size={18} className="text-teal-500" />
                意見・提案
              </h3>
              <Link href="/employees" className="text-xs text-amber-600 hover:text-amber-700">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {DEMO_SUGGESTIONS.map((s) => (
                <div key={s.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-700">{s.title}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        s.status === "new" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {s.status === "new" ? "新規" : "対応済み"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 line-clamp-1">{s.content}</div>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {s.employeeName} | {s.storeName}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 本日の予約 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <CalendarCheck size={18} className="text-green-500" />
                本日の予約状況
              </h3>
              <Link href="/reservations" className="text-xs text-amber-600 hover:text-amber-700">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {todayReservations.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm text-gray-700">
                      {r.time} - {r.guestName}
                    </span>
                    <span className="text-xs text-gray-400">{r.guestCount}名</span>
                  </div>
                  <div className="text-xs text-gray-400">
                    {r.storeName}
                    {r.tableNumber && ` | ${r.tableNumber}`}
                  </div>
                  {r.specialRequest && (
                    <div className="text-[10px] text-amber-600 mt-1">{r.specialRequest}</div>
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
