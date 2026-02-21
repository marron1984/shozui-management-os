"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_PROMOTIONS } from "@/lib/demo-data";
import { User, PromotionMaterial } from "@/types";
import { Image as ImageIcon, Camera, Video, FileText, FolderOpen, Filter, Plus } from "lucide-react";

const typeLabels: Record<string, string> = {
  menu_meeting: "メニュー会議",
  seasonal: "季節料理",
  special_course: "特別コース",
  dm: "DM",
  promo: "プロモ資料",
};

const typeColors: Record<string, string> = {
  menu_meeting: "bg-blue-100 text-blue-700",
  seasonal: "bg-green-100 text-green-700",
  special_course: "bg-purple-100 text-purple-700",
  dm: "bg-orange-100 text-orange-700",
  promo: "bg-pink-100 text-pink-700",
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
    <div>
      <Header title="プロモーション素材管理" />
      <div className="p-6">
        {/* フィルター */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilterType("all")}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filterType === "all" ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200"
              }`}
            >
              すべて
            </button>
            {Object.entries(typeLabels).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setFilterType(key)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  filterType === key ? "bg-amber-500 text-white" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600">
            <Plus size={16} />
            新規追加
          </button>
        </div>

        {/* フォルダ構造＋コンテンツ */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* フォルダツリー */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h3 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2">
              <FolderOpen size={16} className="text-amber-500" />
              年度・月別
            </h3>
            <div className="space-y-1 text-sm">
              <div className="font-medium text-gray-600 pl-2">2026年度</div>
              <div className="pl-6 space-y-0.5">
                {[3, 2, 1].map((m) => (
                  <div
                    key={m}
                    className="px-2 py-1 rounded text-xs text-gray-500 hover:bg-gray-50 cursor-pointer"
                  >
                    {m}月
                    <span className="text-gray-300 ml-1">
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
                  className={`bg-white rounded-xl shadow-sm border text-left transition-all hover:shadow-md overflow-hidden ${
                    selectedItem?.id === item.id ? "border-amber-500 ring-1 ring-amber-500" : "border-gray-100"
                  }`}
                >
                  {/* サムネイル */}
                  <div className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <Camera size={32} className="text-gray-300" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded ${typeColors[item.type]}`}>
                        {typeLabels[item.type]}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm text-gray-800 mb-1">{item.title}</h4>
                    <p className="text-[10px] text-gray-400 line-clamp-1">{item.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-gray-400">
                      {item.photos.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Camera size={9} /> {item.photos.length}
                        </span>
                      )}
                      {item.videos.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Video size={9} /> {item.videos.length}
                        </span>
                      )}
                      {item.documents.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <FileText size={9} /> {item.documents.length}
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
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedItem(null)}>
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs px-2 py-0.5 rounded ${typeColors[selectedItem.type]}`}>
                    {typeLabels[selectedItem.type]}
                  </span>
                  <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{selectedItem.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{selectedItem.description}</p>

                <div className="space-y-3">
                  <div className="text-xs text-gray-400">
                    {selectedItem.storeName} | {selectedItem.year}年{selectedItem.month}月
                  </div>
                  {selectedItem.photos.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">写真 ({selectedItem.photos.length})</div>
                      <div className="grid grid-cols-3 gap-2">
                        {selectedItem.photos.map((_, i) => (
                          <div key={i} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                            <Camera size={20} className="text-gray-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedItem.videos.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">動画 ({selectedItem.videos.length})</div>
                      {selectedItem.videos.map((v, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                          <Video size={12} />
                          {v.split("/").pop()}
                        </div>
                      ))}
                    </div>
                  )}
                  {selectedItem.documents.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-2">資料 ({selectedItem.documents.length})</div>
                      {selectedItem.documents.map((d, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-blue-600">
                          <FileText size={12} />
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
