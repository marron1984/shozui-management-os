"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, DEMO_STORES } from "@/lib/auth";
import { DEMO_DAILY_REPORTS } from "@/lib/demo-data";
import { User, DailyReport } from "@/types";
import { FileText, Store, Camera, Filter, Calendar, ChevronDown, FolderOpen } from "lucide-react";

export default function DailyReportsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-02-22");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const filteredReports = DEMO_DAILY_REPORTS.filter((r) => {
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    if (selectedDate && r.date !== selectedDate) return false;
    return true;
  });

  // フォルダ構造の計算
  const folders = Array.from(new Set(DEMO_DAILY_REPORTS.map((r) => r.folder)));

  return (
    <div>
      <Header title="日報管理" />
      <div className="p-6">
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-600">フィルター:</span>
            </div>
            <div className="flex items-center gap-2">
              <Store size={14} className="text-gray-400" />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="all">全店舗</option>
                {DEMO_STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* フォルダツリー */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <FolderOpen size={16} className="text-amber-500" />
              フォルダ
            </h3>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-gray-600 pl-2">2026年</div>
              <div className="pl-6 space-y-0.5">
                <div className="text-gray-500 font-medium">2月</div>
                <div className="pl-4 space-y-0.5">
                  {["22", "21", "20", "19", "18"].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(`2026-02-${day}`)}
                      className={`block w-full text-left px-2 py-1 rounded text-xs ${
                        selectedDate === `2026-02-${day}`
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-400 hover:bg-gray-50"
                      }`}
                    >
                      {day}日
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 日報一覧 */}
          <div className="lg:col-span-3 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <FileText size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400">該当する日報がありません</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <button
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Store size={18} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium text-sm text-gray-800">{report.storeName}</div>
                        <div className="text-xs text-gray-400">{report.date} | 提出: {new Date(report.submittedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(report.hallPhotos.length + report.kitchenPhotos.length) > 0 && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Camera size={12} /> {report.hallPhotos.length + report.kitchenPhotos.length}
                        </span>
                      )}
                      <ChevronDown size={16} className={`text-gray-400 transition-transform ${expandedReport === report.id ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {expandedReport === report.id && (
                    <div className="border-t border-gray-100 p-4 space-y-4">
                      <div>
                        <h4 className="text-xs font-bold text-blue-600 mb-2 uppercase tracking-wider">ホール側日報</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{report.hallReport}</p>
                        {report.hallPhotos.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {report.hallPhotos.map((_, i) => (
                              <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Camera size={16} className="text-gray-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-green-600 mb-2 uppercase tracking-wider">厨房側日報</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{report.kitchenReport}</p>
                        {report.kitchenPhotos.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {report.kitchenPhotos.map((_, i) => (
                              <div key={i} className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Camera size={16} className="text-gray-400" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 pt-2 border-t border-gray-100">
                        保存先: /{report.folder}/
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
