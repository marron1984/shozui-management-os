"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, canViewCashFlow } from "@/lib/auth";
import { DEMO_CASHFLOW } from "@/lib/demo-data";
import { User, CashFlow, CashFlowDetail } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  ArrowDown,
  Lock,
  Plus,
  X,
  Trash2,
  Wallet,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ── ユーティリティ ──────────────────────────────────
function generateId() {
  return "cfd_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function recalculate(details: CashFlowDetail[], openingBalance: number) {
  const income = details
    .filter((d) => d.amount > 0)
    .reduce((s, d) => s + d.amount, 0);
  const expenseTotal = details
    .filter((d) => d.amount < 0)
    .reduce((s, d) => s + Math.abs(d.amount), 0);
  const closingBalance = openingBalance + income - expenseTotal;

  const today = new Date().toISOString().split("T")[0];
  const pastDetails = details.filter((d) => d.date <= today);
  const pastIncome = pastDetails
    .filter((d) => d.amount > 0)
    .reduce((s, d) => s + d.amount, 0);
  const pastExpenses = pastDetails
    .filter((d) => d.amount < 0)
    .reduce((s, d) => s + Math.abs(d.amount), 0);
  const currentBalance = openingBalance + pastIncome - pastExpenses;

  const futureDetails = details.filter((d) => d.date > today);
  const futureIncome = futureDetails
    .filter((d) => d.amount > 0)
    .reduce((s, d) => s + d.amount, 0);
  const futureExpenses = futureDetails
    .filter((d) => d.amount < 0)
    .reduce((s, d) => s + Math.abs(d.amount), 0);

  return {
    income,
    expenses: expenseTotal,
    closingBalance,
    currentBalance,
    pastIncome,
    pastExpenses,
    futureIncome,
    futureExpenses,
  };
}

