// ============================================================
// TableCheck連携 - APIクライアント
// ============================================================

import { TABLECHECK_CONFIG, STORE_TC_MAP } from "./config";
import { TCReservation, TCReservationListResponse } from "./types";
import { MOCK_TC_RESERVATIONS } from "./mock-data";

// モックモードの場合はモックデータを返す
// ライブモードの場合はTableCheck APIを呼び出す
export async function fetchReservations(params: {
  storeId?: string;
  date?: string;
}): Promise<TCReservationListResponse> {
  if (TABLECHECK_CONFIG.isMockMode) {
    return fetchMockReservations(params);
  }
  return fetchLiveReservations(params);
}

// モックデータから取得
async function fetchMockReservations(params: {
  storeId?: string;
  date?: string;
}): Promise<TCReservationListResponse> {
  // 少し遅延を入れてAPIコールを模擬
  await new Promise((resolve) => setTimeout(resolve, 300));

  let filtered = [...MOCK_TC_RESERVATIONS];

  if (params.storeId) {
    const tcShopId = STORE_TC_MAP[params.storeId];
    if (tcShopId) {
      filtered = filtered.filter((r) => r.shop_id === tcShopId);
    }
  }

  if (params.date) {
    filtered = filtered.filter((r) => r.date === params.date);
  }

  return {
    reservations: filtered,
    total: filtered.length,
    page: 1,
    per_page: 100,
  };
}

// ライブAPIから取得（将来実装）
async function fetchLiveReservations(params: {
  storeId?: string;
  date?: string;
}): Promise<TCReservationListResponse> {
  const tcShopId = params.storeId
    ? STORE_TC_MAP[params.storeId]
    : undefined;

  const searchParams = new URLSearchParams();
  if (tcShopId) searchParams.set("shop_id", tcShopId);
  if (params.date) searchParams.set("date", params.date);

  const res = await fetch(
    `${TABLECHECK_CONFIG.baseUrl}/reservations?${searchParams.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${TABLECHECK_CONFIG.apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!res.ok) {
    throw new Error(`TableCheck API error: ${res.status}`);
  }

  return res.json();
}

// 全店舗の予約を一括取得
export async function fetchAllStoreReservations(
  date?: string
): Promise<TCReservation[]> {
  const storeIds = Object.keys(STORE_TC_MAP);
  const results = await Promise.all(
    storeIds.map((storeId) => fetchReservations({ storeId, date }))
  );
  return results.flatMap((r) => r.reservations);
}
