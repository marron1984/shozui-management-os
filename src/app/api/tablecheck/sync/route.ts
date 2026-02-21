import { NextRequest, NextResponse } from "next/server";
import { fetchAllStoreReservations } from "@/lib/tablecheck/client";
import { transformTCReservations } from "@/lib/tablecheck/transformer";

// 同期実行: 全店舗の予約を一括取得して返す
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const date = body.date || new Date().toISOString().split("T")[0];

    const tcReservations = await fetchAllStoreReservations(date);
    const reservations = transformTCReservations(tcReservations);

    return NextResponse.json({
      success: true,
      syncedAt: new Date().toISOString(),
      reservations,
      count: reservations.length,
      source: process.env.TABLECHECK_API_KEY ? "live" : "mock",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "同期に失敗しました", detail: String(error) },
      { status: 500 }
    );
  }
}
