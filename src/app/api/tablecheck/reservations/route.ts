import { NextRequest, NextResponse } from "next/server";
import { fetchReservations } from "@/lib/tablecheck/client";
import { transformTCReservations } from "@/lib/tablecheck/transformer";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId") || undefined;
  const date = searchParams.get("date") || undefined;

  try {
    const tcResponse = await fetchReservations({ storeId, date });
    const reservations = transformTCReservations(tcResponse.reservations);

    return NextResponse.json({
      reservations,
      total: tcResponse.total,
      source: process.env.TABLECHECK_API_KEY ? "live" : "mock",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "予約データの取得に失敗しました", detail: String(error) },
      { status: 500 }
    );
  }
}
