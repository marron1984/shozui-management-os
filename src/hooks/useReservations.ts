"use client";

import { useState, useCallback } from "react";
import { Reservation } from "@/types";

interface SyncState {
  status: "idle" | "syncing" | "success" | "error";
  lastSyncAt: string | null;
  message?: string;
  source?: "mock" | "live";
}

export function useReservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [syncState, setSyncState] = useState<SyncState>({
    status: "idle",
    lastSyncAt: null,
  });

  // 日付指定で予約を取得
  const fetchReservations = useCallback(async (date: string, storeId?: string) => {
    const params = new URLSearchParams({ date });
    if (storeId && storeId !== "all") params.set("storeId", storeId);

    const res = await fetch(`/api/tablecheck/reservations?${params.toString()}`);
    if (!res.ok) throw new Error("取得失敗");
    const data = await res.json();
    setReservations(data.reservations);
    return data;
  }, []);

  // 同期実行
  const sync = useCallback(async (date: string) => {
    setSyncState((prev) => ({ ...prev, status: "syncing" }));

    try {
      const res = await fetch("/api/tablecheck/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date }),
      });

      if (!res.ok) throw new Error("同期失敗");

      const data = await res.json();
      setReservations(data.reservations);
      setSyncState({
        status: "success",
        lastSyncAt: data.syncedAt,
        source: data.source,
        message: `${data.count}件の予約を取得しました`,
      });

      // 3秒後にステータスをidleに戻す
      setTimeout(() => {
        setSyncState((prev) => ({ ...prev, status: "idle" }));
      }, 3000);

      return data;
    } catch (error) {
      setSyncState({
        status: "error",
        lastSyncAt: null,
        message: String(error),
      });
      throw error;
    }
  }, []);

  return {
    reservations,
    syncState,
    fetchReservations,
    sync,
  };
}
