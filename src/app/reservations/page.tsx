"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SyncStatusBadge from "@/components/SyncStatusBadge";
import { getCurrentUser, DEMO_STORES } from "@/lib/auth";
import { useReservations } from "@/hooks/useReservations";
import { User, Reservation } from "@/types";
import { CalendarCheck, Users, Clock, Store, AlertTriangle, Filter, UtensilsCrossed, Phone, Mail } from "lucide-react";

export default function ReservationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState("2026-02-22");
  const [selectedStore, setSelectedStore] = useState("all");
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const { reservations, syncState, sync } = useReservations();
  const [localReservations, setLocalReservations] = useState<Reservation[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  // 初回ロード時に自動同期
  useEffect(() => {
    if (user && !hasLoaded) {
      sync(selectedDate).then(() => setHasLoaded(true)).catch(() => setHasLoaded(true));
    }
  }, [user, hasLoaded, selectedDate, sync]);

  // 同期結果を反映
  useEffect(() => {
    if (reservations.length > 0) {
      setLocalReservations(reservations);
    }
  }, [reservations]);

  if (!user) return null;

  const filtered = localReservations.filter((r) => {
    if (r.date !== selectedDate) return false;
    if (selectedStore !== "all" && r.storeId !== selectedStore) return false;
    return true;
  });

  const totalGuests = filtered.reduce((s, r) => s + r.guestCount, 0);
  const confirmedCount = filtered.filter((r) => r.status === "confirmed").length;

  // 店舗ごとにグループ化
  const byStore = DEMO_STORES.map((store) => ({
    store,
    reservations: filtered.filter((r) => r.storeId === store.id),
  })).filter((g) => selectedStore === "all" || g.store.id === selectedStore);

  const handleSync = () => {
    sync(selectedDate);
  };

  const handleDateChange = (newDate: string) => {
    setSelectedDate(newDate);
    setHasLoaded(false);
    setSelectedReservation(null);
  };

  const statusLabel = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": return "確定";
      case "cancelled": return "キャンセル";
      case "completed": return "完了";
      case "no_show": return "No Show";
      case "seated": return "着席中";
    }
  };

  const statusColor = (status: Reservation["status"]) => {
    switch (status) {
      case "confirmed": return "bg-green-50 text-green-700/70";
      case "cancelled": return "bg-red-50 text-red-600/70";
      case "completed": return "bg-[#f5f3ee] text-[#8a8a8a]";
      case "no_show": return "bg-red-50 text-red-500/70";
      case "seated": return "bg-[#c4a265]/10 text-[#c4a265]";
    }
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="予約状況" />
      <div className="p-8">
        {/* フィルター + 同期 */}
        <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={14} className="text-[#8a8a8a]" strokeWidth={1.5} />
              </div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
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
            <SyncStatusBadge
              status={syncState.status}
              lastSyncAt={syncState.lastSyncAt}
              source={syncState.source}
              message={syncState.message}
              onSync={handleSync}
            />
          </div>
        </div>

        {/* サマリー */}
        <div className="grid grid-cols-4 gap-4 mb-6">
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
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4 text-center">
            <UtensilsCrossed size={18} className="mx-auto text-[#c4a265] mb-1" strokeWidth={1.5} />
            <div className="text-2xl font-light text-[#2d2d2d] tracking-wider">
              {filtered.filter((r) => r.courseName).length}
            </div>
            <div className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">コース予約</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 店舗別予約一覧 */}
          <div className="lg:col-span-2 space-y-6">
            {byStore.map(({ store, reservations: storeReservations }) => (
              <div key={store.id} className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden">
                <div className="p-4 border-b border-[#e0dbd2] bg-[#fafaf7]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-[#c4a265]" strokeWidth={1.5} />
                      <h3 className="text-sm text-[#2d2d2d] tracking-wider">{store.name}</h3>
                    </div>
                    <span className="text-[10px] text-[#8a8a8a] tracking-wider">
                      {storeReservations.length}組 / {storeReservations.reduce((s, r) => s + r.guestCount, 0)}名
                    </span>
                  </div>
                </div>

                {storeReservations.length === 0 ? (
                  <div className="p-6 text-center text-[#8a8a8a] text-xs tracking-wider">予約はありません</div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="text-[10px] text-[#8a8a8a] border-b border-[#eae6df] tracking-[0.15em]">
                        <th className="text-left p-3 font-normal">時間</th>
                        <th className="text-left p-3 font-normal">お名前</th>
                        <th className="text-center p-3 font-normal">人数</th>
                        <th className="text-left p-3 font-normal">席</th>
                        <th className="text-left p-3 font-normal">コース</th>
                        <th className="text-left p-3 font-normal">状態</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storeReservations
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((r) => (
                          <tr
                            key={r.id}
                            onClick={() => setSelectedReservation(r)}
                            className={`border-b border-[#eae6df]/50 cursor-pointer transition-colors duration-300 ${
                              selectedReservation?.id === r.id ? "bg-[#c4a265]/[0.04]" : "hover:bg-[#f5f3ee]"
                            }`}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-1 text-xs text-[#2d2d2d] tracking-wider">
                                <Clock size={11} className="text-[#8a8a8a]" strokeWidth={1.5} />
                                {r.time}
                                {r.endTime && <span className="text-[#8a8a8a]/50">〜{r.endTime}</span>}
                              </div>
                            </td>
                            <td className="p-3 text-xs text-[#2d2d2d] tracking-wider">{r.guestName}</td>
                            <td className="p-3 text-center">
                              <span className="bg-[#c4a265]/10 text-[#c4a265] text-[10px] px-2 py-0.5 rounded-sm tracking-wider">
                                {r.guestCount}名
                              </span>
                            </td>
                            <td className="p-3 text-xs text-[#8a8a8a] tracking-wider">{r.tableNumber || "-"}</td>
                            <td className="p-3 text-[10px] text-[#4a4a4a] tracking-wider">{r.courseName || "-"}</td>
                            <td className="p-3">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-sm tracking-wider ${statusColor(r.status)}`}>
                                {statusLabel(r.status)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                )}
              </div>
            ))}
          </div>

          {/* 詳細パネル */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-5 h-fit sticky top-20">
            {selectedReservation ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${statusColor(selectedReservation.status)}`}>
                    {statusLabel(selectedReservation.status)}
                  </span>
                  {selectedReservation.tableCheckId && (
                    <span className="text-[9px] text-[#8a8a8a]/40 font-mono tracking-wider">
                      TC: {selectedReservation.tableCheckId}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider mb-4">{selectedReservation.guestName}</h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">日時</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">
                        {selectedReservation.date} {selectedReservation.time}
                        {selectedReservation.endTime && `〜${selectedReservation.endTime}`}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">人数</label>
                      <p className="text-lg font-light text-[#2d2d2d] tracking-wider">{selectedReservation.guestCount}名</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">店舗</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{selectedReservation.storeName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">席</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">{selectedReservation.tableNumber || "未指定"}</p>
                    </div>
                  </div>

                  {selectedReservation.courseName && (
                    <div className="bg-[#fafaf7] border border-[#eae6df] rounded-sm p-3">
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em] flex items-center gap-1">
                        <UtensilsCrossed size={10} strokeWidth={1.5} />
                        コース
                      </label>
                      <p className="text-xs text-[#2d2d2d] mt-1 tracking-wider">{selectedReservation.courseName}</p>
                      {selectedReservation.coursePrice && (
                        <p className="text-sm font-light text-[#c4a265] mt-0.5 tracking-wider">
                          ¥{selectedReservation.coursePrice.toLocaleString()} / 人
                        </p>
                      )}
                    </div>
                  )}

                  {(selectedReservation.guestPhone || selectedReservation.guestEmail) && (
                    <div>
                      <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">連絡先</label>
                      {selectedReservation.guestPhone && (
                        <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider flex items-center gap-1">
                          <Phone size={10} strokeWidth={1.5} className="text-[#8a8a8a]" />
                          {selectedReservation.guestPhone}
                        </p>
                      )}
                      {selectedReservation.guestEmail && (
                        <p className="text-xs text-[#4a4a4a] mt-0.5 tracking-wider flex items-center gap-1">
                          <Mail size={10} strokeWidth={1.5} className="text-[#8a8a8a]" />
                          {selectedReservation.guestEmail}
                        </p>
                      )}
                    </div>
                  )}

                  {selectedReservation.specialRequest && (
                    <div className="bg-[#c4a265]/[0.04] border border-[#c4a265]/20 rounded-sm p-3">
                      <label className="text-[10px] text-[#c4a265] tracking-[0.15em]">特記事項</label>
                      <p className="text-xs text-[#4a4a4a] mt-1 leading-relaxed">{selectedReservation.specialRequest}</p>
                    </div>
                  )}

                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">経由</label>
                    <p className="text-xs text-[#4a4a4a] mt-1 tracking-wider">
                      {selectedReservation.source === "tablecheck" ? "テーブルチェック" :
                       selectedReservation.source === "phone" ? "電話予約" : "ウォークイン"}
                    </p>
                  </div>

                  {selectedReservation.syncedAt && (
                    <div className="text-[9px] text-[#8a8a8a]/40 tracking-wider border-t border-[#eae6df] pt-3">
                      同期: {new Date(selectedReservation.syncedAt).toLocaleString("ja-JP")}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center text-[#8a8a8a] py-8">
                <CalendarCheck size={28} className="mx-auto mb-2 opacity-20" strokeWidth={1} />
                <p className="text-xs tracking-wider">予約を選択してください</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