// ── メインコンポーネント ────────────────────────────
export default function FinancePage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [cashflow, setCashflow] = useState<CashFlow>(() => ({
    ...DEMO_CASHFLOW[0],
    details: [...DEMO_CASHFLOW[0].details],
  }));

  // 入力フォーム
  const [showAddForm, setShowAddForm] = useState(false);
  const [formType, setFormType] = useState<"income" | "expense">("expense");
  const [formCategory, setFormCategory] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formAmount, setFormAmount] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      router.push("/login");
      return;
    }
    setUser(u);
  }, [router]);

  // 計算値
  const calc = useMemo(
    () => recalculate(cashflow.details, cashflow.openingBalance),
    [cashflow.details, cashflow.openingBalance]
  );

  // 項目追加
  const handleAdd = useCallback(() => {
    if (!formCategory.trim()) {
      setFormError("カテゴリを入力してください");
      return;
    }
    const amt = parseFloat(formAmount);
    if (!formAmount || isNaN(amt) || amt <= 0) {
      setFormError("正しい金額を入力してください");
      return;
    }
    if (!formDate) {
      setFormError("日付を選択してください");
      return;
    }
    setFormError("");

    const newDetail: CashFlowDetail = {
      id: generateId(),
      category: formCategory.trim(),
      description: formDescription.trim(),
      amount: formType === "income" ? amt : -amt,
      date: formDate,
    };

    setCashflow((prev) => {
      const newDetails = [...prev.details, newDetail].sort(
        (a, b) => a.date.localeCompare(b.date)
      );
      const r = recalculate(newDetails, prev.openingBalance);
      return {
        ...prev,
        details: newDetails,
        income: r.income,
        expenses: r.expenses,
        closingBalance: r.closingBalance,
        updatedAt: new Date().toISOString(),
      };
    });

    // フォームリセット
    setFormCategory("");
    setFormDescription("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setShowAddForm(false);
  }, [formCategory, formDescription, formAmount, formDate, formType]);

  // 項目削除
  const handleDelete = useCallback((id: string) => {
    setCashflow((prev) => {
      const newDetails = prev.details.filter((d) => d.id !== id);
      const r = recalculate(newDetails, prev.openingBalance);
      return {
        ...prev,
        details: newDetails,
        income: r.income,
        expenses: r.expenses,
        closingBalance: r.closingBalance,
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  if (!user) return null;

  if (!canViewCashFlow(user.role)) {
    return (
      <div className="bg-[#fafaf7] min-h-screen">
        <Header title="資金繰り" onMobileMenuOpen={openMobileMenu} />
        <div className="p-4 lg:p-8">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-12 text-center">
            <Lock
              size={36}
              className="mx-auto text-[#e0dbd2] mb-3"
              strokeWidth={1}
            />
            <p className="text-xs text-[#8a8a8a] tracking-wider">
              この機能は社長・経理のみ閲覧可能です
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="資金繰り" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        {/* ── サマリーカード ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
          {/* 月初残高 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5">
            <div className="text-[10px] lg:text-[11px] text-[#8a8a8a] mb-1 tracking-[0.15em]">
              月初残高
            </div>
            <div className="text-lg lg:text-xl font-light text-[#2d2d2d] tracking-wider">
              ¥{(cashflow.openingBalance / 10000).toFixed(0)}
              <span className="text-[10px] text-[#8a8a8a] ml-0.5">万</span>
            </div>
          </div>

          {/* 収入 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5">
            <div className="text-[10px] lg:text-[11px] text-[#8a8a8a] mb-1 flex items-center gap-1 tracking-[0.15em]">
              <TrendingUp
                size={12}
                className="text-green-600/60"
                strokeWidth={1.5}
              />
              収入
            </div>
            <div className="text-lg lg:text-xl font-light text-green-700/70 tracking-wider">
              +¥{(calc.income / 10000).toFixed(0)}
              <span className="text-[10px] text-[#8a8a8a] ml-0.5">万</span>
            </div>
          </div>

          {/* 支出 */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-5">
            <div className="text-[10px] lg:text-[11px] text-[#8a8a8a] mb-1 flex items-center gap-1 tracking-[0.15em]">
              <TrendingDown
                size={12}
                className="text-red-500/60"
                strokeWidth={1.5}
              />
              支出
            </div>
            <div className="text-lg lg:text-xl font-light text-red-600/70 tracking-wider">
              -¥{(calc.expenses / 10000).toFixed(0)}
              <span className="text-[10px] text-[#8a8a8a] ml-0.5">万</span>
            </div>
          </div>

          {/* 現在残高（NOW） */}
          <div className="bg-[#c4a265]/[0.06] border border-[#c4a265]/30 rounded-sm p-4 lg:p-5 relative">
            <div className="text-[10px] lg:text-[11px] text-[#c4a265] mb-1 flex items-center gap-1.5 tracking-[0.15em]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c4a265] opacity-40" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c4a265]" />
              </span>
              現在残高
            </div>
            <div className="text-lg lg:text-xl font-light text-[#c4a265] tracking-wider">
              ¥{(calc.currentBalance / 10000).toFixed(0)}
              <span className="text-[10px] text-[#c4a265]/60 ml-0.5">万</span>
            </div>
          </div>

          {/* 月末残高（見込） */}
          <div className="bg-[#1a1a1a] rounded-sm p-4 lg:p-5 col-span-2 sm:col-span-1">
            <div className="text-[10px] lg:text-[11px] text-white/40 mb-1 tracking-[0.15em]">
              月末残高（見込）
            </div>
            <div className="text-lg lg:text-xl font-light text-[#c4a265] tracking-wider">
              ¥{(calc.closingBalance / 10000).toFixed(0)}
              <span className="text-[10px] text-[#c4a265]/50 ml-0.5">万</span>
            </div>
          </div>
        </div>

        {/* ── フロー図（月初 → NOW → 月末） ── */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 lg:p-6 mb-6">
          <h3 className="text-sm text-[#2d2d2d] mb-4 lg:mb-5 tracking-wider">
            {cashflow.year}年{cashflow.month}月 資金繰りフロー
          </h3>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-3 lg:gap-5 py-3 lg:py-6">
            {/* 月初 */}
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-[#e0dbd2] flex items-center justify-center bg-[#fafaf7]">
                <div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    月初
                  </div>
                  <div className="text-sm font-light text-[#2d2d2d] tracking-wider">
                    ¥{(cashflow.openingBalance / 10000).toFixed(0)}万
                  </div>
                </div>
              </div>
            </div>

            {/* → 今日までの収支 */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight
                size={18}
                className="text-[#e0dbd2] hidden lg:block"
                strokeWidth={1.5}
              />
              <ArrowDown
                size={18}
                className="text-[#e0dbd2] lg:hidden"
                strokeWidth={1.5}
              />
              <div className="text-center">
                <div className="text-[10px] text-[#8a8a8a]/60 tracking-wider mb-0.5">
                  今日まで
                </div>
                {calc.pastIncome > 0 && (
                  <div className="text-green-700/70 text-[11px] tracking-wider">
                    +¥{(calc.pastIncome / 10000).toFixed(0)}万
                  </div>
                )}
                {calc.pastExpenses > 0 && (
                  <div className="text-red-600/70 text-[11px] tracking-wider">
                    -¥{(calc.pastExpenses / 10000).toFixed(0)}万
                  </div>
                )}
                {calc.pastIncome === 0 && calc.pastExpenses === 0 && (
                  <div className="text-[#8a8a8a]/50 text-[11px] tracking-wider">
                    ±¥0
                  </div>
                )}
              </div>
            </div>

            {/* NOW */}
            <div className="text-center flex-shrink-0">
              <div className="w-22 h-22 lg:w-26 lg:h-26 w-[88px] h-[88px] lg:w-[104px] lg:h-[104px] rounded-full border-2 border-[#c4a265] flex items-center justify-center bg-[#c4a265]/[0.04] relative">
                <div>
                  <div className="text-[10px] text-[#c4a265] tracking-wider flex items-center justify-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c4a265] opacity-40" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#c4a265]" />
                    </span>
                    NOW
                  </div>
                  <div className="text-sm font-light text-[#c4a265] tracking-wider">
                    ¥{(calc.currentBalance / 10000).toFixed(0)}万
                  </div>
                </div>
              </div>
            </div>

            {/* → 今後の見込み */}
            <div className="flex flex-col items-center gap-1">
              <ArrowRight
                size={18}
                className="text-[#e0dbd2] hidden lg:block"
                strokeWidth={1.5}
              />
              <ArrowDown
                size={18}
                className="text-[#e0dbd2] lg:hidden"
                strokeWidth={1.5}
              />
              <div className="text-center">
                <div className="text-[10px] text-[#8a8a8a]/60 tracking-wider mb-0.5">
                  今後見込
                </div>
                {calc.futureIncome > 0 && (
                  <div className="text-green-700/70 text-[11px] tracking-wider">
                    +¥{(calc.futureIncome / 10000).toFixed(0)}万
                  </div>
                )}
                {calc.futureExpenses > 0 && (
                  <div className="text-red-600/70 text-[11px] tracking-wider">
                    -¥{(calc.futureExpenses / 10000).toFixed(0)}万
                  </div>
                )}
                {calc.futureIncome === 0 && calc.futureExpenses === 0 && (
                  <div className="text-[#8a8a8a]/50 text-[11px] tracking-wider">
                    ±¥0
                  </div>
                )}
              </div>
            </div>

            {/* 月末 */}
            <div className="text-center flex-shrink-0">
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border-2 border-[#e0dbd2]/60 flex items-center justify-center bg-[#fafaf7]">
                <div>
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    月末
                  </div>
                  <div className="text-sm font-light text-[#2d2d2d] tracking-wider">
                    ¥{(calc.closingBalance / 10000).toFixed(0)}万
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── 明細セクション ── */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm">
          {/* ヘッダー + 追加ボタン */}
          <div className="p-4 border-b border-[#e0dbd2] flex items-center justify-between">
            <h3 className="text-sm text-[#2d2d2d] tracking-wider flex items-center gap-2">
              <Wallet size={15} className="text-[#c4a265]" strokeWidth={1.5} />
              明細
            </h3>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider"
            >
              {showAddForm ? (
                <>
                  <ChevronUp size={13} strokeWidth={1.5} />
                  閉じる
                </>
              ) : (
                <>
                  <Plus size={13} strokeWidth={1.5} />
                  項目追加
                </>
              )}
            </button>
          </div>

          {/* ── 入力フォーム（展開式） ── */}
          {showAddForm && (
            <div className="p-4 border-b border-[#c4a265]/20 bg-[#c4a265]/[0.03]">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
                {/* 種別トグル */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] block mb-1.5">
                    種別
                  </label>
                  <div className="flex rounded-sm overflow-hidden border border-[#e0dbd2]">
                    <button
                      onClick={() => setFormType("income")}
                      className={`flex-1 py-2 text-[11px] tracking-wider transition-colors duration-300 ${
                        formType === "income"
                          ? "bg-green-600/80 text-white"
                          : "bg-white text-[#8a8a8a] hover:bg-[#f5f3ee]"
                      }`}
                    >
                      収入
                    </button>
                    <button
                      onClick={() => setFormType("expense")}
                      className={`flex-1 py-2 text-[11px] tracking-wider transition-colors duration-300 ${
                        formType === "expense"
                          ? "bg-red-500/80 text-white"
                          : "bg-white text-[#8a8a8a] hover:bg-[#f5f3ee]"
                      }`}
                    >
                      支出
                    </button>
                  </div>
                </div>

                {/* カテゴリ */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] block mb-1.5">
                    カテゴリ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => {
                      setFormCategory(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="例: 売上（本店）"
                    className="w-full text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 text-[#2d2d2d] bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider placeholder:text-[#ccc]"
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] block mb-1.5">
                    説明
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="例: 2月売上"
                    className="w-full text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 text-[#2d2d2d] bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider placeholder:text-[#ccc]"
                  />
                </div>

                {/* 金額 */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] block mb-1.5">
                    金額（円） <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={formAmount}
                    onChange={(e) => {
                      setFormAmount(e.target.value);
                      if (formError) setFormError("");
                    }}
                    placeholder="例: 1000000"
                    min="1"
                    className="w-full text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 text-[#2d2d2d] bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider placeholder:text-[#ccc]"
                  />
                </div>

                {/* 日付 */}
                <div>
                  <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] block mb-1.5">
                    日付 <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => {
                      setFormDate(e.target.value);
                      if (formError) setFormError("");
                    }}
                    className="w-full text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 text-[#2d2d2d] bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                  />
                </div>
              </div>

              {/* エラー + 追加ボタン */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-3 gap-2">
                {formError && (
                  <p className="text-[11px] text-red-500 tracking-wider">
                    {formError}
                  </p>
                )}
                <div className="sm:ml-auto">
                  <button
                    onClick={handleAdd}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider"
                  >
                    <Plus size={13} strokeWidth={1.5} />
                    追加する
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── 明細テーブル ── */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="border-b border-[#eae6df] text-[10px] text-[#8a8a8a] tracking-[0.15em]">
                  <th className="w-1" />
                  <th className="text-left p-3 font-normal">カテゴリ</th>
                  <th className="text-left p-3 font-normal">説明</th>
                  <th className="text-left p-3 font-normal">日付</th>
                  <th className="text-right p-3 font-normal">金額</th>
                  <th className="w-10 p-3" />
                </tr>
              </thead>
              <tbody>
                {cashflow.details.map((d) => {
                  const isIncome = d.amount > 0;
                  const today = new Date().toISOString().split("T")[0];
                  const isPast = d.date <= today;
                  return (
                    <tr
                      key={d.id}
                      className={`border-b border-[#eae6df]/50 hover:bg-[#f5f3ee] transition-colors duration-300 ${
                        !isPast ? "opacity-50" : ""
                      }`}
                    >
                      <td
                        className={`w-1 ${
                          isIncome
                            ? "border-l-[3px] border-l-green-500/40"
                            : "border-l-[3px] border-l-red-400/40"
                        }`}
                      />
                      <td className="p-3 text-xs text-[#2d2d2d] tracking-wider">
                        {d.category}
                      </td>
                      <td className="p-3 text-xs text-[#8a8a8a]">
                        {d.description}
                      </td>
                      <td className="p-3 text-xs text-[#8a8a8a]/70 tracking-wider whitespace-nowrap">
                        {d.date}
                        {!isPast && (
                          <span className="ml-1.5 text-[9px] text-[#c4a265] bg-[#c4a265]/10 px-1.5 py-0.5 rounded-sm">
                            予定
                          </span>
                        )}
                      </td>
                      <td
                        className={`p-3 text-xs text-right tracking-wider whitespace-nowrap ${
                          isIncome ? "text-green-700/70" : "text-red-600/70"
                        }`}
                      >
                        {isIncome ? "+" : ""}¥
                        {Math.abs(d.amount).toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="text-[#e0dbd2] hover:text-red-400 transition-colors duration-300 p-1"
                          title="削除"
                        >
                          <Trash2 size={13} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {cashflow.details.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="p-8 text-center text-xs text-[#8a8a8a]/50 tracking-wider"
                    >
                      明細がありません。「項目追加」から追加してください。
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* フッター */}
          <div className="p-3 text-[10px] text-[#8a8a8a]/50 border-t border-[#eae6df] tracking-wider flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span>
              最終更新:{" "}
              {new Date(cashflow.updatedAt).toLocaleString("ja-JP")} | 更新者:
              木村 健一（経理）
            </span>
            <span>
              {cashflow.details.length}件の明細 | 収入{" "}
              {cashflow.details.filter((d) => d.amount > 0).length}件 ・ 支出{" "}
              {cashflow.details.filter((d) => d.amount < 0).length}件
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
