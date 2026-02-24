"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, DEMO_USERS, DEMO_STORES, canViewSalary } from "@/lib/auth";
import { DEMO_SUGGESTIONS } from "@/lib/demo-data";
import { User, ROLE_LABELS } from "@/types";
import { Users, UserCircle, MessageSquare, Send, Eye, EyeOff, MapPin, Plus, X } from "lucide-react";
import { Suggestion } from "@/types";
import { canRespondToSuggestions } from "@/lib/auth";

export default function EmployeesPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "suggestions">("roster");
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState(DEMO_SUGGESTIONS);
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});
  const [showNewSuggestion, setShowNewSuggestion] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({ title: "", content: "" });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const showSalary = canViewSalary(user.role);

  const handleNewSuggestion = () => {
    if (!newSuggestion.title.trim() || !newSuggestion.content.trim()) return;
    const storeName = user.storeId === "all" ? "全店舗" : (DEMO_STORES.find((s) => s.id === user.storeId)?.name || "");
    const newItem: Suggestion = {
      id: `sg${Date.now()}`,
      employeeId: user.id,
      employeeName: user.name,
      storeId: user.storeId,
      storeName,
      title: newSuggestion.title.trim(),
      content: newSuggestion.content.trim(),
      status: "new",
      createdAt: new Date().toISOString(),
    };
    setSuggestions([newItem, ...suggestions]);
    setShowNewSuggestion(false);
    setNewSuggestion({ title: "", content: "" });
  };

  const getStoreName = (storeId: string) => {
    if (storeId === "all") return "全店舗";
    return DEMO_STORES.find((s) => s.id === storeId)?.name || storeId;
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="社員管理" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* タブ */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("roster")}
            className={`px-4 py-2 text-[11px] rounded-sm transition-all duration-300 flex items-center gap-2 tracking-wider ${
              activeTab === "roster" ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2]"
            }`}
          >
            <Users size={14} strokeWidth={1.5} />
            社員名簿
          </button>
          <button
            onClick={() => setActiveTab("suggestions")}
            className={`px-4 py-2 text-[11px] rounded-sm transition-all duration-300 flex items-center gap-2 tracking-wider ${
              activeTab === "suggestions" ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2]"
            }`}
          >
            <MessageSquare size={14} strokeWidth={1.5} />
            意見・提案
            {suggestions.filter((s) => s.status === "new").length > 0 && (
              <span className="w-4 h-4 bg-red-500/80 text-white text-[9px] rounded-full flex items-center justify-center">
                {suggestions.filter((s) => s.status === "new").length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "suggestions" && (
          <div className="flex justify-end mb-4 -mt-2">
            <button
              onClick={() => setShowNewSuggestion(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider"
            >
              <Plus size={14} strokeWidth={1.5} />
              意見・提案を投稿
            </button>
          </div>
        )}

        {activeTab === "roster" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* 社員一覧 */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEMO_USERS.map((emp) => (
                  <button
                    key={emp.id}
                    onClick={() => setSelectedEmployee(emp)}
                    className={`bg-white border rounded-sm p-4 text-left transition-all duration-300 hover:border-[#c4a265]/30 ${
                      selectedEmployee?.id === emp.id ? "border-[#c4a265] bg-[#c4a265]/[0.02]" : "border-[#e0dbd2]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full border border-[#c4a265]/30 bg-[#1a1a1a] flex items-center justify-center text-[#c4a265] text-xs font-medium">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm text-[#2d2d2d] tracking-wider">{emp.name}</div>
                        <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                          {ROLE_LABELS[emp.role]} | {emp.position}
                        </div>
                        <div className="text-[10px] text-[#8a8a8a]/60 flex items-center gap-1 tracking-wider">
                          <MapPin size={8} strokeWidth={1.5} />
                          {getStoreName(emp.storeId)}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 社員票 */}
            <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5 h-fit lg:sticky lg:top-20">
              {selectedEmployee ? (
                <div>
                  <div className="text-center mb-5">
                    <div className="w-16 h-16 rounded-full border-2 border-[#c4a265]/30 bg-[#1a1a1a] flex items-center justify-center text-[#c4a265] text-xl font-light mx-auto mb-3">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">{selectedEmployee.name}</h3>
                    <div className="text-[10px] text-[#8a8a8a] tracking-wider mt-0.5">{ROLE_LABELS[selectedEmployee.role]}</div>
                  </div>

                  <div className="space-y-0 text-xs">
                    <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                      <span className="text-[#8a8a8a] tracking-wider">ポジション</span>
                      <span className="text-[#2d2d2d] tracking-wider">{selectedEmployee.position}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                      <span className="text-[#8a8a8a] tracking-wider">所属店舗</span>
                      <span className="text-[#2d2d2d] tracking-wider">{getStoreName(selectedEmployee.storeId)}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                      <span className="text-[#8a8a8a] tracking-wider">メール</span>
                      <span className="text-[#2d2d2d] text-[11px]">{selectedEmployee.email}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                      <span className="text-[#8a8a8a] tracking-wider">電話</span>
                      <span className="text-[#2d2d2d] tracking-wider">{selectedEmployee.phone}</span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                      <span className="text-[#8a8a8a] tracking-wider">入社日</span>
                      <span className="text-[#2d2d2d] tracking-wider">{selectedEmployee.joinDate}</span>
                    </div>
                    {showSalary && selectedEmployee.salary && (
                      <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                        <span className="text-[#8a8a8a] flex items-center gap-1 tracking-wider">
                          給与 <Eye size={9} strokeWidth={1.5} />
                        </span>
                        <span className="text-[#2d2d2d] tracking-wider">¥{selectedEmployee.salary.toLocaleString()}</span>
                      </div>
                    )}
                    {!showSalary && (
                      <div className="flex justify-between py-2.5 border-b border-[#eae6df]">
                        <span className="text-[#8a8a8a] tracking-wider">給与</span>
                        <span className="text-[#8a8a8a]/50 flex items-center gap-1 text-[11px]">
                          <EyeOff size={9} strokeWidth={1.5} /> 閲覧権限なし
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between py-2.5">
                      <span className="text-[#8a8a8a] tracking-wider">ステータス</span>
                      <span className={`px-2 py-0.5 rounded-sm text-[10px] tracking-wider ${
                        selectedEmployee.status === "active" ? "bg-green-50 text-green-700/70" : "bg-[#f5f3ee] text-[#8a8a8a]"
                      }`}>
                        {selectedEmployee.status === "active" ? "在籍" : "退職"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#8a8a8a] py-8">
                  <UserCircle size={28} className="mx-auto mb-2 opacity-20" strokeWidth={1} />
                  <p className="text-xs tracking-wider">社員を選択して社員票を表示</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* 意見・提案 */
          <div className="space-y-4">
            {suggestions.map((s) => (
              <div key={s.id} className="bg-white border border-[#e0dbd2] rounded-sm p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${
                        s.status === "new" ? "bg-blue-50 text-blue-600/70" :
                        s.status === "responded" ? "bg-green-50 text-green-700/70" :
                        "bg-[#f5f3ee] text-[#8a8a8a]"
                      }`}>
                        {s.status === "new" ? "新規" : s.status === "responded" ? "対応済み" : s.status === "reviewing" ? "確認中" : "解決済み"}
                      </span>
                      <h4 className="text-sm text-[#2d2d2d] tracking-wider">{s.title}</h4>
                    </div>
                    <div className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
                      {s.employeeName} | {s.storeName} | {new Date(s.createdAt).toLocaleDateString("ja-JP")}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-[#4a4a4a] mb-3 leading-relaxed">{s.content}</p>
                {s.response && (
                  <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3 mb-3">
                    <div className="text-[10px] text-[#c4a265] mb-1 tracking-wider">回答（{s.respondedByName}）</div>
                    <p className="text-xs text-[#4a4a4a] leading-relaxed">{s.response}</p>
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
                      className="flex-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
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
                      className="px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 flex items-center gap-1 tracking-wider"
                    >
                      <Send size={12} strokeWidth={1.5} />
                      回答
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 新規投稿モーダル */}
        {showNewSuggestion && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowNewSuggestion(false)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-lg w-full max-h-[85vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">意見・提案を投稿</h3>
                  <button onClick={() => setShowNewSuggestion(false)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider bg-white border border-[#e0dbd2] rounded-sm p-3">
                    投稿者: {user.name} | {getStoreName(user.storeId)}
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">タイトル <span className="text-red-500/70">*</span></label>
                    <input
                      type="text"
                      value={newSuggestion.title}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                      placeholder="例: 新メニュー開発の提案"
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">内容 <span className="text-red-500/70">*</span></label>
                    <textarea
                      value={newSuggestion.content}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, content: e.target.value })}
                      placeholder="意見や提案の詳細を記入してください..."
                      rows={5}
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleNewSuggestion}
                      disabled={!newSuggestion.title.trim() || !newSuggestion.content.trim()}
                      className="flex-1 py-2.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 tracking-wider"
                    >
                      投稿する
                    </button>
                    <button
                      onClick={() => setShowNewSuggestion(false)}
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
