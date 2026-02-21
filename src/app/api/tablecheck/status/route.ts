import { NextResponse } from "next/server";
import { TABLECHECK_CONFIG, STORE_TC_MAP } from "@/lib/tablecheck/config";

export async function GET() {
  return NextResponse.json({
    mode: TABLECHECK_CONFIG.isMockMode ? "mock" : "live",
    connectedStores: Object.keys(STORE_TC_MAP).length,
    storeMapping: Object.entries(STORE_TC_MAP).map(([internalId, tcId]) => ({
      internalId,
      tableCheckId: tcId,
    })),
  });
}
