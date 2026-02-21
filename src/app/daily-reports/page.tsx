"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, DEMO_STORES } from "@/lib/auth";
import { DEMO_DAILY_REPORTS } from "@/lib/demo-data";
import { User } from "@/types";
import { FileText, Store, Camera, Filter, Calendar, ChevronDown, FolderOpen } from "lucide-react";

export default function DailyReportsPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
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

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="日報管理" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* フィルター */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#8a8a8a]" strokeWidth={1.5} />
              <span className="text-[11px] text-[#8a8a8a] tracking-[0.15em]">フィルター</span>
            </div>
            <div className="flex items-center gap-2">
              <Store size={13} className="text-[#8a8a8a]" strokeWidth={1.5} />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
              >
                <option value="all">全店舗</option>
                {DEMO_STORES.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#8a8a8a]" strokeWidth={1.5} />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
              />
            </div>
          </div>
        </div>

        {/* フォルダツリー */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            <h3 className="text-[11px] text-[#2d2d2d] mb-3 flex items-center gap-2 tracking-[0.15em]">
              <FolderOpen size={14} className="text-[#c4a265]" strokeWidth={1.5} />
              フォルダ
            </h3>
            <div className="space-y-1 text-xs">
              <div className="text-[#2d2d2d] pl-2 tracking-wider">2026年</div>
              <div className="pl-6 space-y-0.5">
                <div className="text-[#8a8a8a] tracking-wider">2月</div>
                <div className="pl-4 space-y-0.5">
                  {["22", "21", "20", "19", "18"].map((day) => (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(`2026-02-${day}`)}
                      className={`block w-full text-left px-2 py-1 rounded-sm text-[11px] tracking-wider transition-colors duration-300 ${
                        selectedDate === `2026-02-${day}`
                          ? "bg-[#c4a265]/10 text-[#c4a265]"
                          : "text-[#8a8a8a]/60 hover:bg-[#f5f3ee]"
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
              <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
                <FileText size={36} className="mx-auto text-[#e0dbd2] mb-3" strokeWidth={1} />
                <p className="text-xs text-[#8a8a8a] tracking-wider">該当する日報がありません</p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div key={report.id} className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                    className="w-full p-4 flex items-center justify-between hover:bg-[#f5f3ee] transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm bg-[#c4a265]/[0.08] flex items-center justify-center">
                        <Store size={15} className="text-[#c4a265]" strokeWidth={1.5} />
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-[#2d2d2d] tracking-wider">{report.storeName}</div>
                        <div className="text-[10px] text-[#8a8a8a] tracking-wider">{report.date} | 提出: {new Date(report.submittedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(report.hallPhotos.length + report.kitchenPhotos.length) > 0 && (
                        <span className="text-[10px] text-[#8a8a8a] flex items-center gap-1 tracking-wider">
                          <Camera size={11} strokeWidth={1.5} /> {report.hallPhotos.length + report.kitchenPhotos.length}
                        </span>
                      )}
                      <ChevronDown size={14} className={`text-[#8a8a8a] transition-transform duration-300 ${expandedReport === report.id ? "rotate-180" : ""}`} strokeWidth={1.5} />
                    </div>
                  </button>

                  {expandedReport === report.id && (
                    <div className="border-t border-[#e0dbd2] p-5 space-y-5">
                      <div>
                        <h4 className="text-[10px] text-[#c4a265] mb-2 tracking-[0.2em]">ホール側日報</h4>
                        <p className="text-xs text-[#4a4a4a] leading-relaxed">{report.hallReport}</p>
                        {report.hallPhotos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {report.hallPhotos.map((_, i) => (
                              <div key={i} className="w-20 h-20 bg-[#f5f3ee] rounded-sm flex items-center justify-center border border-[#e0dbd2]">
                                <Camera size={14} className="text-[#8a8a8a]/40" strokeWidth={1.5} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-[10px] text-[#c4a265] mb-2 tracking-[0.2em]">厨房側日報</h4>
                        <p className="text-xs text-[#4a4a4a] leading-relaxed">{report.kitchenReport}</p>
                        {report.kitchenPhotos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {report.kitchenPhotos.map((_, i) => (
                              <div key={i} className="w-20 h-20 bg-[#f5f3ee] rounded-sm flex items-center justify-center border border-[#e0dbd2]">
                                <Camera size={14} className="text-[#8a8a8a]/40" strokeWidth={1.5} />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-[#8a8a8a]/50 pt-3 border-t border-[#eae6df] tracking-wider">
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
