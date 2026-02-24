"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, DEMO_STORES, DEMO_USERS } from "@/lib/auth";
import { DEMO_DAILY_REPORTS } from "@/lib/demo-data";
import { User } from "@/types";
import {
  FileText,
  Store,
  Camera,
  Filter,
  Calendar,
  ChevronDown,
  FolderOpen,
  AlertCircle,
  CheckCircle2,
  UserCircle,
  Clock,
  ImageIcon,
  Plus,
  X,
} from "lucide-react";
import { DailyReport } from "@/types";

// userId → 名前を引く
function getUserName(userId: string): string {
  const u = DEMO_USERS.find((user) => user.id === userId);
  return u ? u.name : userId;
}

// userId → 役職を引く
function getUserPosition(userId: string): string {
  const u = DEMO_USERS.find((user) => user.id === userId);
  return u ? u.position : "";
}

export default function DailyReportsPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedDate, setSelectedDate] = useState("2026-02-22");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [showFolderTree, setShowFolderTree] = useState(false);
  const [reports, setReports] = useState(DEMO_DAILY_REPORTS);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    storeId: "",
    date: new Date().toISOString().split("T")[0],
    hallReport: "",
    kitchenReport: "",
  });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user) return null;

  // フィルタリング
  const filteredReports = reports.filter((r) => {
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    if (selectedDate && r.date !== selectedDate) return false;
    return true;
  });

  // 当日の提出・未提出の店舗
  const todayReports = reports.filter(
    (r) => r.date === selectedDate
  );
  const submittedStoreIds = new Set(todayReports.map((r) => r.storeId));
  const submittedStores = DEMO_STORES.filter((s) =>
    submittedStoreIds.has(s.id)
  );
  const unsubmittedStores = DEMO_STORES.filter(
    (s) => !submittedStoreIds.has(s.id)
  );

  // 当日の写真総数
  const todayPhotoCount = todayReports.reduce(
    (sum, r) => sum + r.hallPhotos.length + r.kitchenPhotos.length,
    0
  );

  // フォルダツリー用：全日報の日付を抽出し、年月日でグルーピング
  const dateGroups: Record<string, Record<string, string[]>> = {};
  reports.forEach((r) => {
    const [year, month, day] = r.date.split("-");
    if (!dateGroups[year]) dateGroups[year] = {};
    if (!dateGroups[year][month]) dateGroups[year][month] = [];
    if (!dateGroups[year][month].includes(day)) {
      dateGroups[year][month].push(day);
    }
  });
  // 各月の日付を降順ソート
  Object.values(dateGroups).forEach((months) =>
    Object.values(months).forEach((days) =>
      days.sort((a, b) => Number(b) - Number(a))
    )
  );

  // 日付ごとの日報件数
  const countByDate = (date: string) =>
    reports.filter((r) => r.date === date).length;

  const handleNewReport = () => {
    if (!newForm.storeId || !newForm.hallReport.trim() || !newForm.kitchenReport.trim()) return;
    const store = DEMO_STORES.find((s) => s.id === newForm.storeId);
    const newReport: DailyReport = {
      id: `dr${Date.now()}`,
      storeId: newForm.storeId,
      storeName: store?.name || "",
      date: newForm.date,
      hallReport: newForm.hallReport.trim(),
      kitchenReport: newForm.kitchenReport.trim(),
      hallPhotos: [],
      kitchenPhotos: [],
      submittedBy: user.id,
      submittedAt: new Date().toISOString(),
      folder: `${newForm.date.replace(/-/g, "/")}/${store?.name || ""}`,
    };
    setReports([newReport, ...reports]);
    setSelectedDate(newForm.date);
    setShowNewModal(false);
    setNewForm({ storeId: user.storeId === "all" ? "" : user.storeId, date: new Date().toISOString().split("T")[0], hallReport: "", kitchenReport: "" });
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="日報管理" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* ── サマリーカード ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {/* 提出状況 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <CheckCircle2
                size={12}
                className="text-green-600/60"
                strokeWidth={1.5}
              />
              <span className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">
                提出状況
              </span>
            </div>
            <div className="text-xl font-light text-[#2d2d2d] tracking-wider">
              {submittedStores.length}
              <span className="text-[10px] text-[#8a8a8a] mx-0.5">/</span>
              {DEMO_STORES.length}
              <span className="text-[10px] text-[#8a8a8a] ml-1">店舗</span>
            </div>
            {unsubmittedStores.length === 0 ? (
              <div className="text-[10px] text-green-600/70 mt-0.5 tracking-wider">
                全店舗提出済み
              </div>
            ) : (
              <div className="text-[10px] text-red-500/70 mt-0.5 tracking-wider">
                {unsubmittedStores.length}店舗未提出
              </div>
            )}
          </div>

          {/* 日報件数 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <FileText
                size={12}
                className="text-[#c4a265]"
                strokeWidth={1.5}
              />
              <span className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">
                日報件数
              </span>
            </div>
            <div className="text-xl font-light text-[#2d2d2d] tracking-wider">
              {filteredReports.length}
              <span className="text-[10px] text-[#8a8a8a] ml-1">件</span>
            </div>
            <div className="text-[10px] text-[#8a8a8a]/60 mt-0.5 tracking-wider">
              {selectedStore === "all"
                ? "全店舗"
                : DEMO_STORES.find((s) => s.id === selectedStore)?.name}
              {" "}| {selectedDate}
            </div>
          </div>

          {/* 写真枚数 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <ImageIcon
                size={12}
                className="text-blue-500/60"
                strokeWidth={1.5}
              />
              <span className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">
                添付写真
              </span>
            </div>
            <div className="text-xl font-light text-[#2d2d2d] tracking-wider">
              {todayPhotoCount}
              <span className="text-[10px] text-[#8a8a8a] ml-1">枚</span>
            </div>
            <div className="text-[10px] text-[#8a8a8a]/60 mt-0.5 tracking-wider">
              ホール＋厨房
            </div>
          </div>

          {/* 選択日 */}
          <div className="bg-[#1a1a1a] rounded-sm p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <Calendar
                size={12}
                className="text-[#c4a265]/60"
                strokeWidth={1.5}
              />
              <span className="text-[10px] text-white/40 tracking-[0.15em]">
                表示日
              </span>
            </div>
            <div className="text-xl font-light text-[#c4a265] tracking-wider">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", {
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="text-[10px] text-white/30 mt-0.5 tracking-wider">
              {new Date(selectedDate + "T00:00:00").toLocaleDateString("ja-JP", {
                weekday: "long",
              })}
            </div>
          </div>
        </div>

        {/* ── 未提出店舗アラート ── */}
        {unsubmittedStores.length > 0 && (
          <div className="bg-red-50/50 border border-red-200/50 rounded-sm p-3 lg:p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle
                size={14}
                className="text-red-400"
                strokeWidth={1.5}
              />
              <span className="text-xs text-red-600/80 tracking-wider font-medium">
                未提出の店舗
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {unsubmittedStores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center gap-1.5 bg-white border border-red-200/50 rounded-sm px-3 py-1.5"
                >
                  <Store
                    size={12}
                    className="text-red-400/70"
                    strokeWidth={1.5}
                  />
                  <span className="text-xs text-red-600/70 tracking-wider">
                    {store.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── フィルター ── */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 justify-between">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter
                size={14}
                className="text-[#8a8a8a]"
                strokeWidth={1.5}
              />
              <span className="text-[11px] text-[#8a8a8a] tracking-[0.15em]">
                フィルター
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Store
                size={13}
                className="text-[#8a8a8a]"
                strokeWidth={1.5}
              />
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
              >
                <option value="all">全店舗</option>
                {DEMO_STORES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Calendar
                size={13}
                className="text-[#8a8a8a]"
                strokeWidth={1.5}
              />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
              />
            </div>
          </div>
            <button
              onClick={() => {
                setNewForm({ storeId: user.storeId === "all" ? "" : user.storeId, date: selectedDate || new Date().toISOString().split("T")[0], hallReport: "", kitchenReport: "" });
                setShowNewModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider flex-shrink-0"
            >
              <Plus size={14} strokeWidth={1.5} />
              日報作成
            </button>
          </div>
        </div>

        {/* ── メインコンテンツ ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
          {/* フォルダツリー */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            {/* スマホ: 折りたたみ式 */}
            <button
              onClick={() => setShowFolderTree(!showFolderTree)}
              className="w-full flex items-center justify-between lg:pointer-events-none"
            >
              <h3 className="text-[11px] text-[#2d2d2d] flex items-center gap-2 tracking-[0.15em]">
                <FolderOpen
                  size={14}
                  className="text-[#c4a265]"
                  strokeWidth={1.5}
                />
                フォルダ
              </h3>
              <ChevronDown
                size={14}
                className={`text-[#8a8a8a] transition-transform duration-300 lg:hidden ${
                  showFolderTree ? "rotate-180" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            <div
              className={`mt-3 space-y-1 text-xs ${
                showFolderTree ? "block" : "hidden lg:block"
              }`}
            >
              {Object.entries(dateGroups)
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([year, months]) => (
                  <div key={year}>
                    <div className="text-[#2d2d2d] pl-2 tracking-wider">
                      {year}年
                    </div>
                    <div className="pl-6 space-y-0.5">
                      {Object.entries(months)
                        .sort(([a], [b]) => b.localeCompare(a))
                        .map(([month, days]) => (
                          <div key={month}>
                            <div className="text-[#8a8a8a] tracking-wider">
                              {Number(month)}月
                            </div>
                            <div className="pl-4 space-y-0.5">
                              {days.map((day) => {
                                const dateStr = `${year}-${month}-${day}`;
                                const count = countByDate(dateStr);
                                return (
                                  <button
                                    key={day}
                                    onClick={() => {
                                      setSelectedDate(dateStr);
                                      setShowFolderTree(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2 py-1 rounded-sm text-[11px] tracking-wider transition-colors duration-300 ${
                                      selectedDate === dateStr
                                        ? "bg-[#c4a265]/10 text-[#c4a265]"
                                        : "text-[#8a8a8a]/60 hover:bg-[#f5f3ee]"
                                    }`}
                                  >
                                    <span>{Number(day)}日</span>
                                    <span
                                      className={`text-[9px] rounded-full px-1.5 py-0.5 leading-none ${
                                        selectedDate === dateStr
                                          ? "bg-[#c4a265]/20 text-[#c4a265]"
                                          : "bg-[#f5f3ee] text-[#8a8a8a]/50"
                                      }`}
                                    >
                                      {count}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* 日報一覧 */}
          <div className="lg:col-span-3 space-y-4">
            {filteredReports.length === 0 ? (
              <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
                <FileText
                  size={36}
                  className="mx-auto text-[#e0dbd2] mb-3"
                  strokeWidth={1}
                />
                <p className="text-xs text-[#8a8a8a] tracking-wider">
                  該当する日報がありません
                </p>
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedReport(
                        expandedReport === report.id ? null : report.id
                      )
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-[#f5f3ee] transition-colors duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-sm bg-[#c4a265]/[0.08] flex items-center justify-center">
                        <Store
                          size={15}
                          className="text-[#c4a265]"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="text-left">
                        <div className="text-sm text-[#2d2d2d] tracking-wider">
                          {report.storeName}
                        </div>
                        <div className="text-[10px] text-[#8a8a8a] tracking-wider flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="flex items-center gap-1">
                            <Clock size={9} strokeWidth={1.5} />
                            {new Date(report.submittedAt).toLocaleTimeString(
                              "ja-JP",
                              { hour: "2-digit", minute: "2-digit" }
                            )}
                          </span>
                          <span className="text-[#e0dbd2]">|</span>
                          <span className="flex items-center gap-1">
                            <UserCircle size={9} strokeWidth={1.5} />
                            {getUserName(report.submittedBy)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {report.hallPhotos.length +
                        report.kitchenPhotos.length >
                        0 && (
                        <span className="text-[10px] text-[#8a8a8a] flex items-center gap-1 tracking-wider">
                          <Camera size={11} strokeWidth={1.5} />{" "}
                          {report.hallPhotos.length +
                            report.kitchenPhotos.length}
                        </span>
                      )}
                      <ChevronDown
                        size={14}
                        className={`text-[#8a8a8a] transition-transform duration-300 ${
                          expandedReport === report.id ? "rotate-180" : ""
                        }`}
                        strokeWidth={1.5}
                      />
                    </div>
                  </button>

                  {expandedReport === report.id && (
                    <div className="border-t border-[#e0dbd2] p-5 space-y-5">
                      {/* 提出者情報 */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px] text-[#8a8a8a]/70 tracking-wider">
                        <UserCircle
                          size={12}
                          className="text-[#c4a265]/50"
                          strokeWidth={1.5}
                        />
                        <span>提出者: {getUserName(report.submittedBy)}</span>
                        <span className="text-[#e0dbd2]">|</span>
                        <span>{getUserPosition(report.submittedBy)}</span>
                        <span className="text-[#e0dbd2]">|</span>
                        <span>
                          {new Date(report.submittedAt).toLocaleString("ja-JP", {
                            month: "numeric",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      {/* ホール側日報 */}
                      <div>
                        <h4 className="text-[10px] text-[#c4a265] mb-2 tracking-[0.2em]">
                          ホール側日報
                        </h4>
                        <p className="text-xs text-[#4a4a4a] leading-relaxed">
                          {report.hallReport}
                        </p>
                        {report.hallPhotos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {report.hallPhotos.map((_, i) => (
                              <div
                                key={i}
                                className="w-20 h-20 bg-[#f5f3ee] rounded-sm flex items-center justify-center border border-[#e0dbd2]"
                              >
                                <Camera
                                  size={14}
                                  className="text-[#8a8a8a]/40"
                                  strokeWidth={1.5}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 厨房側日報 */}
                      <div>
                        <h4 className="text-[10px] text-[#c4a265] mb-2 tracking-[0.2em]">
                          厨房側日報
                        </h4>
                        <p className="text-xs text-[#4a4a4a] leading-relaxed">
                          {report.kitchenReport}
                        </p>
                        {report.kitchenPhotos.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {report.kitchenPhotos.map((_, i) => (
                              <div
                                key={i}
                                className="w-20 h-20 bg-[#f5f3ee] rounded-sm flex items-center justify-center border border-[#e0dbd2]"
                              >
                                <Camera
                                  size={14}
                                  className="text-[#8a8a8a]/40"
                                  strokeWidth={1.5}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 保存先 */}
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
        {/* 新規日報モーダル */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowNewModal(false)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">日報を作成</h3>
                  <button onClick={() => setShowNewModal(false)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">店舗 <span className="text-red-500/70">*</span></label>
                      <select
                        value={newForm.storeId}
                        onChange={(e) => setNewForm({ ...newForm, storeId: e.target.value })}
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      >
                        <option value="">選択してください</option>
                        {DEMO_STORES.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">日付 <span className="text-red-500/70">*</span></label>
                      <input
                        type="date"
                        value={newForm.date}
                        onChange={(e) => setNewForm({ ...newForm, date: e.target.value })}
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#c4a265] tracking-[0.2em]">ホール側日報 <span className="text-red-500/70">*</span></label>
                    <textarea
                      value={newForm.hallReport}
                      onChange={(e) => setNewForm({ ...newForm, hallReport: e.target.value })}
                      placeholder="ホール側の業務報告を入力してください..."
                      rows={4}
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider resize-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#c4a265] tracking-[0.2em]">厨房側日報 <span className="text-red-500/70">*</span></label>
                    <textarea
                      value={newForm.kitchenReport}
                      onChange={(e) => setNewForm({ ...newForm, kitchenReport: e.target.value })}
                      placeholder="厨房側の業務報告を入力してください..."
                      rows={4}
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleNewReport}
                      disabled={!newForm.storeId || !newForm.hallReport.trim() || !newForm.kitchenReport.trim()}
                      className="flex-1 py-2.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 tracking-wider"
                    >
                      提出する
                    </button>
                    <button
                      onClick={() => setShowNewModal(false)}
                      className="px-6 py-2.5 border border-[#e0dbd2] text-[#8a8a8a] rounded-sm text-[11px] hover:border-[#c4a265]/30 transition-colors duration-300 tracking-wider"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
