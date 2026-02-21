// ============================================================
// 祥瑞マネジメントOS - 認証・権限管理
// ============================================================

import { Role, User } from "@/types";

// 権限チェック関数群

// 社長レベル: 全て閲覧可能
export function isPresident(role: Role): boolean {
  return role === "president";
}

// 取締役以上
export function isDirectorOrAbove(role: Role): boolean {
  return ["president", "director"].includes(role);
}

// 執行役員以上（月次報告書等の閲覧権限）
export function isExecutiveOrAbove(role: Role): boolean {
  return ["president", "director", "executive"].includes(role);
}

// 店長・女将以上（採用判断、履歴書閲覧等）
export function isManagerOrAbove(role: Role): boolean {
  return ["president", "director", "executive", "store_manager", "okami"].includes(role);
}

// 経理権限（資金繰り表、給与閲覧）
export function isAccounting(role: Role): boolean {
  return role === "accounting";
}

// 給与閲覧権限: 社長 + 経理のみ
export function canViewSalary(role: Role): boolean {
  return role === "president" || role === "accounting";
}

// 稟議書決済権限: 社長（将来: 取締役も）
export function canApproveRequest(role: Role): boolean {
  return role === "president" || role === "director";
}

// 日報閲覧: ID登録した全社員
export function canViewDailyReports(role: Role): boolean {
  return true; // 全社員閲覧可
}

// 月次報告書閲覧: 執行役員以上
export function canViewMonthlyReports(role: Role): boolean {
  return isExecutiveOrAbove(role);
}

// 採用情報閲覧: 店長・女将以上
export function canViewRecruitment(role: Role): boolean {
  return isManagerOrAbove(role);
}

// 資金繰り表閲覧: 社長 + 経理
export function canViewCashFlow(role: Role): boolean {
  return role === "president" || role === "accounting";
}

// 意見・提案の対応: 店長・女将以上
export function canRespondToSuggestions(role: Role): boolean {
  return isManagerOrAbove(role);
}

// デモ用ユーザーデータ
export const DEMO_USERS: User[] = [
  {
    id: "u1",
    name: "榎本 泰之",
    email: "enomoto@shozui.co.jp",
    role: "president",
    storeId: "all",
    position: "代表取締役社長",
    photoUrl: "",
    salary: 1500000,
    joinDate: "2015-01-01",
    phone: "090-1234-5678",
    status: "active",
  },
  {
    id: "u2",
    name: "田中 次郎",
    email: "tanaka@shozui.co.jp",
    role: "executive",
    storeId: "s1",
    position: "執行役員",
    photoUrl: "",
    joinDate: "2016-04-01",
    phone: "090-2345-6789",
    status: "active",
  },
  {
    id: "u3",
    name: "木村 健一",
    email: "kimura@shozui.co.jp",
    role: "accounting",
    storeId: "all",
    position: "経理",
    photoUrl: "",
    joinDate: "2017-06-01",
    phone: "090-3456-7890",
    status: "active",
  },
  {
    id: "u4",
    name: "山田 花子",
    email: "yamada@shozui.co.jp",
    role: "store_manager",
    storeId: "s1",
    position: "店長",
    photoUrl: "",
    joinDate: "2018-03-01",
    phone: "090-4567-8901",
    status: "active",
  },
  {
    id: "u5",
    name: "佐藤 美咲",
    email: "sato@shozui.co.jp",
    role: "okami",
    storeId: "s1",
    position: "女将",
    photoUrl: "",
    joinDate: "2018-03-01",
    phone: "090-5678-9012",
    status: "active",
  },
  {
    id: "u6",
    name: "鈴木 一郎",
    email: "suzuki@shozui.co.jp",
    role: "store_manager",
    storeId: "s2",
    position: "店長",
    photoUrl: "",
    joinDate: "2019-01-01",
    phone: "090-6789-0123",
    status: "active",
  },
  {
    id: "u7",
    name: "高橋 恵",
    email: "takahashi@shozui.co.jp",
    role: "okami",
    storeId: "s2",
    position: "女将",
    photoUrl: "",
    joinDate: "2019-01-01",
    phone: "090-7890-1234",
    status: "active",
  },
  {
    id: "u8",
    name: "渡辺 剛",
    email: "watanabe@shozui.co.jp",
    role: "employee",
    storeId: "s1",
    position: "ホールスタッフ",
    photoUrl: "",
    joinDate: "2020-04-01",
    phone: "090-8901-2345",
    status: "active",
  },
];

// デモ用店舗データ
export const DEMO_STORES = [
  { id: "s1", name: "祥瑞 本店", address: "東京都港区赤坂1-1-1", phone: "03-1234-5678", createdAt: "2015-01-01" },
  { id: "s2", name: "祥瑞 銀座店", address: "東京都中央区銀座2-2-2", phone: "03-2345-6789", createdAt: "2018-06-01" },
  { id: "s3", name: "祥瑞 新宿店", address: "東京都新宿区西新宿3-3-3", phone: "03-3456-7890", createdAt: "2020-09-01" },
  { id: "s4", name: "祥瑞 渋谷店", address: "東京都渋谷区渋谷4-4-4", phone: "03-4567-8901", createdAt: "2022-03-01" },
];

// セッション管理（デモ用）
let currentUser: User | null = null;

export function login(userId: string): User | null {
  const user = DEMO_USERS.find((u) => u.id === userId);
  if (user) {
    currentUser = user;
    if (typeof window !== "undefined") {
      localStorage.setItem("shozui_user", JSON.stringify(user));
    }
  }
  return user || null;
}

export function logout(): void {
  currentUser = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("shozui_user");
  }
}

export function getCurrentUser(): User | null {
  if (currentUser) return currentUser;
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("shozui_user");
    if (stored) {
      currentUser = JSON.parse(stored);
      return currentUser;
    }
  }
  return null;
}
