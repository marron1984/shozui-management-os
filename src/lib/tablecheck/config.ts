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
  s1: "tc_okamino_001",      // 大嵓埜
  s2: "tc_shinsaibashi_001", // 心斎橋 禅園
  s3: "tc_nishiumeda_001",   // 西梅田 禅園
  s4: "tc_oden_001",         // おでん×スタンド
};

// TableCheck店舗ID → 社内店舗IDの逆引き
export const TC_STORE_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(STORE_TC_MAP).map(([k, v]) => [v, k])
);
