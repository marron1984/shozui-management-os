// ============================================================
// 祥瑞マネジメントOS - 型定義
// ============================================================

// 役職レベル（権限管理に使用）
export type Role =
  | "president"       // 社長（榎本代表）
  | "director"        // 取締役
  | "executive"       // 執行役員
  | "store_manager"   // 店長
  | "okami"           // 女将
  | "accounting"      // 経理（総務経理）
  | "employee"        // 一般社員
  | "part_time";      // アルバイト

export type RoleLabel = {
  [key in Role]: string;
};

export const ROLE_LABELS: RoleLabel = {
  president: "社長",
  director: "取締役",
  executive: "執行役員",
  store_manager: "店長",
  okami: "女将",
  accounting: "経理",
  employee: "社員",
  part_time: "アルバイト",
};

// 店舗
export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  createdAt: string;
}

// ユーザー（社員）
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  storeId: string;
  position: string;        // ポジション
  photoUrl: string;        // 顔写真
  salary?: number;         // 給与（社長・総務経理のみ閲覧可）
  joinDate: string;
  phone: string;
  emergencyContact?: string;
  status: "active" | "inactive";
}

// 日報
export interface DailyReport {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  hallReport: string;       // ホール側日報
  kitchenReport: string;    // 厨房側日報
  hallPhotos: string[];     // ホール側写真
  kitchenPhotos: string[];  // 厨房側写真
  submittedBy: string;
  submittedAt: string;
  folder: string;           // 保存フォルダパス
}

// 月次報告書
export interface MonthlyReport {
  id: string;
  storeId: string;
  storeName: string;
  year: number;
  month: number;
  revenue: number;
  expenses: number;
  profit: number;
  customerCount: number;
  snsReport?: string;        // SNSレポート
  fileUrl: string;
  submittedBy: string;
  submittedAt: string;
}

// 稟議書
export interface ApprovalRequest {
  id: string;
  title: string;
  description: string;
  amount: number;
  category: string;
  requestedBy: string;
  requestedByName: string;
  storeId: string;
  storeName: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  comment?: string;
  createdAt: string;
  attachments: string[];
}

// 資金繰り表
export interface CashFlow {
  id: string;
  year: number;
  month: number;
  openingBalance: number;
  income: number;
  expenses: number;
  closingBalance: number;
  details: CashFlowDetail[];
  updatedBy: string;
  updatedAt: string;
}

export interface CashFlowDetail {
  category: string;
  amount: number;
  description: string;
  date: string;
}

// 意見・提案
export interface Suggestion {
  id: string;
  employeeId: string;
  employeeName: string;
  storeId: string;
  storeName: string;
  title: string;
  content: string;
  status: "new" | "reviewing" | "responded" | "resolved";
  response?: string;
  respondedBy?: string;
  respondedByName?: string;
  respondedAt?: string;
  createdAt: string;
}

// 採用応募
export interface JobApplication {
  id: string;
  name: string;
  phone: string;
  email: string;
  type: "full_time" | "part_time";  // 社員 or アルバイト
  resumeUrl: string;
  appliedStoreId: string;
  appliedStoreName: string;
  status: "pending" | "interviewing" | "accepted" | "rejected";
  reviewedBy?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  comment?: string;
  createdAt: string;
}

// プロモーション素材
export interface PromotionMaterial {
  id: string;
  type: "menu_meeting" | "seasonal" | "special_course" | "dm" | "promo";
  title: string;
  description: string;
  storeId: string;
  storeName: string;
  year: number;
  month: number;
  photos: string[];
  videos: string[];
  documents: string[];
  createdBy: string;
  createdAt: string;
}

// 予約情報（テーブルチェック連携）
export interface Reservation {
  id: string;
  storeId: string;
  storeName: string;
  date: string;
  time: string;
  guestName: string;
  guestCount: number;
  tableNumber?: string;
  specialRequest?: string;
  status: "confirmed" | "cancelled" | "completed";
  source: "tablecheck" | "phone" | "walk_in";
}

// チャットメッセージ
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  channelId: string;
  content: string;
  attachments?: string[];
  readBy: string[];
  createdAt: string;
}

export interface ChatChannel {
  id: string;
  name: string;
  type: "store" | "management" | "direct" | "all";
  members: string[];
  lastMessage?: string;
  lastMessageAt?: string;
}

// 通知
export interface Notification {
  id: string;
  userId: string;
  type: "daily_report" | "monthly_report" | "approval" | "suggestion" | "recruitment" | "chat" | "general";
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}
