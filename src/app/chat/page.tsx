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
      case "store": return <Hash size={13} className="text-[#c4a265]" strokeWidth={1.5} />;
      case "management": return <Users size={13} className="text-[#c4a265]" strokeWidth={1.5} />;
      case "direct": return <UserIcon size={13} className="text-[#8a8a8a]" strokeWidth={1.5} />;
      case "all": return <Users size={13} className="text-[#c4a265]" strokeWidth={1.5} />;
      default: return <Hash size={13} strokeWidth={1.5} />;
    }
  };

  return (
    <div className="bg-[#fafaf7] min-h-screen">
      <Header title="連絡" />
      <div className="p-8">
        <div className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden" style={{ height: "calc(100vh - 140px)" }}>
          <div className="flex h-full">
            {/* チャンネルリスト */}
            <div className="w-64 border-r border-[#e0dbd2] flex flex-col bg-[#fafaf7]">
              <div className="p-3 border-b border-[#e0dbd2]">
                <h3 className="text-[11px] text-[#2d2d2d] tracking-[0.15em]">チャンネル</h3>
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
                      className={`w-full p-3 text-left border-b border-[#eae6df]/50 transition-colors duration-300 ${
                        selectedChannel?.id === ch.id ? "bg-[#c4a265]/[0.06]" : "hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {channelIcon(ch.type)}
                          <span className={`text-xs tracking-wider ${selectedChannel?.id === ch.id ? "text-[#c4a265]" : "text-[#2d2d2d]"}`}>
                            {ch.name}
                          </span>
                        </div>
                        {unread > 0 && (
                          <span className="w-4 h-4 bg-red-500/80 text-white text-[9px] rounded-full flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                      </div>
                      {ch.lastMessage && (
                        <p className="text-[10px] text-[#8a8a8a]/60 mt-1 truncate pl-5">{ch.lastMessage}</p>
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
                  <div className="p-3 border-b border-[#e0dbd2] flex items-center gap-2 bg-[#fafaf7]">
                    {channelIcon(selectedChannel.type)}
                    <h3 className="text-xs text-[#2d2d2d] tracking-wider">{selectedChannel.name}</h3>
                    <span className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
                      ({selectedChannel.members.length}人)
                    </span>
                  </div>

                  {/* メッセージ一覧 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {channelMessages.map((msg) => {
                      const isOwn = msg.senderId === user.id;
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""}`}
                        >
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
                            isOwn
                              ? "bg-[#1a1a1a] text-[#c4a265] border border-[#c4a265]/30"
                              : "bg-[#f5f3ee] text-[#8a8a8a] border border-[#e0dbd2]"
                          }`}>
                            {msg.senderName.charAt(0)}
                          </div>
                          <div className={`max-w-md ${isOwn ? "text-right" : ""}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              {!isOwn && (
                                <span className="text-[10px] text-[#2d2d2d] tracking-wider">{msg.senderName}</span>
                              )}
                              <span className="text-[9px] text-[#8a8a8a]/50 tracking-wider">
                                {new Date(msg.createdAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <div className={`inline-block px-3 py-2 text-xs tracking-wider ${
                              isOwn
                                ? "bg-[#1a1a1a] text-white/90 rounded-sm rounded-tr-none"
                                : "bg-[#f5f3ee] text-[#2d2d2d] border border-[#eae6df] rounded-sm rounded-tl-none"
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 入力エリア */}
                  <div className="p-3 border-t border-[#e0dbd2] bg-[#fafaf7]">
                    <div className="flex gap-2">
                      <button className="p-2 text-[#8a8a8a] hover:text-[#c4a265] transition-colors duration-300">
                        <Paperclip size={16} strokeWidth={1.5} />
                      </button>
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="メッセージを入力..."
                        className="flex-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 flex items-center gap-1 tracking-wider"
                      >
                        <Send size={12} strokeWidth={1.5} />
                        送信
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-[#8a8a8a] bg-white">
                  <div className="text-center">
                    <MessageCircle size={32} className="mx-auto mb-2 opacity-15" strokeWidth={1} />
                    <p className="text-xs tracking-wider">チャンネルを選択してください</p>
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
