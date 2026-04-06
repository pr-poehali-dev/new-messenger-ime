import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

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

const initialChats: Chat[] = [
  {
    id: 1,
    name: "Алина",
    avatar: "А",
    lastMessage: "Привет! Как дела?",
    time: "14:32",
    unread: 2,
    online: true,
    messages: [
      { id: 1, text: "Привет!", mine: false, time: "14:28" },
      { id: 2, text: "Как дела?", mine: false, time: "14:28" },
      { id: 3, text: "Всё отлично, спасибо 😊", mine: true, time: "14:30", status: "read" },
      { id: 4, text: "Привет! Как дела?", mine: false, time: "14:32" },
    ],
  },
  {
    id: 2,
    name: "Максим",
    avatar: "М",
    lastMessage: "Увидимся в пятницу",
    time: "13:15",
    unread: 0,
    online: true,
    messages: [
      { id: 1, text: "Ты на митинге?", mine: true, time: "13:10", status: "read" },
      { id: 2, text: "Нет, буду позже", mine: false, time: "13:12" },
      { id: 3, text: "Увидимся в пятницу", mine: false, time: "13:15" },
    ],
  },
  {
    id: 3,
    name: "Команда IME",
    avatar: "🚀",
    lastMessage: "Релиз сегодня в 18:00",
    time: "12:00",
    unread: 5,
    online: false,
    messages: [
      { id: 1, text: "Все готовы к релизу?", mine: false, time: "11:50" },
      { id: 2, text: "Да, тестирование прошло успешно", mine: true, time: "11:55", status: "read" },
      { id: 3, text: "Релиз сегодня в 18:00", mine: false, time: "12:00" },
    ],
  },
  {
    id: 4,
    name: "Соня",
    avatar: "С",
    lastMessage: "Окей, договорились!",
    time: "Вчера",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Встретимся у метро?", mine: true, time: "Вчера", status: "read" },
      { id: 2, text: "Окей, договорились!", mine: false, time: "Вчера" },
    ],
  },
  {
    id: 5,
    name: "Иван Петров",
    avatar: "И",
    lastMessage: "Документы отправил",
    time: "Пн",
    unread: 0,
    online: false,
    messages: [
      { id: 1, text: "Нужны документы по проекту", mine: true, time: "Пн", status: "read" },
      { id: 2, text: "Документы отправил", mine: false, time: "Пн" },
    ],
  },
];

const AVATAR_COLORS: Record<string, string> = {
  А: "#7C6FFF",
  М: "#FF6B8A",
  С: "#3ECFB2",
  И: "#FFB347",
};

export default function Index() {
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<number>(1);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId)!;

  const filteredChats = chats.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat?.messages.length]);

  useEffect(() => {
    setChats((prev) =>
      prev.map((c) => (c.id === activeId ? { ...c, unread: 0 } : c))
    );
  }, [activeId]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const now = new Date();
    const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newMsg: Message = {
      id: Date.now(),
      text: input.trim(),
      mine: true,
      time,
      status: "sent",
    };
    setChats((prev) =>
      prev.map((c) =>
        c.id === activeId
          ? { ...c, messages: [...c.messages, newMsg], lastMessage: input.trim(), time }
          : c
      )
    );
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const getAvatarBg = (avatar: string) => AVATAR_COLORS[avatar] ?? "#555";

  return (
    <div className="ime-root">
      {/* Sidebar */}
      <aside className={`ime-sidebar ${sidebarOpen ? "open" : "hidden"}`}>
        <div className="ime-sidebar-header">
          <span className="ime-logo">ime</span>
          <button className="ime-icon-btn" onClick={() => setSidebarOpen(false)}>
            <Icon name="PanelLeftClose" size={18} />
          </button>
        </div>

        <div className="ime-search-wrap">
          <Icon name="Search" size={14} className="ime-search-icon" />
          <input
            className="ime-search"
            placeholder="Поиск..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="ime-chat-list">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              className={`ime-chat-item ${chat.id === activeId ? "active" : ""}`}
              onClick={() => setActiveId(chat.id)}
            >
              <div className="ime-avatar-wrap">
                <div
                  className="ime-avatar"
                  style={{ background: getAvatarBg(chat.avatar) }}
                >
                  {chat.avatar}
                </div>
                {chat.online && <span className="ime-online-dot" />}
              </div>
              <div className="ime-chat-info">
                <div className="ime-chat-top">
                  <span className="ime-chat-name">{chat.name}</span>
                  <span className="ime-chat-time">{chat.time}</span>
                </div>
                <div className="ime-chat-bottom">
                  <span className="ime-chat-last">{chat.lastMessage}</span>
                  {chat.unread > 0 && (
                    <span className="ime-unread">{chat.unread}</span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="ime-sidebar-footer">
          <div className="ime-avatar" style={{ background: "#7C6FFF", width: 34, height: 34, fontSize: 14 }}>
            Я
          </div>
          <span className="ime-my-name">Мой профиль</span>
          <button className="ime-icon-btn">
            <Icon name="Settings" size={17} />
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ime-main">
        <header className="ime-chat-header">
          {!sidebarOpen && (
            <button className="ime-icon-btn ime-open-btn" onClick={() => setSidebarOpen(true)}>
              <Icon name="PanelLeftOpen" size={18} />
            </button>
          )}
          <div className="ime-avatar-wrap">
            <div
              className="ime-avatar sm"
              style={{ background: getAvatarBg(activeChat.avatar) }}
            >
              {activeChat.avatar}
            </div>
            {activeChat.online && <span className="ime-online-dot" />}
          </div>
          <div className="ime-header-info">
            <span className="ime-header-name">{activeChat.name}</span>
            <span className={`ime-header-status ${activeChat.online ? "online" : ""}`}>
              {activeChat.online ? "онлайн" : "был(а) давно"}
            </span>
          </div>
          <div className="ime-header-actions">
            <button className="ime-icon-btn"><Icon name="Phone" size={18} /></button>
            <button className="ime-icon-btn"><Icon name="Video" size={18} /></button>
            <button className="ime-icon-btn"><Icon name="MoreVertical" size={18} /></button>
          </div>
        </header>

        <div className="ime-messages">
          <div className="ime-date-divider"><span>Сегодня</span></div>
          {activeChat.messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`ime-msg-row ${msg.mine ? "mine" : "theirs"}`}
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <div className={`ime-bubble ${msg.mine ? "mine" : "theirs"}`}>
                <span className="ime-bubble-text">{msg.text}</span>
                <div className="ime-bubble-meta">
                  <span className="ime-msg-time">{msg.time}</span>
                  {msg.mine && (
                    <Icon
                      name={msg.status === "read" ? "CheckCheck" : "Check"}
                      size={13}
                      className={msg.status === "read" ? "ime-check-read" : "ime-check-sent"}
                    />
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
          <button
            className={`ime-send-btn ${input.trim() ? "active" : ""}`}
            onClick={sendMessage}
          >
            <Icon name="Send" size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}
