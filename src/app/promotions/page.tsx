"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_PROMOTIONS } from "@/lib/demo-data";
import { User, PromotionMaterial } from "@/types";
import { Camera, Video, FileText, FolderOpen, Plus } from "lucide-react";

const typeLabels: Record<string, string> = {
  menu_meeting: "メニュー会議",
  seasonal: "季節料理",
  special_course: "特別コース",
  dm: "DM",
  promo: "プロモ資料",
};

const typeColors: Record<string, string> = {
  menu_meeting: "bg-[#c4a265]/10 text-[#c4a265]",
  seasonal: "bg-green-50 text-green-700/70",
  special_course: "bg-[#f5f3ee] text-[#4a4a4a]",
  dm: "bg-[#c4a265]/10 text-[#b8860b]",
  promo: "bg-[#f5f3ee] text-[#8a8a8a]",
};

export default function PromotionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [filterType, setFilterType] = useState("all");
  const [selectedItem, setSelectedItem] = useState<PromotionMaterial | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const filtered = filterType === "all"
    ? DEMO_PROMOTIONS
    : DEMO_PROMOTIONS.filter((p) => p.type === filterType);

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="販促素材管理" />
      <div className="p-8">
        {/* フィルター */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
                filterType === "all" ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2]"
              }`}
            >
              すべて
            </button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1.5 text-[11px] rounded-sm transition-all duration-300 tracking-wider ${
                  filterType === key ? "bg-[#c4a265] text-white" : "bg-white text-[#8a8a8a] border border-[#e0dbd2]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] transition-colors duration-300 tracking-wider">
            <Plus size={14} strokeWidth={1.5} />
            新規追加
          </button>
        </div>

        {/* フォルダ構造＋コンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* フォルダツリー */}
          <div className="bg-white border border-[#e0dbd2] rounded-sm p-4">
            <h3 className="text-[11px] text-[#2d2d2d] mb-3 flex items-center gap-2 tracking-[0.15em]">
              <FolderOpen size={14} className="text-[#c4a265]" strokeWidth={1.5} />
              年度・月別
            </h3>
            <div className="space-y-1 text-xs">
              <div className="text-[#2d2d2d] pl-2 tracking-wider">2026年度</div>
              <div className="pl-6 space-y-0.5">
                {[3, 2, 1].map((m) => (
                  <div
                    key={m}
                    className="px-2 py-1 rounded-sm text-[11px] text-[#8a8a8a] hover:bg-[#f5f3ee] cursor-pointer transition-colors duration-300 tracking-wider"
                  >
                    {m}月
                    <span className="text-[#8a8a8a]/40 ml-1">
                      ({DEMO_PROMOTIONS.filter((p) => p.month === m).length})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* コンテンツグリッド */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`bg-white border text-left transition-all duration-300 hover:border-[#c4a265]/30 overflow-hidden rounded-sm ${
                    selectedItem?.id === item.id ? "border-[#c4a265]" : "border-[#e0dbd2]"
                  }`}
                >
                  {/* サムネイル */}
                  <div className="h-32 bg-gradient-to-br from-[#f5f3ee] to-[#eae6df] flex items-center justify-center">
                    <Camera size={28} className="text-[#e0dbd2]" strokeWidth={1} />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-sm tracking-wider ${typeColors[item.type]}`}>
                        {typeLabels[item.type]}
                      </span>
                    </div>
                    <h4 className="text-xs text-[#2d2d2d] mb-1 tracking-wider">{item.title}</h4>
                    <p className="text-[10px] text-[#8a8a8a] line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-[#8a8a8a]/60 tracking-wider">
                      {item.photos.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Camera size={9} strokeWidth={1.5} /> {item.photos.length}
                        </span>
                      )}
                      {item.videos.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Video size={9} strokeWidth={1.5} /> {item.videos.length}
                        </span>
                      )}
                      {item.documents.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <FileText size={9} strokeWidth={1.5} /> {item.documents.length}
                        </span>
                      )}
                      <span className="ml-auto">{item.year}/{item.month}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 詳細モーダル */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-lg w-full max-h-[80vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-[10px] px-2 py-0.5 rounded-sm tracking-wider ${typeColors[selectedItem.type]}`}>
                    {typeLabels[selectedItem.type]}
                  </span>
                  <button onClick={() => setSelectedItem(null)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300 text-xs">
                    閉じる
                  </button>
                </div>
                <h3 className="text-base font-medium text-[#2d2d2d] mb-2 tracking-wider">{selectedItem.title}</h3>
                <p className="text-xs text-[#4a4a4a] mb-4 leading-relaxed">{selectedItem.description}</p>

                <div className="space-y-3">
                  <div className="text-[10px] text-[#8a8a8a] tracking-wider">
                    {selectedItem.storeName} | {selectedItem.year}年{selectedItem.month}月
                  </div>
                  {selectedItem.photos.length > 0 && (
                    <div>
                      <div className="text-[10px] text-[#8a8a8a] mb-2 tracking-[0.15em]">写真 ({selectedItem.photos.length})</div>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.photos.map((_, i) => (
                          <div key={i} className="aspect-square bg-[#eae6df] rounded-sm flex items-center justify-center border border-[#e0dbd2]">
                            <Camera size={18} className="text-[#8a8a8a]/30" strokeWidth={1} />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.videos.length > 0 && (
                    <div>
                      <div className="text-[10px] text-[#8a8a8a] mb-2 tracking-[0.15em]">動画 ({selectedItem.videos.length})</div>
                      {selectedItem.videos.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#c4a265] tracking-wider">
                          <Video size={11} strokeWidth={1.5} />
                          {v.split("/").pop()}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedItem.documents.length > 0 && (
                    <div>
                      <div className="text-[10px] text-[#8a8a8a] mb-2 tracking-[0.15em]">資料 ({selectedItem.documents.length})</div>
                      {selectedItem.documents.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-[#c4a265] tracking-wider">
                          <FileText size={11} strokeWidth={1.5} />
                          {d.split("/").pop()}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
