"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser, DEMO_STORES } from "@/lib/auth";
import { DEMO_RESERVATIONS } from "@/lib/demo-data";
import { User } from "@/types";
import { CalendarCheck, Users, Clock, Store, AlertTriangle, Filter } from "lucide-react";

export default function ReservationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-02-22");
  const [selectedStore, setSelectedStore] = useState("all");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const filtered = DEMO_RESERVATIONS.filter((r) => {
    if (r.date !== selectedDate) return false;
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    return true;
  });

  const totalGuests = filtered.reduce((s, r) => s + r.guestCount, 0);

  // 店舗ごとにグループ化
  const byStore = DEMO_STORES.map((store) => ({
    store,
    reservations: filtered.filter((r) => r.storeId === store.id),
  })).filter((g) => selectedStore === "all" || g.store.id === selectedStore);

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="予約状況" />
      <div className="p-8">
        {/* フィルター */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#8a8a8a]" strokeWidth={1.5} />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs border border-[#e0dbd2] rounded-sm px-3 py-1.5 text-[#2d2d2d] bg-[#fafaf7] focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
            />
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
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 text-center">
            <CalendarCheck size={18} className="mx-auto text-[#c4a265] mb-1" strokeWidth={1.5} />
            <div className="text-2xl font-light text-[#2d2d2d] tracking-wider">{filtered.length}</div>
            <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">予約組数</div>
          </div>
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 text-center">
            <Users size={18} className="mx-auto text-[#c4a265] mb-1" strokeWidth={1.5} />
            <div className="text-2xl font-light text-[#2d2d2d] tracking-wider">{totalGuests}</div>
            <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">予約人数</div>
          </div>
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 text-center">
            <AlertTriangle size={18} className="mx-auto text-[#c4a265] mb-1" strokeWidth={1.5} />
            <div className="text-2xl font-light text-[#2d2d2d] tracking-wider">
              {filtered.filter((r) => r.specialRequest).length}
            </div>
            <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">特記事項あり</div>
          </div>
        </div>

        {/* 店舗別予約 */}
        <div className="space-y-6">
          {byStore.map(({ store, reservations }) => (
            <div key={store.id} className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden">
              <div className="p-4 border-b border-[#e0dbd2] bg-[#fafaf7]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store size={14} className="text-[#c4a265]" strokeWidth={1.5} />
                    <h3 className="text-sm text-[#2d2d2d] tracking-wider">{store.name}</h3>
                  </div>
                  <span className="text-[10px] text-[#8a8a8a] tracking-wider">
                    {reservations.length}組 / {reservations.reduce((s, r) => s + r.guestCount, 0)}名
                  </span>
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="p-6 text-center text-[#8a8a8a] text-xs tracking-wider">予約はありません</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] text-[#8a8a8a] border-b border-[#eae6df] tracking-[0.15em]">
                      <th className="text-left p-3 font-normal">時間</th>
                      <th className="text-left p-3 font-normal">お名前</th>
                      <th className="text-center p-3 font-normal">人数</th>
                      <th className="text-left p-3 font-normal">席</th>
                      <th className="text-left p-3 font-normal">経由</th>
                      <th className="text-left p-3 font-normal">特記事項</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((r) => (
                        <tr key={r.id} className="border-b border-[#eae6df]/50 hover:bg-[#f5f3ee] transition-colors duration-300">
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-xs text-[#2d2d2d] tracking-wider">
                              <Clock size={11} className="text-[#8a8a8a]" strokeWidth={1.5} />
                              {r.time}
                            </div>
                          </td>
                          <td className="p-3 text-xs text-[#2d2d2d] tracking-wider">{r.guestName}</td>
                          <td className="p-3 text-center">
                            <span className="bg-[#c4a265]/10 text-[#c4a265] text-[10px] px-2 py-0.5 rounded-sm tracking-wider">
                              {r.guestCount}名
                            </span>
                          </td>
                          <td className="p-3 text-xs text-[#8a8a8a] tracking-wider">{r.tableNumber || "-"}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-sm tracking-wider ${
                              r.source === "tablecheck" ? "bg-green-50 text-green-700/70" :
                              r.source === "phone" ? "bg-[#c4a265]/10 text-[#c4a265]" : "bg-[#f5f3ee] text-[#8a8a8a]"
                            }`}>
                              {r.source === "tablecheck" ? "テーブルチェック" : r.source === "phone" ? "電話" : "ウォークイン"}
                            </span>
                          </td>
                          <td className="p-3 text-[10px] text-[#c4a265] max-w-xs truncate tracking-wider">
                            {r.specialRequest || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
