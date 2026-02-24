"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useMobileMenu } from "@/components/ClientLayout";
import { getCurrentUser, DEMO_USERS } from "@/lib/auth";
import { DEMO_CHANNELS, DEMO_MESSAGES } from "@/lib/demo-data";
import { usePersistedState } from "@/lib/usePersistedState";
import { User, ChatChannel, ChatMessage, ROLE_LABELS } from "@/types";
import { MessageCircle, Send, Hash, Users, User as UserIcon, Paperclip, ChevronLeft, Plus, X } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const { openMobileMenu } = useMobileMenu();
  const [user, setUser] = useState<User | null>(null);
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = usePersistedState("chat_messages", DEMO_MESSAGES);
  const [channels, setChannels] = usePersistedState("chat_channels", DEMO_CHANNELS);
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [showNewDM, setShowNewDM] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelMembers, setNewChannelMembers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // チャンネル選択時に既読にする
  const markChannelRead = useCallback((channelId: string, userId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.channelId === channelId && !m.readBy.includes(userId)
          ? { ...m, readBy: [...m.readBy, userId] }
          : m
      )
    );
  }, []);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);
    // 自動的に最初のチャンネルを選択
    const userChs = DEMO_CHANNELS.filter((ch) => ch.members.includes(u.id));
    if (userChs.length > 0) {
      setSelectedChannel(userChs[0]);
      markChannelRead(userChs[0].id, u.id);
    }
  }, [router, markChannelRead]);

  if (!user) return null;

  const userChannels = channels.filter((ch) => ch.members.includes(user.id));
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
    // チャンネルのlastMessageを更新
    setChannels(channels.map((ch) =>
      ch.id === selectedChannel.id ? { ...ch, lastMessage: newMessage } : ch
    ));
    setNewMessage("");
    setTimeout(scrollToBottom, 100);
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    const members = [...new Set([user.id, ...newChannelMembers])];
    const newCh: ChatChannel = {
      id: `ch${Date.now()}`,
      name: newChannelName.trim(),
      type: "management",
      members,
      lastMessage: "",
    };
    setChannels([...channels, newCh]);
    setSelectedChannel(newCh);
    setShowNewChannel(false);
    setNewChannelName("");
    setNewChannelMembers([]);
  };

  const handleStartDM = (targetUser: User) => {
    // 既存のDMチャンネルを探す
    const existing = channels.find(
      (ch) => ch.type === "direct" &&
        ch.members.length === 2 &&
        ch.members.includes(user.id) &&
        ch.members.includes(targetUser.id)
    );
    if (existing) {
      setSelectedChannel(existing);
      markChannelRead(existing.id, user.id);
    } else {
      const newCh: ChatChannel = {
        id: `dm${Date.now()}`,
        name: `${targetUser.name}`,
        type: "direct",
        members: [user.id, targetUser.id],
        lastMessage: "",
      };
      setChannels([...channels, newCh]);
      setSelectedChannel(newCh);
    }
    setShowNewDM(false);
  };

  const toggleMember = (userId: string) => {
    setNewChannelMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
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
      <Header title="連絡" onMobileMenuOpen={openMobileMenu} />
      <div className="p-4 lg:p-8">
        <div className="bg-white border border-[#e0dbd2] rounded-sm overflow-hidden" style={{ height: "calc(100vh - 120px)" }}>
          <div className="flex h-full relative">
            {/* チャンネルリスト */}
            <div className={`${selectedChannel ? "hidden lg:flex" : "flex"} w-full lg:w-64 border-r border-[#e0dbd2] flex-col bg-[#fafaf7]`}>
              <div className="p-3 border-b border-[#e0dbd2] flex items-center justify-between">
                <h3 className="text-[11px] text-[#2d2d2d] tracking-[0.15em]">チャンネル</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setShowNewDM(true)}
                    className="p-1 text-[#8a8a8a] hover:text-[#c4a265] transition-colors duration-300"
                    title="ダイレクトメッセージ"
                  >
                    <UserIcon size={13} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() => setShowNewChannel(true)}
                    className="p-1 text-[#8a8a8a] hover:text-[#c4a265] transition-colors duration-300"
                    title="チャンネル作成"
                  >
                    <Plus size={14} strokeWidth={1.5} />
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {userChannels.map((ch) => {
                  const unread = messages.filter(
                    (m) => m.channelId === ch.id && !m.readBy.includes(user.id)
                  ).length;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        setSelectedChannel(ch);
                        markChannelRead(ch.id, user.id);
                      }}
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
            <div className={`${selectedChannel ? "flex" : "hidden lg:flex"} flex-1 flex-col`}>
              {selectedChannel ? (
                <>
                  {/* チャンネルヘッダー */}
                  <div className="p-3 border-b border-[#e0dbd2] flex items-center gap-2 bg-[#fafaf7]">
                    <button
                      onClick={() => setSelectedChannel(null)}
                      className="p-1 text-[#8a8a8a] hover:text-[#2d2d2d] lg:hidden"
                    >
                      <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    {channelIcon(selectedChannel.type)}
                    <h3 className="text-xs text-[#2d2d2d] tracking-wider">{selectedChannel.name}</h3>
                    <span className="text-[10px] text-[#8a8a8a]/60 tracking-wider">
                      ({selectedChannel.members.length}人)
                    </span>
                  </div>

                  {/* メッセージ一覧 */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
                    {channelMessages.length === 0 && (
                      <div className="flex-1 flex items-center justify-center text-[#8a8a8a] py-12">
                        <p className="text-xs tracking-wider">まだメッセージがありません</p>
                      </div>
                    )}
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
                          <div className={`max-w-[70%] lg:max-w-md ${isOwn ? "text-right" : ""}`}>
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
                    <div ref={messagesEndRef} />
                  </div>

                  {/* 入力エリア */}
                  <div className="p-3 border-t border-[#e0dbd2] bg-[#fafaf7]">
                    <div className="flex gap-2">
                      <button
                        onClick={() => alert("ファイル添付機能は今後のアップデートで追加予定です")}
                        className="p-2 text-[#8a8a8a] hover:text-[#c4a265] transition-colors duration-300"
                        title="ファイル添付（準備中）"
                      >
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

        {/* チャンネル作成モーダル */}
        {showNewChannel && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowNewChannel(false)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-md w-full max-h-[85vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">チャンネルを作成</h3>
                  <button onClick={() => setShowNewChannel(false)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">チャンネル名 <span className="text-red-500/70">*</span></label>
                    <input
                      type="text"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      placeholder="例: 新メニュー企画"
                      className="w-full mt-1 text-xs border border-[#e0dbd2] rounded-sm px-3 py-2 bg-white focus:outline-none focus:border-[#c4a265]/50 tracking-wider"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-[#8a8a8a] tracking-[0.15em]">メンバーを追加</label>
                    <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
                      {DEMO_USERS.filter((u) => u.id !== user.id).map((u) => (
                        <button
                          key={u.id}
                          onClick={() => toggleMember(u.id)}
                          className={`w-full flex items-center gap-3 p-2 rounded-sm text-left transition-colors duration-300 ${
                            newChannelMembers.includes(u.id)
                              ? "bg-[#c4a265]/[0.06] border border-[#c4a265]/30"
                              : "bg-white border border-[#e0dbd2] hover:border-[#c4a265]/20"
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-medium ${
                            newChannelMembers.includes(u.id)
                              ? "bg-[#1a1a1a] text-[#c4a265] border border-[#c4a265]/30"
                              : "bg-[#f5f3ee] text-[#8a8a8a] border border-[#e0dbd2]"
                          }`}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs text-[#2d2d2d] tracking-wider">{u.name}</div>
                            <div className="text-[9px] text-[#8a8a8a] tracking-wider">{ROLE_LABELS[u.role]}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleCreateChannel}
                      disabled={!newChannelName.trim()}
                      className="flex-1 py-2.5 bg-[#c4a265] text-white rounded-sm text-[11px] hover:bg-[#b8860b] disabled:opacity-30 transition-colors duration-300 tracking-wider"
                    >
                      作成する
                    </button>
                    <button
                      onClick={() => setShowNewChannel(false)}
                      className="px-6 py-2.5 border border-[#e0dbd2] text-[#8a8a8a] rounded-sm text-[11px] hover:border-[#c4a265]/30 transition-colors duration-300 tracking-wider"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DM作成モーダル */}
        {showNewDM && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 lg:p-4" onClick={() => setShowNewDM(false)}>
            <div className="bg-[#fafaf7] rounded-sm max-w-sm w-full max-h-[85vh] overflow-y-auto border border-[#e0dbd2]" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 lg:p-6">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-sm font-medium text-[#2d2d2d] tracking-wider">ダイレクトメッセージ</h3>
                  <button onClick={() => setShowNewDM(false)} className="text-[#8a8a8a] hover:text-[#2d2d2d] transition-colors duration-300">
                    <X size={16} strokeWidth={1.5} />
                  </button>
                </div>

                <div className="space-y-1">
                  {DEMO_USERS.filter((u) => u.id !== user.id).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartDM(u)}
                      className="w-full flex items-center gap-3 p-3 bg-white border border-[#e0dbd2] rounded-sm hover:border-[#c4a265]/30 transition-colors duration-300"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1a1a1a] text-[#c4a265] border border-[#c4a265]/30 flex items-center justify-center text-[11px] font-medium">
                        {u.name.charAt(0)}
                      </div>
                      <div className="text-left">
                        <div className="text-xs text-[#2d2d2d] tracking-wider">{u.name}</div>
                        <div className="text-[9px] text-[#8a8a8a] tracking-wider">{ROLE_LABELS[u.role]} | {u.position}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
