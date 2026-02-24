"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, canViewRecruitment, DEMO_STORES } from "@/lib/auth";
import { DEMO_APPLICATIONS } from "@/lib/demo-data";
import { usePersistedState } from "@/lib/usePersistedState";
import { User, JobApplication } from "@/types";
import { UserPlus, FileText, CheckCircle, XCircle, Lock, User as UserIcon, ArrowRight, Plus, X } from "lucide-react";

export default function RecruitmentPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = usePersistedState("applications", DEMO_APPLICATIONS);
  const [selected, setSelected] = useState<JobApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "interviewing" | "accepted" | "rejected">("all");
  const [showNewModal, setShowNewModal] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    phone: "",
    email: "",
    type: "full_time" as "full_time" | "part_time",
    storeId: "s1",
    comment: "",
  });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  if (!canViewRecruitment(user.role)) {
    return (
      <div className="bg-[#fafaf7] min-h-screen">
        <Header title="採用管理" onMobileMenuOpen={openMobileMenu} />
        <div className="p-4 lg:p-8">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
            <Lock size={36} className="mx-auto text-[#e0dbd2] mb-3" strokeWidth={1} />
            <p className="text-xs text-[#8a8a8a] tracking-wider">この機能は店長・女将以上のみ閲覧可能です</p>
          </div>
        </div>
      </div>
    );
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case "pending": return "未確認";
      case "interviewing": return "面接中";
      case "accepted": return "採用";
      case "rejected": return "不採用";
      default: return s;
    }
  };

  const handleDecision = (id: string, accepted: boolean) => {
    setApplications(
      applications.map((a) =>
        a.id === id
          ? { ...a, status: accepted ? "accepted" as const : "rejected" as const, reviewedBy: user.id, reviewedByName: user.name, reviewedAt: new Date().toISOString() }
          : a
      )
    );
    setSelected(null);
  };

  const handleMoveToInterview = (id: string) => {
    setApplications(
      applications.map((a) =>
        a.id === id ? { ...a, status: "interviewing" as const } : a
      )
    );
  };

  const handleNewApplication = () => {
    if (!newForm.name.trim() || !newForm.phone.trim() || !newForm.email.trim()) return;
    const store = DEMO_STORES.find((s) => s.id === newForm.storeId);
    const newApp: JobApplication = {
      id: `ja${Date.now()}`,
      name: newForm.name.trim(),
      phone: newForm.phone.trim(),
      email: newForm.email.trim(),
      type: newForm.type,
      appliedStoreId: newForm.storeId,
      appliedStoreName: store?.name || "",
      resumeUrl: `/resumes/${newForm.name.trim().replace(/\s/g, "_")}.pdf`,
      status: "pending",
      comment: newForm.comment.trim() || undefined,
      createdAt: new Date().toISOString(),
    };
    setApplications([newApp, ...applications]);
    setShowNewModal(false);
    setNewForm({ name: "", phone: "", email: "", type: "full_time", storeId: "s1", comment: "" });
  };

  const filteredApplications = statusFilter === "all"
    ? applications
    : applications.filter((a) => a.status === statusFilter);

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="採用管理" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* 統計 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
          {[
            { label: "応募総数", value: applications.length, color: "text-[#2d2d2d]" },
            { label: "未確認", value: applications.filter((a) => a.status === "pending").length, color: "text-[#c4a265]" },
            { label: "面接中", value: applications.filter((a) => a.status === "interviewing").length, color: "text-[#4a4a4a]" },
            { label: "採用済", value: applications.filter((a) => a.status === "accepted").length, color: "text-green-700/70" },
          ].map((s) => (
            <div key={s.label} className="bg-white border border-[#e0dbd2] rounded-sm p-4 text-center">
              <div className={`text-2xl font-light ${s.color} tracking-wider`}>{s.value}</div>
              <div className="text-[10px] text-[#8a8a8a] mt-1 tracking-[0.15em]">{s.label}</div>
            </div>
          ))}
        </div>

        {/* ステータスフィルター */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
          {(["all", "pending", "interviewing", "accepted", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 lg:px-4 py-2 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
                statusFilter === f ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2] hover:border-[#c4a265]/30"
              }`}
            >
              {f === "all" ? "すべて" : statusLabel(f)}
              <span className="ml-1 opacity-60">
                ({f === "all" ? applications.length : applications.filter((a) => a.status === f).length})
              </span>
            </button>
          ))}
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider"
          >
            <Plus size={14} strokeWidth={1.5} />
            応募登録
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 応募一覧 */}
          <div className="lg:col-span-2 space-y-3">
            {filteredApplications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className={`w-full bg-white border rounded-sm p-4 text-left transition-all duration-300 hover:border-[#c4a265]/30 ${
                  selected?.id === app.id ? "border-[#c4a265] bg-[#c4a265]/[0.02]" : "border-[#e0dbd2]"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full border border-[#e0dbd2] bg-[#f5f3ee] flex items-center justify-center">
                      <UserIcon size={15} className="text-[#8a8a8a]" strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="text-sm text-[#2d2d2d] tracking-wider">{app.name}</div>
                      <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                        {app.type === "full_time" ? "社員" : "アルバイト"} | {app.appliedStoreName}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${
                    app.status === "pending" ? "bg-[#c4a265]/10 text-[#c4a265]" :
                    app.status === "interviewing" ? "bg-[#f5f3ee] text-[#4a4a4a]" :
                    app.status === "accepted" ? "bg-green-50 text-green-700/70" : "bg-red-50 text-red-600/70"
                  }`}>
                    {statusLabel(app.status)}
                  </span>
                </div>
                <div className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
                  応募日: {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                  {app.comment && ` | ${app.comment}`}
                </div>
              </button>
            ))}
          </div>

          {/* 詳細パネル */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5 h-fit lg:sticky lg:top-20">
            {selected ? (
              <div>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-full border border-[#e0dbd2] bg-[#f5f3ee] flex items-center justify-center mx-auto mb-2">
                    <UserIcon size={24} className="text-[#8a8a8a]" strokeWidth={1} />
                  </div>
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">{selected.name}</h3>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    {selected.type === "full_time" ? "社員応募" : "アルバイト応募"}
                  </div>
                </div>

                <div className="space-y-0 text-xs mb-6">
                  <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                    <span className="text-[#8a8a8a] tracking-wider">電話</span>
                    <span className="text-[#2d2d2d] tracking-wider">{selected.phone}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                    <span className="text-[#8a8a8a] tracking-wider">メール</span>
                    <span className="text-[#2d2d2d] text-[11px]">{selected.email}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                    <span className="text-[#8a8a8a] tracking-wider">希望店舗</span>
                    <span className="text-[#2d2d2d] tracking-wider">{selected.appliedStoreName}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                    <span className="text-[#8a8a8a] tracking-wider">応募日</span>
                    <span className="text-[#2d2d2d] tracking-wider">{new Date(selected.createdAt).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div className="py-2.5 border-b border-[#eae6df]">
                    <span className="text-[#8a8a8a] block mb-1 tracking-wider">履歴書</span>
                    <button
                      onClick={() => alert(`${selected.resumeUrl.split("/").pop()} を開きます（デモ環境のため実ファイルはありません）`)}
                      className="flex items-center gap-1 text-[#c4a265] text-[11px] hover:text-[#b8860b] transition-colors duration-300 tracking-wider"
                    >
                      <FileText size={11} strokeWidth={1.5} />
                      {selected.resumeUrl.split("/").pop()}
                    </button>
                  </div>
                  {selected.comment && (
                    <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3 mt-3">
                      <span className="text-[10px] text-[#8a8a8a] tracking-wider">メモ</span>
                      <p className="text-xs text-[#4a4a4a] mt-0.5">{selected.comment}</p>
                    </div>
                  )}
                </div>

                {selected.status === "pending" && (
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        handleMoveToInterview(selected.id);
                        setSelected({ ...selected, status: "interviewing" });
                      }}
                      className="w-full py-2.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                    >
                      <ArrowRight size={13} strokeWidth={1.5} />
                      面接へ進める
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDecision(selected.id, true)}
                        className="flex-1 py-2.5 bg-[#2d2d2d] text-white rounded-sm text-[11px] hover:bg-[#1a1a1a] transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                      >
                        <CheckCircle size={13} strokeWidth={1.5} />
                        採用
                      </button>
                      <button
                        onClick={() => handleDecision(selected.id, false)}
                        className="flex-1 py-2.5 border border-[#e0dbd2] text-[#8a8a8a] rounded-sm text-[11px] hover:border-red-300 hover:text-red-600/70 transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                      >
                        <XCircle size={13} strokeWidth={1.5} />
                        不採用
                      </button>
                    </div>
                  </div>
                )}

                {selected.status === "interviewing" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecision(selected.id, true)}
                      className="flex-1 py-2.5 bg-[#2d2d2d] text-white rounded-sm text-[11px] hover:bg-[#1a1a1a] transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                    >
                      <CheckCircle size={13} strokeWidth={1.5} />
                      採用
                    </button>
                    <button
                      onClick={() => handleDecision(selected.id, false)}
                      className="flex-1 py-2.5 border border-[#e0dbd2] text-[#8a8a8a] rounded-sm text-[11px] hover:border-red-300 hover:text-red-600/70 transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                    >
                      <XCircle size={13} strokeWidth={1.5} />
                      不採用
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-[#8a8a8a] py-8">
                <UserPlus size={28} className="mx-auto mb-2 opacity-20" strokeWidth={1} />
                <p className="text-xs tracking-wider">応募者を選択してください</p>
              </div>
            )}
          </div>
        </div>
        {/* 新規応募モーダル */}
        {showNewModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowNewModal(false)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">応募者を登録</h3>
                  <button onClick={() => setShowNewModal(false)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">氏名 <span className="text-red-500/70">*</span></label>
                    <input
                      type="text"
                      value={newForm.name}
                      onChange={(e) => setNewForm({ ...newForm, name: e.target.value })}
                      placeholder="例: 山田 花子"
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">電話番号 <span className="text-red-500/70">*</span></label>
                      <input
                        type="tel"
                        value={newForm.phone}
                        onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                        placeholder="090-1234-5678"
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">メール <span className="text-red-500/70">*</span></label>
                      <input
                        type="email"
                        value={newForm.email}
                        onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                        placeholder="example@mail.com"
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">雇用形態</label>
                      <select
                        value={newForm.type}
                        onChange={(e) => setNewForm({ ...newForm, type: e.target.value as "full_time" | "part_time" })}
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      >
                        <option value="full_time">社員</option>
                        <option value="part_time">アルバイト</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">希望店舗</label>
                      <select
                        value={newForm.storeId}
                        onChange={(e) => setNewForm({ ...newForm, storeId: e.target.value })}
                        className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      >
                        {DEMO_STORES.map((s) => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">メモ</label>
                    <textarea
                      value={newForm.comment}
                      onChange={(e) => setNewForm({ ...newForm, comment: e.target.value })}
                      placeholder="応募者に関するメモ..."
                      rows={3}
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleNewApplication}
                      disabled={!newForm.name.trim() || !newForm.phone.trim() || !newForm.email.trim()}
                      className="flex-1 py-2.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 tracking-wider"
                    >
                      登録する
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
