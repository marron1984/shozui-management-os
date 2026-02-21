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
      case "pending": return <Clock size={16} className="text-yellow-500" />;
      case "approved": return <CheckCircle size={16} className="text-green-500" />;
      case "rejected": return <XCircle size={16} className="text-red-500" />;
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
    <div>
      <Header title="稟議書" />
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(["all", "pending", "approved", "rejected"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  filter === f ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {f === "all" ? "すべて" : statusLabel(f)}
                <span className="ml-1 text-xs opacity-70">
                  ({f === "all" ? requests.length : requests.filter((r) => r.status === f).length})
                </span>
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-colors">
            <Plus size={16} />
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
                className={`w-full bg-white rounded-xl shadow-sm border p-4 text-left transition-all hover:shadow-md ${
                  selectedRequest?.id === req.id ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {statusIcon(req.status)}
                    <span className="font-medium text-sm text-gray-800">{req.title}</span>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    req.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    req.status === "approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {statusLabel(req.status)}
                  </span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{req.description}</p>
                <div className="flex items-center justify-between text-[10px] text-gray-400">
                  <span>{req.storeName} | {req.requestedByName}</span>
                  <span className="font-medium text-gray-600">¥{req.amount.toLocaleString()}</span>
                </div>
              </button>
            ))}
          </div>

          {/* 詳細パネル */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit sticky top-20">
            {selectedRequest ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  {statusIcon(selectedRequest.status)}
                  <h3 className="font-bold text-gray-800">{selectedRequest.title}</h3>
                </div>

                <div className="space-y-3 mb-6">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">申請内容</label>
                    <p className="text-sm text-gray-600 mt-1">{selectedRequest.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">金額</label>
                      <p className="text-lg font-bold text-gray-800">¥{selectedRequest.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">カテゴリ</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.category}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">申請者</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.requestedByName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">店舗</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.storeName}</p>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider">申請日</label>
                    <p className="text-sm text-gray-600 mt-1">{new Date(selectedRequest.createdAt).toLocaleDateString("ja-JP")}</p>
                  </div>
                  {selectedRequest.attachments.length > 0 && (
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">添付ファイル</label>
                      {selectedRequest.attachments.map((a, i) => (
                        <div key={i} className="flex items-center gap-1 text-xs text-blue-600 mt-1">
                          <Paperclip size={10} />
                          {a.split("/").pop()}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedRequest.comment && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider">コメント</label>
                      <p className="text-sm text-gray-600 mt-1">{selectedRequest.comment}</p>
                    </div>
                  )}
                </div>

                {canApprove && selectedRequest.status === "pending" && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedRequest.id, true)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} />
                      承認
                    </button>
                    <button
                      onClick={() => handleApprove(selectedRequest.id, false)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} />
                      却下
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <ClipboardCheck size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">稟議書を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
