"use client";

import { RefreshCw, CheckCircle, AlertCircle, Cloud, CloudOff } from "lucide-react";

interface SyncStatusBadgeProps {
  status: "idle" | "syncing" | "success" | "error";
  lastSyncAt: string | null;
  source?: "mock" | "live";
  message?: string;
  onSync: () => void;
}

export default function SyncStatusBadge({ status, lastSyncAt, source, message, onSync }: SyncStatusBadgeProps) {
  return (
    <div className="flex items-center gap-3">
      {/* モード表示 */}
      <div className="flex items-center gap-1 text-[10px] tracking-wider">
        {source === "live" ? (
          <>
            <Cloud size={11} className="text-green-600/70" strokeWidth={1.5} />
            <span className="text-green-700/70">Live</span>
          </>
        ) : (
          <>
            <CloudOff size={11} className="text-[#8a8a8a]/60" strokeWidth={1.5} />
            <span className="text-[#8a8a8a]/60">Mock</span>
          </>
        )}
      </div>

      {/* 最終同期時刻 */}
      {lastSyncAt && (
        <span className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
          最終同期: {new Date(lastSyncAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
        </span>
      )}

      {/* ステータスメッセージ */}
      {status === "success" && message && (
        <span className="text-[10px] text-green-600/70 flex items-center gap-1 tracking-wider">
          <CheckCircle size={10} strokeWidth={1.5} />
          {message}
        </span>
      )}
      {status === "error" && (
        <span className="text-[10px] text-red-500/70 flex items-center gap-1 tracking-wider">
          <AlertCircle size={10} strokeWidth={1.5} />
          同期エラー
        </span>
      )}

      {/* 同期ボタン */}
      <button
        onClick={onSync}
        disabled={status === "syncing"}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-50 transition-colors duration-300 tracking-wider"
      >
        <RefreshCw size={12} strokeWidth={1.5} className={status === "syncing" ? "animate-spin" : ""} />
        {status === "syncing" ? "同期中..." : "TC同期"}
      </button>
    </div>
  );
}
