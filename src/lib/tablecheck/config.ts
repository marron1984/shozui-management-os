// ============================================================
// TableCheck連携 - 設定
// ============================================================

// 環境変数 TABLECHECK_API_KEY が設定されていればライブモード
export const TABLECHECK_CONFIG = {
  apiKey: process.env.TABLECHECK_API_KEY || "",
  baseUrl: "https://api.tablecheck.com/api/web_booking/v1",
  isMockMode: !process.env.TABLECHECK_API_KEY,
} as const;

// 社内店舗ID → TableCheck店舗IDの対応表
// 将来的にTableCheck契約時に実際のIDを設定
export const STORE_TC_MAP: Record<string, string> = {
  s1: "tc_honten_001",       // 祥瑞 本店
  s2: "tc_ginza_001",        // 祥瑞 銀座店
  s3: "tc_shinjuku_001",     // 祥瑞 新宿店
  s4: "tc_shibuya_001",      // 祥瑞 渋谷店
};

// TableCheck店舗ID → 社内店舗IDの逆引き
export const TC_STORE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STORE_TC_MAP).map(([k, v]) => [v, k])
);
