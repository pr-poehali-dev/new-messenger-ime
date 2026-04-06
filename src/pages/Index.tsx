import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "calls" | "profile";

interface Message {
  id: number;
  text: string;
  mine: boolean;
  time: string;
  status?: "sent" | "read";
}

interface Chat {
  id: number;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  messages: Message[];
}

interface CallRecord {
  id: number;
  name: string;
  avatar: string;
  type: "in" | "out" | "missed";
  date: string;
  duration?: string;
}

const AVATAR_COLORS: Record<string, string> = {
  А: "#7C6FFF",
  М: "#FF6B8A",
  С: "#3ECFB2",
  И: "#FFB347",
  Д: "#FF9A5C",
};

const WALLPAPERS = [
  { id: "default", label: "По умолчанию", style: { background: "var(--ime-bg)" } },
  { id: "purple", label: "Фиолетовый", style: { background: "linear-gradient(135deg, #1a1040 0%, #0f0a2a 100%)" } },
  { id: "night", label: "Ночной город", style: { background: "linear-gradient(160deg, #0f1117 0%, #0a1628 50%, #111827 100%)" } },
  { id: "forest", label: "Лес", style: { background: "linear-gradient(135deg, #0d1f0f 0%, #0a1a10 100%)" } },
  { id: "ocean", label: "Океан", style: { background: "linear-gradient(135deg, #0a1628 0%, #0d2137 100%)" } },
  { id: "sunset", label: "Закат", style: { background: "linear-gradient(135deg, #1f0d0d 0%, #2a0a1a 100%)" } },
  { id: "pattern1", label: "Точки", style: { background: "#0f1117", backgroundImage: "radial-gradient(circle, rgba(124,111,255,0.15) 1px, transparent 1px)", backgroundSize: "28px 28px" } },
  { id: "pattern2", label: "Сетка", style: { background: "#0f1117", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "32px 32px" } },
];

const initialChats: Chat[] = [
  {
    id: 1, name: "Алина", avatar: "А", lastMessage: "Привет! Как дела?", time: "14:32", unread: 2, online: true,
    messages: [
      { id: 1, text: "Привет!", mine: false, time: "14:28" },
      { id: 2, text: "Как дела?", mine: false, time: "14:28" },
      { id: 3, text: "Всё отлично, спасибо 😊", mine: true, time: "14:30", status: "read" },
      { id: 4, text: "Привет! Как дела?", mine: false, time: "14:32" },
    ],
  },
  {
    id: 2, name: "Максим", avatar: "М", lastMessage: "Увидимся в пятницу", time: "13:15", unread: 0, online: true,
    messages: [
      { id: 1, text: "Ты на митинге?", mine: true, time: "13:10", status: "read" },
      { id: 2, text: "Нет, буду позже", mine: false, time: "13:12" },
      { id: 3, text: "Увидимся в пятницу", mine: false, time: "13:15" },
    ],
  },
  {
    id: 3, name: "Команда IME", avatar: "🚀", lastMessage: "Релиз сегодня в 18:00", time: "12:00", unread: 5, online: false,
    messages: [
      { id: 1, text: "Все готовы к релизу?", mine: false, time: "11:50" },
      { id: 2, text: "Да, тестирование прошло успешно", mine: true, time: "11:55", status: "read" },
      { id: 3, text: "Релиз сегодня в 18:00", mine: false, time: "12:00" },
    ],
  },
  {
    id: 4, name: "Соня", avatar: "С", lastMessage: "Окей, договорились!", time: "Вчера", unread: 0, online: false,
    messages: [
      { id: 1, text: "Встретимся у метро?", mine: true, time: "Вчера", status: "read" },
      { id: 2, text: "Окей, договорились!", mine: false, time: "Вчера" },
    ],
  },
  {
    id: 5, name: "Иван Петров", avatar: "И", lastMessage: "Документы отправил", time: "Пн", unread: 0, online: false,
    messages: [
      { id: 1, text: "Нужны документы по проекту", mine: true, time: "Пн", status: "read" },
      { id: 2, text: "Документы отправил", mine: false, time: "Пн" },
    ],
  },
];

