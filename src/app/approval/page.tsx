"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, canApproveRequest } from "@/lib/auth";
import { DEMO_APPROVAL_REQUESTS } from "@/lib/demo-data";
import { User, ApprovalRequest } from "@/types";
import { ClipboardCheck, CheckCircle, XCircle, Clock, Plus, Paperclip, Hash } from "lucide-react";

// 自動付番: 既存の稟議番号から次の番号を生成
function generateApprovalNumber(requests: ApprovalRequest[]): string {
  const year = new Date().getFullYear();
  const prefix = `稟-${year}-`;
  const existing = requests
    .filter((r) => r.approvalNumber.startsWith(prefix))
    .map((r) => parseInt(r.approvalNumber.replace(prefix, ""), 10))
    .filter((n) => !isNaN(n));
  const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export default function ApprovalPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [requests, setRequests] = useState(DEMO_APPROVAL_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [approvalComment, setApprovalComment] = useState("");
  const [showCommentError, setShowCommentError] = useState(false);

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
    if (!approvalComment.trim()) {
      setShowCommentError(true);
      return;
    }
    setRequests(
      requests.map((r) =>
        r.id === id
          ? { ...r, status: approved ? "approved" as const : "rejected" as const, approvedBy: user.id, approvedAt: new Date().toISOString(), comment: approvalComment.trim() }
          : r
      )
    );
    setSelectedRequest(null);
    setApprovalComment("");
    setShowCommentError(false);
  };

  // 選択が変わったらコメント欄をリセット
  const handleSelectRequest = (req: ApprovalRequest) => {
    setSelectedRequest(req);
    setApprovalComment("");
    setShowCommentError(false);
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="稟議書" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex flex-wrap gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 lg:px-4 py-2 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* 一覧 */}
          <div className="lg:col-span-2 space-y-3">
            {filtered.map((req) => (
              <button
                key={req.id}
                onClick={() => handleSelectRequest(req)}
                className={`w-full bg-white border rounded-sm p-4 text-left transition-all duration-300 hover:border-[#c4a265]/30 ${
                  selectedRequest?.id === req.id ? "border-[#c4a265] bg-[#c4a265]/[0.02]" : "border-[#e0dbd2]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(req.status)}
                    <span className="text-[10px] text-[#8a8a8a]/60 tracking-wider font-mono">{req.approvalNumber}</span>
                    <span className="text-sm text-[#2d2d2d] tracking-wider">{req.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider flex-shrink-0 ${
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
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5 h-fit lg:sticky lg:top-20">
            {selectedRequest ? (
              <div>
                {/* 稟議番号 */}
                <div className="flex items-center gap-1.5 mb-1">
                  <Hash size={11} className="text-[#c4a265]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#c4a265] tracking-[0.15em] font-mono">{selectedRequest.approvalNumber}</span>
                </div>

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
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">承認者コメント</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 leading-relaxed">{selectedRequest.comment}</p>
                    </div>
                  )}
                </div>

                {canApprove && selectedRequest.status === "pending" && (
                  <div className="space-y-3 border-t border-[#eae6df] pt-4">
                    {/* コメント入力欄（承認・却下共通で必須） */}
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] flex items-center gap-1">
                        コメント
                        <span className="text-red-500/70">*必須</span>
                      </label>
                      <textarea
                        value={approvalComment}
                        onChange={(e) => {
                          setApprovalComment(e.target.value);
                          if (e.target.value.trim()) setShowCommentError(false);
                        }}
                        placeholder="承認・却下の理由を入力してください..."
                        rows={3}
                        className={`w-full mt-1 text-xs border rounded-sm px-3 py-2 bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider resize-none ${
                          showCommentError ? "border-red-400/70" : "border-[#e0dbd2]"
                        }`}
                      />
                      {showCommentError && (
                        <p className="text-[10px] text-red-500/70 mt-1 tracking-wider">
                          コメントを入力してください。承認・却下にはコメントが必須です。
                        </p>
                      )}
                    </div>

                    {/* 承認・却下ボタン */}
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
