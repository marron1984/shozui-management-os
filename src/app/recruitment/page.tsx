"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, canViewRecruitment } from "@/lib/auth";
import { DEMO_APPLICATIONS } from "@/lib/demo-data";
import { User, JobApplication } from "@/types";
import { UserPlus, FileText, CheckCircle, XCircle, Clock, Lock, User as UserIcon } from "lucide-react";

export default function RecruitmentPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [applications, setApplications] = useState(DEMO_APPLICATIONS);
  const [selected, setSelected] = useState<JobApplication | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  if (!canViewRecruitment(user.role)) {
    return (
      <div>
        <Header title="採用管理" />
        <div className="p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <Lock size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">この機能は店長・女将以上のみ閲覧可能です</p>
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

  return (
    <div>
      <Header title="採用管理" />
      <div className="p-6">
        {/* 統計 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: "応募総数", value: applications.length, color: "bg-blue-100 text-blue-700" },
            { label: "未確認", value: applications.filter((a) => a.status === "pending").length, color: "bg-yellow-100 text-yellow-700" },
            { label: "面接中", value: applications.filter((a) => a.status === "interviewing").length, color: "bg-purple-100 text-purple-700" },
            { label: "採用済", value: applications.filter((a) => a.status === "accepted").length, color: "bg-green-100 text-green-700" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <div className={`text-2xl font-bold ${s.color.split(" ")[1]}`}>{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 応募一覧 */}
          <div className="lg:col-span-2 space-y-3">
            {applications.map((app) => (
              <button
                key={app.id}
                onClick={() => setSelected(app)}
                className={`w-full bg-white rounded-xl shadow-sm border p-4 text-left transition-all hover:shadow-md ${
                  selected?.id === app.id ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <UserIcon size={18} className="text-gray-400" />
                    </div>
                    <div>
                      <div className="font-medium text-sm text-gray-800">{app.name}</div>
                      <div className="text-[10px] text-gray-400">
                        {app.type === "full_time" ? "社員" : "アルバイト"} | {app.appliedStoreName}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    app.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                    app.status === "interviewing" ? "bg-purple-100 text-purple-700" :
                    app.status === "accepted" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {statusLabel(app.status)}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400">
                  応募日: {new Date(app.createdAt).toLocaleDateString("ja-JP")}
                  {app.comment && ` | ${app.comment}`}
                </div>
              </button>
            ))}
          </div>

          {/* 詳細パネル */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit sticky top-20">
            {selected ? (
              <div>
                <div className="text-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <UserIcon size={28} className="text-gray-400" />
                  </div>
                  <h3 className="font-bold text-gray-800">{selected.name}</h3>
                  <div className="text-xs text-gray-400">
                    {selected.type === "full_time" ? "社員応募" : "アルバイト応募"}
                  </div>
                </div>

                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-400">電話</span>
                    <span className="text-gray-700">{selected.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-400">メール</span>
                    <span className="text-gray-700 text-xs">{selected.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-400">希望店舗</span>
                    <span className="text-gray-700">{selected.appliedStoreName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-400">応募日</span>
                    <span className="text-gray-700">{new Date(selected.createdAt).toLocaleDateString("ja-JP")}</span>
                  </div>
                  <div className="py-2">
                    <span className="text-gray-400 block mb-1">履歴書</span>
                    <button className="flex items-center gap-1 text-blue-600 text-xs hover:text-blue-700">
                      <FileText size={12} />
                      {selected.resumeUrl.split("/").pop()}
                    </button>
                  </div>
                  {selected.comment && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <span className="text-[10px] text-gray-400">メモ</span>
                      <p className="text-sm text-gray-600">{selected.comment}</p>
                    </div>
                  )}
                </div>

                {(selected.status === "pending" || selected.status === "interviewing") && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecision(selected.id, true)}
                      className="flex-1 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 flex items-center justify-center gap-1"
                    >
                      <CheckCircle size={14} />
                      採用
                    </button>
                    <button
                      onClick={() => handleDecision(selected.id, false)}
                      className="flex-1 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 flex items-center justify-center gap-1"
                    >
                      <XCircle size={14} />
                      不採用
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <UserPlus size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">応募者を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