const initialCalls: CallRecord[] = [
  { id: 1, name: "Алина", avatar: "А", type: "in", date: "Сегодня, 14:20", duration: "5 мин" },
  { id: 2, name: "Максим", avatar: "М", type: "out", date: "Сегодня, 11:05", duration: "12 мин" },
  { id: 3, name: "Соня", avatar: "С", type: "missed", date: "Вчера, 20:33" },
  { id: 4, name: "Алина", avatar: "А", type: "out", date: "Вчера, 18:10", duration: "3 мин" },
  { id: 5, name: "Иван Петров", avatar: "И", type: "missed", date: "Вчера, 09:47" },
  { id: 6, name: "Максим", avatar: "М", type: "in", date: "Пн, 16:00", duration: "28 мин" },
  { id: 7, name: "Соня", avatar: "С", type: "out", date: "Пн, 12:15", duration: "7 мин" },
];

export default function Index() {
  const [tab, setTab] = useState<Tab>("chats");
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [wallpaper, setWallpaper] = useState("default");
  const [profile, setProfile] = useState({ name: "Мой профиль", status: "На связи", notifications: true, darkMode: true });
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const filteredChats = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const currentWp = WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat?.messages.length]);

  useEffect(() => {
    if (activeId) setChats((prev) => prev.map((c) => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const sendMessage = () => {
    if (!input.trim() || !activeId) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setChats((prev) => prev.map((c) => c.id === activeId
      ? { ...c, messages: [...c.messages, { id: Date.now(), text: input.trim(), mine: true, time, status: "sent" }], lastMessage: input.trim(), time }
      : c
    ));
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const getAvatarBg = (avatar: string) => AVATAR_COLORS[avatar] ?? "#555";

  const callIcon = (type: CallRecord["type"]) => {
    if (type === "in") return <Icon name="PhoneIncoming" size={15} className="call-icon in" />;
    if (type === "out") return <Icon name="PhoneOutgoing" size={15} className="call-icon out" />;
    return <Icon name="PhoneMissed" size={15} className="call-icon missed" />;
  };

  return (
    <div className="ime-root">
      {/* ── LEFT RAIL (Telegram-style) ── */}
      <aside className="ime-sidebar">
        {/* Top nav tabs */}
        <div className="ime-sidebar-header">
          <span className="ime-logo">ime</span>
          <div className="ime-tab-icons">
            <button className={`ime-tab-icon-btn ${tab === "chats" ? "active" : ""}`} onClick={() => setTab("chats")} title="Чаты">
              <Icon name="MessageCircle" size={19} />
            </button>
            <button className={`ime-tab-icon-btn ${tab === "calls" ? "active" : ""}`} onClick={() => setTab("calls")} title="Звонки">
              <Icon name="Phone" size={19} />
            </button>
            <button className={`ime-tab-icon-btn ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")} title="Профиль">
              <Icon name="User" size={19} />
            </button>
          </div>
        </div>

        {/* ── CHATS TAB ── */}
        {tab === "chats" && (
          <>
            <div className="ime-search-wrap">
              <Icon name="Search" size={14} className="ime-search-icon" />
              <input className="ime-search" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="ime-chat-list">
              {filteredChats.map((chat) => (
                <button
                  key={chat.id}
                  className={`ime-chat-item ${chat.id === activeId ? "active" : ""}`}
                  onClick={() => setActiveId(chat.id)}
                >
                  <div className="ime-avatar-wrap">
                    <div className="ime-avatar" style={{ background: getAvatarBg(chat.avatar) }}>{chat.avatar}</div>
                    {chat.online && <span className="ime-online-dot" />}
                  </div>
                  <div className="ime-chat-info">
                    <div className="ime-chat-top">
                      <span className="ime-chat-name">{chat.name}</span>
                      <span className="ime-chat-time">{chat.time}</span>
                    </div>
                    <div className="ime-chat-bottom">
                      <span className="ime-chat-last">{chat.lastMessage}</span>
                      {chat.unread > 0 && <span className="ime-unread">{chat.unread}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── CALLS TAB ── */}
        {tab === "calls" && (
          <div className="ime-calls-list">
            <div className="ime-section-title">Недавние звонки</div>
            {initialCalls.map((call) => (
              <div key={call.id} className="ime-call-item">
                <div className="ime-avatar-wrap">
                  <div className="ime-avatar" style={{ background: getAvatarBg(call.avatar) }}>{call.avatar}</div>
                </div>
                <div className="ime-call-info">
                  <div className="ime-call-top">
                    <span className="ime-call-name">{call.name}</span>
                    <div className="ime-call-actions">
                      <button className="ime-icon-btn small" onClick={() => setActiveCall(call)} title="Позвонить">
                        <Icon name="Phone" size={15} />
                      </button>
                    </div>
                  </div>
                  <div className="ime-call-bottom">
                    {callIcon(call.type)}
                    <span className="ime-call-date">{call.date}</span>
                    {call.duration && <span className="ime-call-dur">· {call.duration}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {tab === "profile" && (
          <div className="ime-profile-panel">
            <div className="ime-profile-hero">
              <div className="ime-avatar xl" style={{ background: "#7C6FFF" }}>Я</div>
              <div className="ime-profile-name">{profile.name}</div>
              <div className="ime-profile-status-badge">{profile.status}</div>
            </div>

            <div className="ime-profile-section">
              <div className="ime-profile-label">Имя</div>
              <input
                className="ime-profile-input"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
              />
            </div>

            <div className="ime-profile-section">
              <div className="ime-profile-label">Статус</div>
              <input
                className="ime-profile-input"
                value={profile.status}
                onChange={(e) => setProfile((p) => ({ ...p, status: e.target.value }))}
              />
            </div>

            <div className="ime-profile-section">
              <div className="ime-profile-label">Обои чата</div>
              <div className="ime-wallpaper-grid">
                {WALLPAPERS.map((wp) => (
                  <button
                    key={wp.id}
                    className={`ime-wp-thumb ${wallpaper === wp.id ? "selected" : ""}`}
                    style={wp.style as React.CSSProperties}
                    onClick={() => setWallpaper(wp.id)}
                    title={wp.label}
                  >
                    {wallpaper === wp.id && <Icon name="Check" size={14} className="ime-wp-check" />}
                  </button>
                ))}
              </div>
            </div>

            <div className="ime-profile-section">
              <div className="ime-profile-toggle-row">
                <div>
                  <div className="ime-profile-label" style={{ marginBottom: 2 }}>Уведомления</div>
                  <div className="ime-profile-sublabel">Звук и вибрация</div>
                </div>
                <button
                  className={`ime-toggle ${profile.notifications ? "on" : ""}`}
                  onClick={() => setProfile((p) => ({ ...p, notifications: !p.notifications }))}
                />
              </div>
            </div>

            <div className="ime-profile-section">
              <div className="ime-profile-toggle-row">
                <div>
                  <div className="ime-profile-label" style={{ marginBottom: 2 }}>Тёмная тема</div>
                  <div className="ime-profile-sublabel">Всегда включена</div>
                </div>
                <button
                  className={`ime-toggle ${profile.darkMode ? "on" : ""}`}
                  onClick={() => setProfile((p) => ({ ...p, darkMode: !p.darkMode }))}
                />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* ── MAIN AREA ── */}
      <main className="ime-main">
        {activeChat && tab === "chats" ? (
          <>
            <header className="ime-chat-header">
              <div className="ime-avatar-wrap">
                <div className="ime-avatar sm" style={{ background: getAvatarBg(activeChat.avatar) }}>{activeChat.avatar}</div>
                {activeChat.online && <span className="ime-online-dot" style={{ borderColor: "var(--ime-header-bg)" }} />}
              </div>
              <div className="ime-header-info">
                <span className="ime-header-name">{activeChat.name}</span>
                <span className={`ime-header-status ${activeChat.online ? "online" : ""}`}>
                  {activeChat.online ? "онлайн" : "был(а) давно"}
                </span>
              </div>
              <div className="ime-header-actions">
                <button className="ime-icon-btn" onClick={() => { setActiveCall({ id: 0, name: activeChat.name, avatar: activeChat.avatar, type: "out", date: "Сейчас" }); }}>
                  <Icon name="Phone" size={18} />
                </button>
                <button className="ime-icon-btn"><Icon name="Video" size={18} /></button>
                <button className="ime-icon-btn"><Icon name="MoreVertical" size={18} /></button>
              </div>
            </header>

            <div className="ime-messages" style={currentWp.style as React.CSSProperties}>
              <div className="ime-date-divider"><span>Сегодня</span></div>
              {activeChat.messages.map((msg, i) => (
                <div
                  key={msg.id}
                  className={`ime-msg-row ${msg.mine ? "mine" : "theirs"}`}
                  style={{ animationDelay: `${i * 0.04}s` }}
                >
                  <div className={`ime-bubble ${msg.mine ? "mine" : "theirs"}`}>
                    <span className="ime-bubble-text">{msg.text}</span>
                    <div className="ime-bubble-meta">
                      <span className="ime-msg-time">{msg.time}</span>
                      {msg.mine && (
                        <Icon name={msg.status === "read" ? "CheckCheck" : "Check"} size={13}
                          className={msg.status === "read" ? "ime-check-read" : "ime-check-sent"} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="ime-input-bar">
              <button className="ime-icon-btn"><Icon name="Smile" size={20} /></button>
              <textarea
                ref={textareaRef}
                className="ime-input"
                placeholder="Сообщение..."
                value={input}
                onChange={handleInput}
                onKeyDown={handleKey}
                rows={1}
              />
              <button className="ime-icon-btn"><Icon name="Paperclip" size={18} /></button>
              <button className={`ime-send-btn ${input.trim() ? "active" : ""}`} onClick={sendMessage}>
                <Icon name="Send" size={18} />
              </button>
            </div>
          </>
        ) : (
          <div className="ime-empty-state">
            <div className="ime-empty-icon">
              {tab === "calls" ? "📞" : tab === "profile" ? "👤" : "💬"}
            </div>
            <div className="ime-empty-title">
              {tab === "chats" ? "Выберите чат" : tab === "calls" ? "История звонков" : "Настройки профиля"}
            </div>
            <div className="ime-empty-sub">
              {tab === "chats" ? "Нажмите на контакт слева, чтобы начать переписку" :
               tab === "calls" ? "Все ваши звонки отображаются на панели слева" :
               "Настройте профиль и обои в панели слева"}
            </div>
          </div>
        )}
      </main>

      {/* ── ACTIVE CALL OVERLAY ── */}
      {activeCall && (
        <div className="ime-call-overlay" onClick={() => setActiveCall(null)}>
          <div className="ime-call-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ime-call-avatar-xl" style={{ background: getAvatarBg(activeCall.avatar) }}>
              {activeCall.avatar}
            </div>
            <div className="ime-call-modal-name">{activeCall.name}</div>
            <div className="ime-call-modal-status">Звоним...</div>
            <div className="ime-call-modal-actions">
              <button className="ime-call-action mic">
                <Icon name="Mic" size={22} />
              </button>
              <button className="ime-call-action end" onClick={() => setActiveCall(null)}>
                <Icon name="PhoneOff" size={22} />
              </button>
              <button className="ime-call-action speaker">
                <Icon name="Volume2" size={22} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
