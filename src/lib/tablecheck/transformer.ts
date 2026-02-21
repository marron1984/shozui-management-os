// ============================================================
// TableCheck連携 - データ変換
// ============================================================

import { Reservation } from "@/types";
import { TCReservation } from "./types";
import { TC_STORE_MAP } from "./config";
import { DEMO_STORES } from "@/lib/auth";

// TableCheck予約 → 社内Reservation型に変換
export function transformTCReservation(tc: TCReservation): Reservation {
  const storeId = TC_STORE_MAP[tc.shop_id] || tc.shop_id;
  const store = DEMO_STORES.find((s) => s.id === storeId);

  return {
    id: `tc_${tc.id}`,
    storeId,
    storeName: store?.name || "不明",
    date: tc.date,
    time: tc.start_time,
    endTime: tc.end_time,
    guestName: tc.customer.name,
    guestCount: tc.num_people,
    tableNumber: tc.table?.name,
    specialRequest: tc.notes,
    status: mapTCStatus(tc.status),
    source: "tablecheck",
    tableCheckId: tc.id,
    courseName: tc.course?.name,
    coursePrice: tc.course?.price,
    guestPhone: tc.customer.phone,
    guestEmail: tc.customer.email,
    syncedAt: new Date().toISOString(),
  };
}

// TableCheckステータス → 社内ステータスにマッピング
function mapTCStatus(
  tcStatus: TCReservation["status"]
): Reservation["status"] {
  switch (tcStatus) {
    case "confirmed":
      return "confirmed";
    case "cancelled":
      return "cancelled";
    case "completed":
      return "completed";
    case "no_show":
      return "no_show";
    case "seated":
      return "seated";
    default:
      return "confirmed";
  }
}

// 複数件の変換
export function transformTCReservations(
  tcReservations: TCReservation[]
): Reservation[] {
  return tcReservations.map(transformTCReservation);
}
