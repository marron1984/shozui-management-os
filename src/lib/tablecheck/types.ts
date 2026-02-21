// ============================================================
// TableCheck連携 - API型定義
// ============================================================

// TableCheck API レスポンス型（Web Booking API v1準拠）
export interface TCReservation {
  id: string;
  shop_id: string;
  date: string;           // "YYYY-MM-DD"
  start_time: string;     // "HH:MM"
  end_time?: string;      // "HH:MM"
  num_people: number;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  table?: {
    name: string;
  };
  course?: {
    name: string;
    price: number;
  };
  notes?: string;
  status: "confirmed" | "cancelled" | "completed" | "no_show" | "seated";
  created_at: string;
  updated_at: string;
}

export interface TCReservationListResponse {
  reservations: TCReservation[];
  total: number;
  page: number;
  per_page: number;
}

// 同期ステータス
export interface SyncStatus {
  lastSyncAt: string | null;
  status: "idle" | "syncing" | "success" | "error";
  message?: string;
  reservationCount?: number;
}
