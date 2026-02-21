"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { getCurrentUser } from "@/lib/auth";
import { DEMO_CHANNELS, DEMO_MESSAGES } from "@/lib/demo-data";
import { User, ChatChannel, ChatMessage, ROLE_LABELS } from "@/types";
import { MessageCircle, Send, Hash, Users, User as UserIcon, Paperclip } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(DEMO_MESSAGES);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    // 自動的に最初のチャンネルを選択
    const userChannels = DEMO_CHANNELS.filter((ch) => ch.members.includes(u.id));
    if (userChannels.length > 0) {
      setSelectedChannel(userChannels[0]);
    }
  }, [router]);

  if (!user) return null;

  const userChannels = DEMO_CHANNELS.filter((ch) => ch.members.includes(user.id));
  const channelMessages = selectedChannel
    ? messages.filter((m) => m.channelId === selectedChannel.id)
    : [];

  const handleSend = () => {
    if (!newMessage.trim() || !selectedChannel) return;
    const msg: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      channelId: selectedChannel.id,
      content: newMessage,
      readBy: [user.id],
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, msg]);
    setNewMessage("");
  };

  const channelIcon = (type: string) => {
    switch (type) {
      case "store": return <Hash size={14} className="text-green-500" />;
      case "management": return <Users size={14} className="text-blue-500" />;
      case "direct": return <UserIcon size={14} className="text-purple-500" />;
      case "all": return <Users size={14} className="text-amber-500" />;
      default: return <Hash size={14} />;
    }
  };

  return (
    <div>
      <Header title="チャット" />
      <div className="p-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
          <div className="flex h-full">
            {/* チャンネルリスト */}
            <div className="w-64 border-r border-gray-100 flex flex-col">
              <div className="p-3 border-b border-gray-100">
                <h3 className="font-bold text-sm text-gray-700">チャンネル</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {userChannels.map((ch) => {
                  const unread = messages.filter(
                    (m) => m.channelId === ch.id && !m.readBy.includes(user.id)
                  ).length;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setSelectedChannel(ch)}
                      className={`w-full p-3 text-left border-b border-gray-50 transition-colors ${
                        selectedChannel?.id === ch.id ? "bg-amber-50" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {channelIcon(ch.type)}
                          <span className={`text-sm ${selectedChannel?.id === ch.id ? "font-bold text-amber-700" : "text-gray-700"}`}>
                            {ch.name}
                          </span>
                        </div>
                        {unread > 0 && (
                          <span className="w-5 h-5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      {ch.lastMessage && (
                        <p className="text-[10px] text-gray-400 mt-1 truncate pl-5">{ch.lastMessage}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* メッセージエリア */}
            <div className="flex-1 flex flex-col">
              {selectedChannel ? (
                <>
                  {/* チャンネルヘッダー */}
                  <div className="p-3 border-b border-gray-100 flex items-center gap-2">
                    {channelIcon(selectedChannel.type)}
                    <h3 className="font-bold text-sm text-gray-800">{selectedChannel.name}</h3>
                    <span className="text-xs text-gray-400">
                      ({selectedChannel.members.length}人)
                    </span>
                  </div>

                  {/* メッセージ一覧 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {channelMessages.map((msg) => {
                      const isOwn = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isOwn
                              ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                              : "bg-gray-200 text-gray-600"
                          }`}>
                            {msg.senderName.charAt(0)}
                          </div>
                          <div className={`max-w-md ${isOwn ? "text-right" : ""}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              {!isOwn && (
                                <span className="text-xs font-medium text-gray-700">{msg.senderName}</span>
                              )}
                              <span className="text-[10px] text-gray-400">
                                {new Date(msg.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className={`inline-block px-3 py-2 rounded-xl text-sm ${
                              isOwn
                                ? "bg-amber-500 text-white rounded-tr-sm"
                                : "bg-gray-100 text-gray-700 rounded-tl-sm"
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 入力エリア */}
                  <div className="p-3 border-t border-gray-100">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <Paperclip size={18} />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-40 transition-colors flex items-center gap-1"
                      >
                        <Send size={14} />
                        送信
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <MessageCircle size={40} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">チャンネルを選択してください</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
