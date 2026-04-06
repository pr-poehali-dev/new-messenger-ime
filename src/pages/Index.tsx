import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "calls" | "profile" | "gifts" | "wallet";
type PanelMode = "emoji" | "attach" | null;

interface Message {
  id: number;
  text?: string;
  mine: boolean;
  time: string;
  status?: "sent" | "read";
  mediaType?: "image" | "video" | "file" | "gift" | "sticker";
  mediaUrl?: string;
  fileName?: string;
  fileSize?: string;
  gift?: Gift;
  emoji?: string;
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

interface Gift {
  id: string;
  emoji: string;
  name: string;
  price: number;
  rarity: "common" | "rare" | "epic" | "legendary";
  bg: string;
}

interface TxRecord {
  id: number;
  type: "in" | "out";
  amount: number;
  label: string;
  date: string;
}

const AVATAR_COLORS: Record<string, string> = {
  А: "#7C6FFF", М: "#FF6B8A", С: "#3ECFB2", И: "#FFB347", Д: "#FF9A5C",
};

const WALLPAPERS = [
  { id: "default", label: "По умолчанию", style: { background: "var(--ime-bg)" } },
  { id: "purple", label: "Фиолетовый", style: { background: "linear-gradient(135deg,#1a1040 0%,#0f0a2a 100%)" } },
  { id: "night", label: "Ночь", style: { background: "linear-gradient(160deg,#0f1117 0%,#0a1628 50%,#111827 100%)" } },
  { id: "forest", label: "Лес", style: { background: "linear-gradient(135deg,#0d1f0f 0%,#0a1a10 100%)" } },
  { id: "ocean", label: "Океан", style: { background: "linear-gradient(135deg,#0a1628 0%,#0d2137 100%)" } },
  { id: "sunset", label: "Закат", style: { background: "linear-gradient(135deg,#1f0d0d 0%,#2a0a1a 100%)" } },
  { id: "pattern1", label: "Точки", style: { background: "#0f1117", backgroundImage: "radial-gradient(circle,rgba(124,111,255,0.15) 1px,transparent 1px)", backgroundSize: "28px 28px" } },
  { id: "pattern2", label: "Сетка", style: { background: "#0f1117", backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)", backgroundSize: "32px 32px" } },
];

const EMOJI_CATS = [
  { id: "recent", icon: "⏱", label: "Недавние", emojis: ["😊","😂","❤️","👍","🔥","🎉","😭","🙏","💯","😍","🤣","😅","🥰","😘","🤔","😎"] },
  { id: "smiles", icon: "😀", label: "Смайлики", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","🙃","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🤫","🤔","🤐","🤨","😐","😑","😶","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🤧","🥵","🥶","🥴","😵","🤯","🤠","🥳","😎","🤓","🧐","😕","😟","🙁","☹️","😮","😯","😲","😳","🥺","😦","😧","😨","😰","😥","😢","😭","😱","😖","😣","😞","😓","😩","😫","🥱","😤","😡","😠","🤬","😈","👿"] },
  { id: "people", icon: "👋", label: "Люди", emojis: ["👋","🤚","🖐","✋","🖖","👌","🤌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","🖕","👇","☝️","👍","👎","✊","👊","🤛","🤜","👏","🙌","👐","🤲","🤝","🙏","✍️","💅","🤳","💪","🦵","🦶","👂","🦻","👃","🧠","🦷","🦴","👀","👁","👅","👄","💋","💘","💝","💖","💗","💓","💞","💕","💟","❣️","💔","❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎"] },
  { id: "nature", icon: "🌿", label: "Природа", emojis: ["🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🙈","🙉","🙊","🐔","🐧","🐦","🐤","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🦄","🐝","🐛","🦋","🐌","🐞","🐜","🦟","🦗","🦂","🐢","🐍","🦎","🦖","🦕","🐙","🦑","🦐","🦞","🦀","🐡","🐠","🐟","🐬","🐳","🐋","🦈","🐊","🐅","🐆","🦓","🦍","🦧","🐘","🦛","🦏","🐪","🐫","🦒","🦘","🐃","🐂","🐄","🐎","🐖","🐏","🐑","🦙","🐐","🦌","🐕","🐩","🦮","🐕‍🦺","🐈","🐓","🦃","🦚","🦜","🦢","🦩","🕊","🐇","🦝","🦨","🦡","🦦","🦥","🐁","🐀","🐿","🦔","🐾","🐉","🌵","🎄","🌲","🌳","🌴","🌱","🌿","☘️","🍀","🎍","🎋","�🍃","🍂","🍁","🍄","🌾","💐","🌷","🌹","🥀","🌺","🌸","🌼","🌻","🌞","🌝","🌛","🌜","🌚","🌕","🌖","🌗","🌘","🌑","🌒","🌓","🌔","🌙","🌟","⭐","🌠","🌌","☁️","⛅","🌤","🌥","🌦","🌧","🌨","🌩","🌪","🌫","🌬","🌀","🌈","🌂","☂️","☔","⛱","⚡","❄️","☃️","⛄","🔥","💧","🌊"] },
  { id: "food", icon: "🍕", label: "Еда", emojis: ["🍎","🍊","🍋","🍇","🍓","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🥦","🥬","🥒","🌶","🧄","🧅","🥔","🌽","🥕","🧆","🥜","🍞","🥐","🥖","🫓","🥨","🥯","🧀","🥚","🍳","🧈","🥞","🧇","🥓","🥩","🍗","🍖","🦴","🌭","🍔","🍟","🍕","🫔","🥪","🥙","🧆","🌮","🌯","🥗","🥘","🫕","🍝","🍜","🍲","🍛","🍣","🍱","🥟","🦪","🍤","🍙","🍚","🍘","🍥","🥮","🍢","🧁","🍰","🎂","🍮","🍭","🍬","🍫","🍿","🍩","🍪","🌰","🥜","🍯","🧃","🥤","🧋","☕","🍵","🍶","🍾","🍷","🍸","🍹","🍺","🍻","🥂","🥃","🫗"] },
  { id: "travel", icon: "✈️", label: "Путешествия", emojis: ["🚗","🚕","🚙","🚌","🚎","🏎","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🏍","🛵","🛺","🚲","🛴","🛹","🛼","🚏","🛣","🛤","🛞","⛽","🚨","🚥","🚦","🛑","🚧","⚓","🛟","⛵","🛶","🚤","🛳","⛴","🛥","🚢","✈️","🛩","🛫","🛬","🪂","💺","🚁","🚟","🚠","🚡","🛰","🚀","🛸","🪐","🌍","🌎","🌏","🗺","🧭","🏔","⛰","🌋","🗻","🏕","🏖","🏜","🏝","🏞","🏟","🏛","🏗","🛖","🏘","🏚","🏠","🏡","🏢","🏣","🏤","🏥","🏦","🏨","🏩","🏪","🏫","🏬","🏭","🏯","🏰","🗼","🗽","⛪","🕌","🛕","🕍","⛩","🕋","⛲","⛺","🌁","🌃","🏙","🌄","🌅","🌆","🌇","🌉","♨️","🎠","🎡","🎢","💈","🎪"] },
  { id: "objects", icon: "💡", label: "Объекты", emojis: ["⌚","📱","📲","💻","⌨️","🖥","🖨","🖱","🖲","🕹","🗜","💽","💾","💿","📀","📼","📷","📸","📹","🎥","📽","🎞","📞","☎️","📟","📠","📺","📻","🧭","⏱","⏲","⏰","🕰","⌛","⏳","📡","🔋","🪫","🔌","💡","🔦","🕯","🪔","🧯","🛢","💰","💴","💵","💶","💷","💸","💳","🪙","💹","📈","📉","📊","📋","📁","📂","🗂","🗒","🗓","📆","📅","🗑","📇","📌","📍","🗺","📏","📐","✂️","🗃","🗄","🗑","🔒","🔓","🔏","🔐","🔑","🗝","🔨","🪓","⛏","⚒","🛠","🗡","⚔️","🛡","🪃","🏹","🔧","🪛","🔩","⚙️","🗜","🔗","⛓","🪝","🧲","🪜","🧰","🧲","🔬","🔭","📡","💊","🩺","🩻","🩼","🩹","🩺","🌡","🛁","🛀","🪥","🧴","🧷","🧹","🧺","🧻","🪣","🧼","🫧","🪒","🧽","🧯","🛒","🚪","🪞","🪟","🛏","🛋","🪑","🚽","🪠","🚿","🛁","🪤","🪒"] },
  { id: "symbols", icon: "💠", label: "Символы", emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❣️","💕","💞","💓","💗","💖","💘","💝","💟","☮️","✝️","☪️","🕉","☸️","✡️","🔯","🕎","☯️","☦️","🛐","⛎","♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓","🆔","⚛️","🉑","☢️","☣️","📴","📳","🈶","🈚","🈸","🈺","🈷️","✴️","🆚","💮","🉐","㊙️","㊗️","🈴","🈵","🈹","🈲","🅰️","🅱️","🆎","🆑","🅾️","🆘","❌","⭕","🛑","⛔","📛","🚫","💯","💢","♨️","🚷","🚯","🚳","🚱","🔞","📵","🚭","❗","❕","❓","❔","‼️","⁉️","🔅","🔆","〽️","⚠️","🚸","🔱","⚜️","🔰","♻️","✅","🈯","💹","❎","🌐","💠","Ⓜ️","🌀","💤","🏧","🚾","♿","🅿️","🛗","🈳","🈂️","🛂","🛃","🛄","🛅"] },
];

const STICKERS = [
  { id: "s1", emoji: "🐱", label: "Котик" },
  { id: "s2", emoji: "🐶", label: "Собачка" },
  { id: "s3", emoji: "🦊", label: "Лисёнок" },
  { id: "s4", emoji: "🐼", label: "Панда" },
  { id: "s5", emoji: "🐸", label: "Лягушка" },
  { id: "s6", emoji: "🦋", label: "Бабочка" },
  { id: "s7", emoji: "🌸", label: "Цветочек" },
  { id: "s8", emoji: "⭐", label: "Звёздочка" },
  { id: "s9", emoji: "🌈", label: "Радуга" },
  { id: "s10", emoji: "🎩", label: "Шляпа" },
  { id: "s11", emoji: "🤖", label: "Робот" },
  { id: "s12", emoji: "👾", label: "Монстрик" },
];

const GIFTS: Gift[] = [
  { id: "g1", emoji: "💎", name: "Бриллиант", price: 500, rarity: "legendary", bg: "linear-gradient(135deg,#1a0a4a,#4a1a8a)" },
  { id: "g2", emoji: "🌹", name: "Роза", price: 50, rarity: "common", bg: "linear-gradient(135deg,#4a0a0a,#8a1a2a)" },
  { id: "g3", emoji: "🐱", name: "Котик", price: 100, rarity: "rare", bg: "linear-gradient(135deg,#0a2a4a,#1a4a7a)" },
  { id: "g4", emoji: "⭐", name: "Звезда", price: 250, rarity: "epic", bg: "linear-gradient(135deg,#2a1a0a,#5a3a0a)" },
  { id: "g5", emoji: "🏆", name: "Кубок", price: 1000, rarity: "legendary", bg: "linear-gradient(135deg,#1a1a0a,#4a3a0a)" },
  { id: "g6", emoji: "🎵", name: "Нота", price: 75, rarity: "common", bg: "linear-gradient(135deg,#0a1a2a,#0a2a4a)" },
  { id: "g7", emoji: "🦋", name: "Бабочка", price: 150, rarity: "rare", bg: "linear-gradient(135deg,#1a0a2a,#3a0a5a)" },
  { id: "g8", emoji: "🔮", name: "Хрустальный шар", price: 350, rarity: "epic", bg: "linear-gradient(135deg,#0a0a2a,#1a0a3a)" },
  { id: "g9", emoji: "🌊", name: "Волна", price: 80, rarity: "common", bg: "linear-gradient(135deg,#0a1a3a,#0a2a5a)" },
  { id: "g10", emoji: "🎭", name: "Маски", price: 200, rarity: "rare", bg: "linear-gradient(135deg,#2a0a1a,#4a0a3a)" },
  { id: "g11", emoji: "🦄", name: "Единорог", price: 750, rarity: "legendary", bg: "linear-gradient(135deg,#2a0a4a,#4a0a6a)" },
  { id: "g12", emoji: "🎸", name: "Гитара", price: 120, rarity: "rare", bg: "linear-gradient(135deg,#1a0a0a,#3a1a0a)" },
];

const TRANSACTIONS: TxRecord[] = [
  { id: 1, type: "in", amount: 25.5, label: "От Алины", date: "Сегодня, 14:10" },
  { id: 2, type: "out", amount: 100, label: "Подарок: Бриллиант", date: "Сегодня, 12:00" },
  { id: 3, type: "in", amount: 500, label: "Пополнение", date: "Вчера, 20:00" },
  { id: 4, type: "out", amount: 50, label: "Подарок: Роза", date: "Вчера, 18:30" },
  { id: 5, type: "out", amount: 75, label: "Подарок: Нота", date: "Пн, 15:00" },
  { id: 6, type: "in", amount: 200, label: "От Максима", date: "Пн, 11:00" },
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
];

const RARITY_LABEL: Record<Gift["rarity"], string> = {
  common: "Обычный", rare: "Редкий", epic: "Эпический", legendary: "Легендарный",
};
const RARITY_COLOR: Record<Gift["rarity"], string> = {
  common: "#8890a4", rare: "#3ECFB2", epic: "#c37dff", legendary: "#FFB347",
};

export default function Index() {
  const [tab, setTab] = useState<Tab>("chats");
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [wallpaper, setWallpaper] = useState("default");
  const [profile, setProfile] = useState({ name: "Мой профиль", status: "На связи", notifications: true, darkMode: true });
  const [activeCall, setActiveCall] = useState<CallRecord | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [emojiCat, setEmojiCat] = useState("recent");
  const [emojiSearch, setEmojiSearch] = useState("");
  const [emojiSubTab, setEmojiSubTab] = useState<"emoji" | "stickers">("emoji");
  const [walletBalance] = useState(1247.5);
  const [giftTarget, setGiftTarget] = useState<Gift | null>(null);
  const [giftSent, setGiftSent] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const filteredChats = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const currentWp = WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0];

  const now = () => {
    const d = new Date();
    return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat?.messages.length]);

  useEffect(() => {
    if (activeId) setChats((prev) => prev.map((c) => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const pushMsg = (msg: Omit<Message, "id">) => {
    if (!activeId) return;
    setChats((prev) => prev.map((c) => c.id === activeId
      ? { ...c, messages: [...c.messages, { id: Date.now(), ...msg }], lastMessage: msg.text ?? (msg.mediaType ?? ""), time: now() }
      : c
    ));
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    pushMsg({ text: input.trim(), mine: true, time: now(), status: "sent" });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setPanelMode(null);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const sendEmoji = (emoji: string) => {
    pushMsg({ text: emoji, mine: true, time: now(), status: "sent" });
  };

  const sendSticker = (s: { id: string; emoji: string; label: string }) => {
    pushMsg({ mine: true, time: now(), status: "sent", mediaType: "sticker", emoji: s.emoji });
    setPanelMode(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    const url = URL.createObjectURL(file);
    if (isImage) {
      pushMsg({ mine: true, time: now(), status: "sent", mediaType: "image", mediaUrl: url });
    } else if (isVideo) {
      pushMsg({ mine: true, time: now(), status: "sent", mediaType: "video", mediaUrl: url });
    } else {
      pushMsg({ mine: true, time: now(), status: "sent", mediaType: "file", fileName: file.name, fileSize: (file.size / 1024).toFixed(0) + " KB" });
    }
    setPanelMode(null);
    e.target.value = "";
  };

  const sendGiftMsg = (gift: Gift) => {
    if (!activeId) return;
    pushMsg({ mine: true, time: now(), status: "sent", mediaType: "gift", gift });
    setGiftTarget(null);
    setGiftSent(true);
    setTimeout(() => setGiftSent(false), 2000);
  };

  const getAvatarBg = (avatar: string) => AVATAR_COLORS[avatar] ?? "#555";

  const callIcon = (type: CallRecord["type"]) => {
    if (type === "in") return <Icon name="PhoneIncoming" size={15} className="call-icon in" />;
    if (type === "out") return <Icon name="PhoneOutgoing" size={15} className="call-icon out" />;
    return <Icon name="PhoneMissed" size={15} className="call-icon missed" />;
  };

  const currentEmojis = (() => {
    const cat = EMOJI_CATS.find((c) => c.id === emojiCat) ?? EMOJI_CATS[0];
    if (emojiSearch) return EMOJI_CATS.flatMap((c) => c.emojis).filter((e) => e.includes(emojiSearch));
    return cat.emojis;
  })();

  const togglePanel = (mode: PanelMode) => setPanelMode((prev) => prev === mode ? null : mode);

  return (
    <div className="ime-root">
      {/* ── SIDEBAR ── */}
      <aside className="ime-sidebar">
        <div className="ime-sidebar-header">
          <span className="ime-logo">ime</span>
          <div className="ime-tab-icons">
            {(["chats","calls","gifts","wallet","profile"] as Tab[]).map((t) => (
              <button key={t} className={`ime-tab-icon-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                <Icon name={t === "chats" ? "MessageCircle" : t === "calls" ? "Phone" : t === "gifts" ? "Gift" : t === "wallet" ? "Wallet" : "User"} size={18} />
              </button>
            ))}
          </div>
        </div>

        {/* CHATS */}
        {tab === "chats" && <>
          <div className="ime-search-wrap">
            <Icon name="Search" size={14} className="ime-search-icon" />
            <input className="ime-search" placeholder="Поиск..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="ime-chat-list">
            {filteredChats.map((chat) => (
              <button key={chat.id} className={`ime-chat-item ${chat.id === activeId ? "active" : ""}`} onClick={() => setActiveId(chat.id)}>
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
        </>}

        {/* CALLS */}
        {tab === "calls" && <div className="ime-calls-list">
          <div className="ime-section-title">Недавние звонки</div>
          {initialCalls.map((call) => (
            <div key={call.id} className="ime-call-item">
              <div className="ime-avatar-wrap">
                <div className="ime-avatar" style={{ background: getAvatarBg(call.avatar) }}>{call.avatar}</div>
              </div>
              <div className="ime-call-info">
                <div className="ime-call-top">
                  <span className="ime-call-name">{call.name}</span>
                  <button className="ime-icon-btn small" onClick={() => setActiveCall(call)}><Icon name="Phone" size={15} /></button>
                </div>
                <div className="ime-call-bottom">
                  {callIcon(call.type)}
                  <span className="ime-call-date">{call.date}</span>
                  {call.duration && <span className="ime-call-dur">· {call.duration}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>}

        {/* GIFTS MARKET */}
        {tab === "gifts" && <div className="ime-gifts-panel">
          <div className="ime-section-title">Магазин подарков</div>
          <div className="ime-gifts-grid">
            {GIFTS.map((gift) => (
              <button key={gift.id} className="ime-gift-card" style={{ background: gift.bg }}
                onClick={() => { setGiftTarget(gift); }}>
                <span className="ime-gift-emoji">{gift.emoji}</span>
                <span className="ime-gift-name">{gift.name}</span>
                <span className="ime-gift-rarity" style={{ color: RARITY_COLOR[gift.rarity] }}>{RARITY_LABEL[gift.rarity]}</span>
                <span className="ime-gift-price">💎 {gift.price}</span>
              </button>
            ))}
          </div>
        </div>}

        {/* TON WALLET */}
        {tab === "wallet" && <div className="ime-wallet-panel">
          <div className="ime-wallet-card">
            <div className="ime-wallet-logo">💎 TON</div>
            <div className="ime-wallet-balance">{walletBalance.toFixed(2)}</div>
            <div className="ime-wallet-label">TON · ≈ {(walletBalance * 5.4).toFixed(0)} ₽</div>
            <div className="ime-wallet-addr">UQBm...f9Kz</div>
          </div>
          <div className="ime-wallet-actions">
            <button className="ime-wallet-btn"><Icon name="ArrowDownLeft" size={18} /><span>Получить</span></button>
            <button className="ime-wallet-btn"><Icon name="ArrowUpRight" size={18} /><span>Отправить</span></button>
            <button className="ime-wallet-btn"><Icon name="RefreshCw" size={18} /><span>Обменять</span></button>
          </div>
          <div className="ime-section-title" style={{ paddingTop: 16 }}>История</div>
          <div className="ime-tx-list">
            {TRANSACTIONS.map((tx) => (
              <div key={tx.id} className="ime-tx-item">
                <div className={`ime-tx-icon ${tx.type}`}>
                  <Icon name={tx.type === "in" ? "ArrowDownLeft" : "ArrowUpRight"} size={16} />
                </div>
                <div className="ime-tx-info">
                  <span className="ime-tx-label">{tx.label}</span>
                  <span className="ime-tx-date">{tx.date}</span>
                </div>
                <span className={`ime-tx-amount ${tx.type}`}>{tx.type === "in" ? "+" : "-"}{tx.amount} TON</span>
              </div>
            ))}
          </div>
        </div>}

        {/* PROFILE */}
        {tab === "profile" && <div className="ime-profile-panel">
          <div className="ime-profile-hero">
            <div className="ime-avatar xl" style={{ background: "#7C6FFF" }}>Я</div>
            <div className="ime-profile-name">{profile.name}</div>
            <div className="ime-profile-status-badge">{profile.status}</div>
          </div>
          <div className="ime-profile-section">
            <div className="ime-profile-label">Имя</div>
            <input className="ime-profile-input" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
          </div>
          <div className="ime-profile-section">
            <div className="ime-profile-label">Статус</div>
            <input className="ime-profile-input" value={profile.status} onChange={(e) => setProfile((p) => ({ ...p, status: e.target.value }))} />
          </div>
          <div className="ime-profile-section">
            <div className="ime-profile-label">Обои чата</div>
            <div className="ime-wallpaper-grid">
              {WALLPAPERS.map((wp) => (
                <button key={wp.id} className={`ime-wp-thumb ${wallpaper === wp.id ? "selected" : ""}`}
                  style={wp.style as React.CSSProperties} onClick={() => setWallpaper(wp.id)}>
                  {wallpaper === wp.id && <Icon name="Check" size={14} className="ime-wp-check" />}
                </button>
              ))}
            </div>
          </div>
          <div className="ime-profile-section">
            <div className="ime-profile-toggle-row">
              <div><div className="ime-profile-label" style={{ marginBottom: 2 }}>Уведомления</div><div className="ime-profile-sublabel">Звук и вибрация</div></div>
              <button className={`ime-toggle ${profile.notifications ? "on" : ""}`} onClick={() => setProfile((p) => ({ ...p, notifications: !p.notifications }))} />
            </div>
          </div>
        </div>}
      </aside>

      {/* ── MAIN ── */}
      <main className="ime-main">
        {activeChat && tab === "chats" ? (<>
          {/* Chat header */}
          <header className="ime-chat-header">
            <div className="ime-avatar-wrap">
              <div className="ime-avatar sm" style={{ background: getAvatarBg(activeChat.avatar) }}>{activeChat.avatar}</div>
              {activeChat.online && <span className="ime-online-dot" style={{ borderColor: "var(--ime-header-bg)" }} />}
            </div>
            <div className="ime-header-info">
              <span className="ime-header-name">{activeChat.name}</span>
              <span className={`ime-header-status ${activeChat.online ? "online" : ""}`}>{activeChat.online ? "онлайн" : "был(а) давно"}</span>
            </div>
            <div className="ime-header-actions">
              <button className="ime-icon-btn" onClick={() => setActiveCall({ id: 0, name: activeChat.name, avatar: activeChat.avatar, type: "out", date: "Сейчас" })}><Icon name="Phone" size={18} /></button>
              <button className="ime-icon-btn"><Icon name="Video" size={18} /></button>
              <button className="ime-icon-btn" onClick={() => { setTab("gifts"); }}><Icon name="Gift" size={18} /></button>
              <button className="ime-icon-btn"><Icon name="MoreVertical" size={18} /></button>
            </div>
          </header>

          {/* Messages */}
          <div className="ime-messages" style={currentWp.style as React.CSSProperties}>
            <div className="ime-date-divider"><span>Сегодня</span></div>
            {activeChat.messages.map((msg, i) => (
              <div key={msg.id} className={`ime-msg-row ${msg.mine ? "mine" : "theirs"}`} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`ime-bubble ${msg.mine ? "mine" : "theirs"} ${msg.mediaType ? "media" : ""}`}>
                  {/* Image */}
                  {msg.mediaType === "image" && msg.mediaUrl && (
                    <img src={msg.mediaUrl} className="ime-msg-img" alt="фото" />
                  )}
                  {/* Video */}
                  {msg.mediaType === "video" && msg.mediaUrl && (
                    <video src={msg.mediaUrl} className="ime-msg-img" controls />
                  )}
                  {/* File */}
                  {msg.mediaType === "file" && (
                    <div className="ime-msg-file">
                      <Icon name="FileText" size={28} className="ime-file-icon" />
                      <div><div className="ime-file-name">{msg.fileName}</div><div className="ime-file-size">{msg.fileSize}</div></div>
                    </div>
                  )}
                  {/* Sticker */}
                  {msg.mediaType === "sticker" && (
                    <span className="ime-msg-sticker">{msg.emoji}</span>
                  )}
                  {/* Gift */}
                  {msg.mediaType === "gift" && msg.gift && (
                    <div className="ime-msg-gift" style={{ background: msg.gift.bg }}>
                      <span className="ime-msg-gift-emoji">{msg.gift.emoji}</span>
                      <div className="ime-msg-gift-info">
                        <span className="ime-msg-gift-name">{msg.gift.name}</span>
                        <span className="ime-msg-gift-rarity" style={{ color: RARITY_COLOR[msg.gift.rarity] }}>{RARITY_LABEL[msg.gift.rarity]}</span>
                      </div>
                    </div>
                  )}
                  {/* Text */}
                  {msg.text && <span className="ime-bubble-text">{msg.text}</span>}
                  {msg.mediaType !== "sticker" && (
                    <div className="ime-bubble-meta">
                      <span className="ime-msg-time">{msg.time}</span>
                      {msg.mine && <Icon name={msg.status === "read" ? "CheckCheck" : "Check"} size={13} className={msg.status === "read" ? "ime-check-read" : "ime-check-sent"} />}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Emoji/Sticker panel */}
          {panelMode === "emoji" && (
            <div className="ime-emoji-panel">
              <div className="ime-emoji-tabs">
                <button className={`ime-emoji-subtab ${emojiSubTab === "emoji" ? "active" : ""}`} onClick={() => setEmojiSubTab("emoji")}>😀 Эмодзи</button>
                <button className={`ime-emoji-subtab ${emojiSubTab === "stickers" ? "active" : ""}`} onClick={() => setEmojiSubTab("stickers")}>🐱 Стикеры</button>
              </div>
              {emojiSubTab === "emoji" && <>
                <div className="ime-emoji-search-wrap">
                  <Icon name="Search" size={13} className="ime-search-icon" />
                  <input className="ime-emoji-search" placeholder="Поиск эмодзи..." value={emojiSearch} onChange={(e) => setEmojiSearch(e.target.value)} />
                </div>
                <div className="ime-emoji-cats">
                  {EMOJI_CATS.map((c) => (
                    <button key={c.id} className={`ime-emoji-cat-btn ${emojiCat === c.id ? "active" : ""}`} onClick={() => { setEmojiCat(c.id); setEmojiSearch(""); }} title={c.label}>{c.icon}</button>
                  ))}
                </div>
                <div className="ime-emoji-grid">
                  {currentEmojis.map((emoji, i) => (
                    <button key={i} className="ime-emoji-btn" onClick={() => sendEmoji(emoji)}>{emoji}</button>
                  ))}
                </div>
              </>}
              {emojiSubTab === "stickers" && (
                <div className="ime-sticker-grid">
                  {STICKERS.map((s) => (
                    <button key={s.id} className="ime-sticker-btn" onClick={() => sendSticker(s)} title={s.label}>
                      <span>{s.emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Attach panel */}
          {panelMode === "attach" && (
            <div className="ime-attach-panel">
              <button className="ime-attach-btn" onClick={() => { fileInputRef.current!.accept = "image/*"; fileInputRef.current!.click(); }}>
                <div className="ime-attach-icon photo"><Icon name="Image" size={22} /></div>
                <span>Фото</span>
              </button>
              <button className="ime-attach-btn" onClick={() => { fileInputRef.current!.accept = "video/*"; fileInputRef.current!.click(); }}>
                <div className="ime-attach-icon video"><Icon name="Video" size={22} /></div>
                <span>Видео</span>
              </button>
              <button className="ime-attach-btn" onClick={() => { fileInputRef.current!.accept = "*/*"; fileInputRef.current!.click(); }}>
                <div className="ime-attach-icon file"><Icon name="FileText" size={22} /></div>
                <span>Файл</span>
              </button>
              <button className="ime-attach-btn" onClick={() => { setTab("gifts"); setPanelMode(null); }}>
                <div className="ime-attach-icon gift"><Icon name="Gift" size={22} /></div>
                <span>Подарок</span>
              </button>
              <button className="ime-attach-btn" onClick={() => { setTab("wallet"); setPanelMode(null); }}>
                <div className="ime-attach-icon ton"><span style={{ fontSize: 22 }}>💎</span></div>
                <span>TON</span>
              </button>
            </div>
          )}

          {/* Input bar */}
          <div className="ime-input-bar">
            <button className={`ime-icon-btn ${panelMode === "emoji" ? "active-panel" : ""}`} onClick={() => togglePanel("emoji")}>
              <Icon name="Smile" size={20} />
            </button>
            <textarea
              ref={textareaRef}
              className="ime-input"
              placeholder="Сообщение..."
              value={input}
              onChange={handleTextInput}
              onKeyDown={handleKey}
              rows={1}
            />
            <button className={`ime-icon-btn ${panelMode === "attach" ? "active-panel" : ""}`} onClick={() => togglePanel("attach")}>
              <Icon name="Paperclip" size={18} />
            </button>
            <button className={`ime-send-btn ${input.trim() ? "active" : ""}`} onClick={sendMessage}>
              <Icon name="Send" size={18} />
            </button>
          </div>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </>) : (
          <div className="ime-empty-state">
            <div className="ime-empty-icon">{tab === "calls" ? "📞" : tab === "gifts" ? "🎁" : tab === "wallet" ? "💎" : tab === "profile" ? "👤" : "💬"}</div>
            <div className="ime-empty-title">
              {tab === "chats" ? "Выберите чат" : tab === "calls" ? "История звонков" : tab === "gifts" ? "Магазин подарков" : tab === "wallet" ? "TON Кошелёк" : "Настройки"}
            </div>
            <div className="ime-empty-sub">
              {tab === "chats" ? "Нажмите на контакт слева" : "Управление в левой панели"}
            </div>
          </div>
        )}
      </main>

      {/* ── GIFT CONFIRM MODAL ── */}
      {giftTarget && (
        <div className="ime-call-overlay" onClick={() => setGiftTarget(null)}>
          <div className="ime-call-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ime-gift-modal-preview" style={{ background: giftTarget.bg }}>
              <span style={{ fontSize: 56 }}>{giftTarget.emoji}</span>
            </div>
            <div className="ime-call-modal-name">{giftTarget.name}</div>
            <div style={{ color: RARITY_COLOR[giftTarget.rarity], fontSize: 13, marginBottom: 4 }}>{RARITY_LABEL[giftTarget.rarity]}</div>
            <div style={{ color: "var(--ime-text-muted)", fontSize: 13 }}>Стоимость: 💎 {giftTarget.price} TON</div>
            <div style={{ color: "var(--ime-text-muted)", fontSize: 12, marginTop: 4 }}>Отправить {activeChat?.name ?? "контакту"}?</div>
            <div className="ime-call-modal-actions">
              <button className="ime-call-action mic" onClick={() => setGiftTarget(null)}>
                <Icon name="X" size={22} />
              </button>
              <button className="ime-call-action end" style={{ background: "var(--ime-accent)" }} onClick={() => { setTab("chats"); sendGiftMsg(giftTarget); }}>
                <Icon name="Gift" size={22} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── GIFT SENT TOAST ── */}
      {giftSent && (
        <div className="ime-toast">🎁 Подарок отправлен!</div>
      )}

      {/* ── CALL OVERLAY ── */}
      {activeCall && (
        <div className="ime-call-overlay" onClick={() => setActiveCall(null)}>
          <div className="ime-call-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ime-call-avatar-xl" style={{ background: getAvatarBg(activeCall.avatar) }}>{activeCall.avatar}</div>
            <div className="ime-call-modal-name">{activeCall.name}</div>
            <div className="ime-call-modal-status">Звоним...</div>
            <div className="ime-call-modal-actions">
              <button className="ime-call-action mic"><Icon name="Mic" size={22} /></button>
              <button className="ime-call-action end" onClick={() => setActiveCall(null)}><Icon name="PhoneOff" size={22} /></button>
              <button className="ime-call-action speaker"><Icon name="Volume2" size={22} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
