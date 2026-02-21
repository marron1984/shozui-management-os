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
    <div>
      <Header title="予約状況" />
      <div className="p-6">
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <select
              value={selectedStore}
              onChange={(e) => setSelectedStore(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <CalendarCheck size={20} className="mx-auto text-green-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">{filtered.length}</div>
            <div className="text-xs text-gray-400">予約組数</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <Users size={20} className="mx-auto text-blue-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">{totalGuests}</div>
            <div className="text-xs text-gray-400">予約人数</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
            <AlertTriangle size={20} className="mx-auto text-amber-500 mb-1" />
            <div className="text-2xl font-bold text-gray-800">
              {filtered.filter((r) => r.specialRequest).length}
            </div>
            <div className="text-xs text-gray-400">特記事項あり</div>
          </div>
        </div>

        {/* 店舗別予約 */}
        <div className="space-y-6">
          {byStore.map(({ store, reservations }) => (
            <div key={store.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Store size={16} className="text-amber-500" />
                    <h3 className="font-bold text-gray-800">{store.name}</h3>
                  </div>
                  <span className="text-xs text-gray-400">
                    {reservations.length}組 / {reservations.reduce((s, r) => s + r.guestCount, 0)}名
                  </span>
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="p-6 text-center text-gray-400 text-sm">予約はありません</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="text-left p-3">時間</th>
                      <th className="text-left p-3">お名前</th>
                      <th className="text-center p-3">人数</th>
                      <th className="text-left p-3">席</th>
                      <th className="text-left p-3">経由</th>
                      <th className="text-left p-3">特記事項</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations
                      .sort((a, b) => a.time.localeCompare(b.time))
                      .map((r) => (
                        <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="p-3">
                            <div className="flex items-center gap-1 text-sm text-gray-700">
                              <Clock size={12} className="text-gray-400" />
                              {r.time}
                            </div>
                          </td>
                          <td className="p-3 text-sm font-medium text-gray-800">{r.guestName}</td>
                          <td className="p-3 text-center">
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                              {r.guestCount}名
                            </span>
                          </td>
                          <td className="p-3 text-sm text-gray-500">{r.tableNumber || "-"}</td>
                          <td className="p-3">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                              r.source === "tablecheck" ? "bg-green-100 text-green-700" :
                              r.source === "phone" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                            }`}>
                              {r.source === "tablecheck" ? "テーブルチェック" : r.source === "phone" ? "電話" : "ウォークイン"}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-amber-600 max-w-xs truncate">
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
