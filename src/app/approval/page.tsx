"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, canApproveRequest } from "@/lib/auth";
import { DEMO_APPROVAL_REQUESTS } from "@/lib/demo-data";
import { User, ApprovalRequest } from "@/types";
import { ClipboardCheck, CheckCircle, XCircle, Clock, Plus, Paperclip } from "lucide-react";

export default function ApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [requests, setRequests] = useState(DEMO_APPROVAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const canApprove = canApproveRequest(user.role);
  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const statusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock size={14} className="text-[#c4a265]" strokeWidth={1.5} />;
      case "approved": return <CheckCircle size={14} className="text-green-600/70" strokeWidth={1.5} />;
      case "rejected": return <XCircle size={14} className="text-red-500/70" strokeWidth={1.5} />;
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "pending": return "承認待ち";
      case "approved": return "承認済み";
      case "rejected": return "却下";
      default: return status;
    }
  };

  const handleApprove = (id: string, approved: boolean) => {
    setRequests(
      requests.map((r) =>
        r.id === id
          ? { ...r, status: approved ? "approved" as const : "rejected" as const, approvedBy: user.id, approvedAt: new Date().toISOString(), comment: approved ? "承認しました。" : "条件を再検討してください。" }
          : r
      )
    );
    setSelectedRequest(null);
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="稟議書" />
      <div className="p-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
                  filter === f ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2] hover:border-[#c4a265]/30"
                }`}
              >
                {f === "all" ? "すべて" : statusLabel(f)}
                <span className="ml-1 opacity-60">
                  ({f === "all" ? requests.length : requests.filter((r) => r.status === f).length})
                </span>
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider">
            <Plus size={14} strokeWidth={1.5} />
            新規申請
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 一覧 */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((req) => (
              <button
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className={`w-full bg-white border rounded-sm p-4 text-left transition-all duration-300 hover:border-[#c4a265]/30 ${
                  selectedRequest?.id === req.id ? "border-[#c4a265] bg-[#c4a265]/[0.02]" : "border-[#e0dbd2]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(req.status)}
                    <span className="text-sm text-[#2d2d2d] tracking-wider">{req.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${
                    req.status === "pending" ? "bg-[#c4a265]/10 text-[#c4a265]" :
                    req.status === "approved" ? "bg-green-50 text-green-700/70" : "bg-red-50 text-red-600/70"
                  }`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
                <p className="text-xs text-[#8a8a8a] line-clamp-1 mb-2">{req.description}</p>
                <div className="flex items-center justify-between text-[10px] text-[#8a8a8a]/70 tracking-wider">
                  <span>{req.storeName} | {req.requestedByName}</span>
                  <span className="text-[#2d2d2d]">¥{req.amount.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 詳細パネル */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-5 h-fit sticky top-20">
            {selectedRequest ? (
              <div>
                <div className="flex items-center gap-2 mb-5">
                  {statusIcon(selectedRequest.status)}
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">{selectedRequest.title}</h3>
                </div>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">申請内容</label>
                    <p className="text-xs text-[#4a4a4a] mt-1 leading-relaxed">{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">金額</label>
                      <p className="text-lg font-light text-[#2d2d2d] tracking-wider">¥{selectedRequest.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">カテゴリ</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{selectedRequest.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">申請者</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{selectedRequest.requestedByName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">店舗</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{selectedRequest.storeName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">申請日</label>
                    <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{new Date(selectedRequest.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  {selectedRequest.attachments.length > 0 && (
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">添付ファイル</label>
                      {selectedRequest.attachments.map((a, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-[#c4a265] mt-1 tracking-wider">
                          <Paperclip size={10} strokeWidth={1.5} />
                          {a.split("/").pop()}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRequest.comment && (
                    <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">コメント</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 leading-relaxed">{selectedRequest.comment}</p>
                    </div>
                  )}
                </div>

                {canApprove && selectedRequest.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedRequest.id, true)}
                      className="flex-1 py-2.5 bg-[#2d2d2d] text-white rounded-sm text-[11px] hover:bg-[#1a1a1a] transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                    >
                      <CheckCircle size={13} strokeWidth={1.5} />
                      承認
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id, false)}
                      className="flex-1 py-2.5 border border-[#e0dbd2] text-[#8a8a8a] rounded-sm text-[11px] hover:border-red-300 hover:text-red-600/70 transition-colors duration-300 flex items-center justify-center gap-1 tracking-wider"
                    >
                      <XCircle size={13} strokeWidth={1.5} />
                      却下
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-[#8a8a8a] py-8">
                <ClipboardCheck size={28} className="mx-auto mb-2 opacity-20" strokeWidth={1} />
                <p className="text-xs tracking-wider">稟議書を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
