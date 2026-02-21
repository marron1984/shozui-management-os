"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, DEMO_USERS, DEMO_STORES, canViewSalary } from "@/lib/auth";
import { DEMO_SUGGESTIONS } from "@/lib/demo-data";
import { User, ROLE_LABELS, Suggestion } from "@/types";
import { Users, UserCircle, Store, MessageSquare, Send, Eye, EyeOff, MapPin } from "lucide-react";
import { canRespondToSuggestions } from "@/lib/auth";

export default function EmployeesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "suggestions">("roster");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState(DEMO_SUGGESTIONS);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const showSalary = canViewSalary(user.role);

  const getStoreName = (storeId: string) => {
    if (storeId === "all") return "全店舗";
    return DEMO_STORES.find((s) => s.id === storeId)?.name || storeId;
  };

  return (
    <div>
      <Header title="社員管理" />
      <div className="p-6">
        {/* タブ */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "roster" ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <Users size={16} />
            社員名簿
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === "suggestions" ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            <MessageSquare size={16} />
            意見・提案
            {suggestions.filter((s) => s.status === "new").length > 0 && (
              <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                {suggestions.filter((s) => s.status === "new").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "roster" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 社員一覧 */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_USERS.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`bg-white rounded-xl shadow-sm border p-4 text-left transition-all hover:shadow-md ${
                      selectedEmployee?.id === emp.id ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm text-gray-800">{emp.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {ROLE_LABELS[emp.role]} | {emp.position}
                        </div>
                        <div className="text-[10px] text-gray-400 flex items-center gap-1">
                          <MapPin size={8} />
                          {getStoreName(emp.storeId)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 社員票 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-fit sticky top-20">
              {selectedEmployee ? (
                <div>
                  <div className="text-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <h3 className="font-bold text-gray-800">{selectedEmployee.name}</h3>
                    <div className="text-xs text-gray-400">{ROLE_LABELS[selectedEmployee.role]}</div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400">ポジション</span>
                      <span className="text-gray-700">{selectedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400">所属店舗</span>
                      <span className="text-gray-700">{getStoreName(selectedEmployee.storeId)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400">メール</span>
                      <span className="text-gray-700 text-xs">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400">電話</span>
                      <span className="text-gray-700">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-400">入社日</span>
                      <span className="text-gray-700">{selectedEmployee.joinDate}</span>
                    </div>
                    {showSalary && selectedEmployee.salary && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-400 flex items-center gap-1">
                          給与 <Eye size={10} />
                        </span>
                        <span className="text-gray-700">¥{selectedEmployee.salary.toLocaleString()}</span>
                      </div>
                    )}
                    {!showSalary && (
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-400">給与</span>
                        <span className="text-gray-400 flex items-center gap-1 text-xs">
                          <EyeOff size={10} /> 閲覧権限なし
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400">ステータス</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        selectedEmployee.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}>
                        {selectedEmployee.status === "active" ? "在籍" : "退職"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <UserCircle size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">社員を選択して社員票を表示</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 意見・提案 */
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                        s.status === "new" ? "bg-blue-100 text-blue-700" :
                        s.status === "responded" ? "bg-green-100 text-green-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {s.status === "new" ? "新規" : s.status === "responded" ? "対応済み" : s.status === "reviewing" ? "確認中" : "解決済み"}
                      </span>
                      <h4 className="font-bold text-gray-800 text-sm">{s.title}</h4>
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {s.employeeName} | {s.storeName} | {new Date(s.createdAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{s.content}</p>
                {s.response && (
                  <div className="bg-green-50 rounded-lg p-3 mb-3">
                    <div className="text-[10px] text-green-600 mb-1">回答（{s.respondedByName}）:</div>
                    <p className="text-sm text-green-700">{s.response}</p>
                  </div>
                )}
                {s.status === "new" && user && canRespondToSuggestions(user.role) && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={replyTexts[s.id] || ""}
                      onChange={(e) =>
                        setReplyTexts({ ...replyTexts, [s.id]: e.target.value })
                      }
                      placeholder="回答を入力..."
                      className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <button
                      onClick={() => {
                        const text = replyTexts[s.id]?.trim();
                        if (!text) return;
                        setSuggestions(
                          suggestions.map((sg) =>
                            sg.id === s.id
                              ? {
                                  ...sg,
                                  status: "responded" as const,
                                  response: text,
                                  respondedBy: user.id,
                                  respondedByName: user.name,
                                  respondedAt: new Date().toISOString(),
                                }
                              : sg
                          )
                        );
                        setReplyTexts({ ...replyTexts, [s.id]: "" });
                      }}
                      disabled={!replyTexts[s.id]?.trim()}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center gap-1"
                    >
                      <Send size={14} />
                      回答
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
