import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "calls" | "gifts" | "wallet" | "profile";
type GiftsTab = "market" | "my" | "activity";
type PanelMode = "emoji" | "attach" | null;
type Rarity = "common" | "rare" | "epic" | "legendary" | "special";

interface Message {
  id: number; text?: string; mine: boolean; time: string;
  status?: "sent" | "read";
  mediaType?: "image" | "video" | "file" | "gift" | "sticker";
  mediaUrl?: string; fileName?: string; fileSize?: string;
  gift?: NFTGift; emoji?: string;
}
interface Chat {
  id: number; name: string; avatar: string; lastMessage: string;
  time: string; unread: number; online: boolean; messages: Message[];
}
interface CallRecord {
  id: number; name: string; avatar: string;
  type: "in" | "out" | "missed"; date: string; duration?: string;
}
interface NFTGift {
  id: string; emoji: string; name: string; collection: string;
  price: number; floorPrice: number; rarity: Rarity;
  totalSupply: number; owners: number;
  isNFT: boolean; isForSale: boolean; isForRent: boolean;
  rentPricePerDay?: number; upgradeStars: number;
  attrs: { trait: string; value: string; rarity: number }[];
  bg: string; particleColor: string;
}
interface MyNFT extends NFTGift {
  tokenId: string; mintedAt: string; status: "owned" | "listed" | "rented_out" | "rented_in";
  listPrice?: number; rentDays?: number;
}
interface TxRecord {
  id: number; type: "in" | "out" | "gift_buy" | "gift_sell" | "rent";
  amount: number; label: string; date: string; icon: string;
}

const AVATAR_COLORS: Record<string, string> = {
  А: "#7C6FFF", М: "#FF6B8A", С: "#3ECFB2", И: "#FFB347", Д: "#FF9A5C",
};

const RARITY_META: Record<Rarity, { label: string; color: string; glow: string; border: string }> = {
  common:    { label: "Обычный",    color: "#8890a4", glow: "rgba(136,144,164,0.3)", border: "rgba(136,144,164,0.4)" },
  rare:      { label: "Редкий",     color: "#3ECFB2", glow: "rgba(62,207,178,0.35)", border: "rgba(62,207,178,0.5)" },
  epic:      { label: "Эпический",  color: "#c37dff", glow: "rgba(195,125,255,0.4)", border: "rgba(195,125,255,0.6)" },
  legendary: { label: "Легендарный",color: "#FFB347", glow: "rgba(255,179,71,0.45)", border: "rgba(255,179,71,0.65)" },
  special:   { label: "Особый",     color: "#FF6B8A", glow: "rgba(255,107,138,0.45)", border: "rgba(255,107,138,0.65)" },
};

const NFT_GIFTS: NFTGift[] = [
  {
    id: "g1", emoji: "💎", name: "Бриллиант", collection: "Jewels of TON",
    price: 850, floorPrice: 780, rarity: "legendary",
    totalSupply: 999, owners: 634, isNFT: true, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Цвет", value: "Синий", rarity: 12 }, { trait: "Огранка", value: "Принцесса", rarity: 5 }, { trait: "Блеск", value: "Максимальный", rarity: 3 }],
    bg: "linear-gradient(135deg,#0d0a2e 0%,#1a1060 50%,#0a0820 100%)",
    particleColor: "#7C6FFF",
  },
  {
    id: "g2", emoji: "🌹", name: "Вечная роза", collection: "Flowers",
    price: 95, floorPrice: 80, rarity: "rare",
    totalSupply: 9999, owners: 5231, isNFT: true, isForSale: true, isForRent: true,
    rentPricePerDay: 3, upgradeStars: 25,
    attrs: [{ trait: "Цвет", value: "Алый", rarity: 28 }, { trait: "Вид", value: "Бутон", rarity: 40 }],
    bg: "linear-gradient(135deg,#2a0a0a 0%,#5a1520 100%)",
    particleColor: "#FF6B8A",
  },
  {
    id: "g3", emoji: "🐱", name: "Лунный котик", collection: "Cosmic Pets",
    price: 220, floorPrice: 195, rarity: "epic",
    totalSupply: 3333, owners: 1842, isNFT: true, isForSale: true, isForRent: true,
    rentPricePerDay: 8, upgradeStars: 25,
    attrs: [{ trait: "Шерсть", value: "Лунная", rarity: 8 }, { trait: "Глаза", value: "Звёздные", rarity: 12 }, { trait: "Аксессуар", value: "Корона", rarity: 4 }],
    bg: "linear-gradient(135deg,#0a1a3a 0%,#1a2a5a 100%)",
    particleColor: "#3ECFB2",
  },
  {
    id: "g4", emoji: "⭐", name: "Золотая звезда", collection: "Stars",
    price: 450, floorPrice: 410, rarity: "legendary",
    totalSupply: 1500, owners: 980, isNFT: true, isForSale: false, isForRent: true,
    rentPricePerDay: 15, upgradeStars: 25,
    attrs: [{ trait: "Лучей", value: "8", rarity: 10 }, { trait: "Сияние", value: "Максимальное", rarity: 5 }],
    bg: "linear-gradient(135deg,#1a1000 0%,#3a2800 100%)",
    particleColor: "#FFB347",
  },
  {
    id: "g5", emoji: "🏆", name: "Кубок чемпиона", collection: "Legends",
    price: 1500, floorPrice: 1350, rarity: "special",
    totalSupply: 333, owners: 201, isNFT: true, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Металл", value: "Платина", rarity: 3 }, { trait: "Гравировка", value: "Уникальная", rarity: 2 }, { trait: "Камень", value: "Рубин", rarity: 7 }],
    bg: "linear-gradient(135deg,#1a0f00 0%,#3a1f00 50%,#1a0f00 100%)",
    particleColor: "#FF6B8A",
  },
  {
    id: "g6", emoji: "🦋", name: "Бабочка мечты", collection: "Dreams",
    price: 175, floorPrice: 155, rarity: "epic",
    totalSupply: 4444, owners: 2103, isNFT: true, isForSale: true, isForRent: true,
    rentPricePerDay: 6, upgradeStars: 25,
    attrs: [{ trait: "Окраска", value: "Голографическая", rarity: 6 }, { trait: "Вид", value: "Морфо", rarity: 15 }],
    bg: "linear-gradient(135deg,#150a2a 0%,#2a1040 100%)",
    particleColor: "#c37dff",
  },
  {
    id: "g7", emoji: "🔮", name: "Хрустальный шар", collection: "Mystic",
    price: 380, floorPrice: 340, rarity: "legendary",
    totalSupply: 1111, owners: 745, isNFT: true, isForSale: true, isForRent: true,
    rentPricePerDay: 12, upgradeStars: 25,
    attrs: [{ trait: "Видение", value: "Будущее", rarity: 5 }, { trait: "Туман", value: "Фиолетовый", rarity: 18 }],
    bg: "linear-gradient(135deg,#080a1f 0%,#12163a 100%)",
    particleColor: "#c37dff",
  },
  {
    id: "g8", emoji: "🌊", name: "Океанская волна", collection: "Elements",
    price: 130, floorPrice: 115, rarity: "rare",
    totalSupply: 7777, owners: 4102, isNFT: false, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Высота", value: "Огромная", rarity: 20 }, { trait: "Пена", value: "Золотая", rarity: 8 }],
    bg: "linear-gradient(135deg,#050f1f 0%,#0a1e35 100%)",
    particleColor: "#3ECFB2",
  },
  {
    id: "g9", emoji: "🎭", name: "Маска театра", collection: "Arts",
    price: 60, floorPrice: 50, rarity: "common",
    totalSupply: 19999, owners: 11234, isNFT: false, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Выражение", value: "Радость", rarity: 50 }],
    bg: "linear-gradient(135deg,#1a0a10 0%,#2a1020 100%)",
    particleColor: "#FF6B8A",
  },
  {
    id: "g10", emoji: "🦄", name: "Единорог вечности", collection: "Mythical",
    price: 2200, floorPrice: 2050, rarity: "special",
    totalSupply: 100, owners: 87, isNFT: true, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Рог", value: "Алмазный", rarity: 1 }, { trait: "Грива", value: "Радужная", rarity: 2 }, { trait: "Копыта", value: "Золотые", rarity: 3 }],
    bg: "linear-gradient(135deg,#1a0830 0%,#350f60 50%,#1a0830 100%)",
    particleColor: "#c37dff",
  },
  {
    id: "g11", emoji: "🎵", name: "Золотая нота", collection: "Music",
    price: 88, floorPrice: 75, rarity: "common",
    totalSupply: 15000, owners: 8904, isNFT: false, isForSale: true, isForRent: false,
    upgradeStars: 25,
    attrs: [{ trait: "Тональность", value: "До мажор", rarity: 35 }],
    bg: "linear-gradient(135deg,#0a1020 0%,#142040 100%)",
    particleColor: "#FFB347",
  },
  {
    id: "g12", emoji: "🎸", name: "Легендарная гитара", collection: "Music",
    price: 320, floorPrice: 290, rarity: "epic",
    totalSupply: 2222, owners: 1341, isNFT: true, isForSale: true, isForRent: true,
    rentPricePerDay: 10, upgradeStars: 25,
    attrs: [{ trait: "Дерево", value: "Красное", rarity: 12 }, { trait: "Струны", value: "Золотые", rarity: 8 }, { trait: "Форма", value: "Flying V", rarity: 5 }],
    bg: "linear-gradient(135deg,#1a0800 0%,#2e1200 100%)",
    particleColor: "#FFB347",
  },
];

const MY_NFTS: MyNFT[] = [
  { ...NFT_GIFTS[0], tokenId: "#0042", mintedAt: "15.03.2025", status: "owned" },
  { ...NFT_GIFTS[2], tokenId: "#1337", mintedAt: "02.04.2025", status: "listed", listPrice: 280 },
  { ...NFT_GIFTS[5], tokenId: "#0888", mintedAt: "28.03.2025", status: "rented_out", rentDays: 3 },
  { ...NFT_GIFTS[8], tokenId: "#9012", mintedAt: "10.04.2025", status: "owned", isNFT: false },
];

const ACTIVITY: TxRecord[] = [
  { id: 1, type: "gift_sell", amount: 195, label: "Продажа: Лунный котик #1337", date: "Только что", icon: "🐱" },
  { id: 2, type: "rent", amount: 18, label: "Аренда: Бабочка мечты · 3 дня", date: "2ч назад", icon: "🦋" },
  { id: 3, type: "gift_buy", amount: 850, label: "Покупка: Бриллиант #0042", date: "Вчера", icon: "💎" },
  { id: 4, type: "in", amount: 25.5, label: "От Алины", date: "Вчера", icon: "💰" },
  { id: 5, type: "out", amount: 320, label: "Покупка: Легендарная гитара", date: "Пн", icon: "🎸" },
  { id: 6, type: "rent", amount: 30, label: "Аренда: Хрустальный шар · 5 дней", date: "Пн", icon: "🔮" },
];

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
  { id: "recent", icon: "⏱", emojis: ["😊","😂","❤️","👍","🔥","🎉","😭","🙏","💯","😍","🤣","😅","🥰","😘","🤔","😎"] },
  { id: "smiles", icon: "😀", emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😉","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","😋","😛","😜","🤪","😝","🤑","🤗","🤔","😐","😑","😶","😏","😒","🙄","😬","😌","😔","😪","😴","😷","🤒","🤕","🤢","🤧","🥵","🥶","😵","🤯","🥳","😎","🤓","😕","😟","😮","😯","😲","😳","🥺","😦","😨","😰","😥","😢","😭","😱","😤","😡","😠","🤬","😈","👿"] },
  { id: "people", icon: "👋", emojis: ["👋","🤚","✋","👌","✌️","🤞","👍","👎","✊","👊","👏","🙌","🙏","💅","💪","👀","👅","👄","💋","❤️","🧡","💛","💚","💙","💜","🖤","💔","💘","💝","💖","💗","💓","💞","💕"] },
  { id: "nature", icon: "🌿", emojis: ["🐶","🐱","🐭","🐰","🦊","🐻","🐼","🐯","🦁","🐮","🐸","🐵","🐔","🦋","🌸","🌺","🌻","🌹","🌷","🌲","🌴","🍀","☘️","🌿","🍄","🌊","🔥","⭐","🌙","☀️","❄️","🌈","🌸","💐"] },
  { id: "food", icon: "🍕", emojis: ["🍕","🍔","🍟","🌮","🌯","🍜","🍣","🍱","🍰","🎂","🍩","🍪","☕","🍵","🍺","🥂","🍷","🍸","🍹","🥤","🧃","🍫","🍬","🍭","🧁","🍮","🍯","🥐","🥞","🧇","🥓","🍗","🍖","🌭"] },
  { id: "symbols", icon: "💠", emojis: ["❤️","💯","✅","❌","⭕","🔥","💫","⚡","🌟","✨","💥","🎯","🎪","🎭","🎨","🎬","🎤","🎧","🎼","🎵","🎶","🎸","🥁","🎹","🎺","🎷","🪗","🎻","🪕","🎲","🎮","🕹","🎰","🧩"] },
];

const STICKERS = [
  { id: "s1", emoji: "🐱", label: "Котик" }, { id: "s2", emoji: "🐶", label: "Собачка" },
  { id: "s3", emoji: "🦊", label: "Лиса" }, { id: "s4", emoji: "🐼", label: "Панда" },
  { id: "s5", emoji: "🐸", label: "Лягушка" }, { id: "s6", emoji: "🦋", label: "Бабочка" },
  { id: "s7", emoji: "🌸", label: "Цветок" }, { id: "s8", emoji: "⭐", label: "Звезда" },
  { id: "s9", emoji: "🌈", label: "Радуга" }, { id: "s10", emoji: "🤖", label: "Робот" },
  { id: "s11", emoji: "👾", label: "Монстрик" }, { id: "s12", emoji: "🎩", label: "Шляпа" },
];

const initialChats: Chat[] = [
  { id: 1, name: "Алина", avatar: "А", lastMessage: "Привет! Как дела?", time: "14:32", unread: 2, online: true,
    messages: [{ id: 1, text: "Привет!", mine: false, time: "14:28" }, { id: 2, text: "Как дела?", mine: false, time: "14:28" }, { id: 3, text: "Всё отлично 😊", mine: true, time: "14:30", status: "read" }, { id: 4, text: "Привет! Как дела?", mine: false, time: "14:32" }] },
  { id: 2, name: "Максим", avatar: "М", lastMessage: "Увидимся в пятницу", time: "13:15", unread: 0, online: true,
    messages: [{ id: 1, text: "Ты на митинге?", mine: true, time: "13:10", status: "read" }, { id: 2, text: "Нет, буду позже", mine: false, time: "13:12" }, { id: 3, text: "Увидимся в пятницу", mine: false, time: "13:15" }] },
  { id: 3, name: "Команда IME", avatar: "🚀", lastMessage: "Релиз сегодня в 18:00", time: "12:00", unread: 5, online: false,
    messages: [{ id: 1, text: "Все готовы?", mine: false, time: "11:50" }, { id: 2, text: "Да, тесты прошли", mine: true, time: "11:55", status: "read" }, { id: 3, text: "Релиз сегодня в 18:00", mine: false, time: "12:00" }] },
  { id: 4, name: "Соня", avatar: "С", lastMessage: "Окей, договорились!", time: "Вчера", unread: 0, online: false,
    messages: [{ id: 1, text: "Встретимся у метро?", mine: true, time: "Вчера", status: "read" }, { id: 2, text: "Окей, договорились!", mine: false, time: "Вчера" }] },
  { id: 5, name: "Иван Петров", avatar: "И", lastMessage: "Документы отправил", time: "Пн", unread: 0, online: false,
    messages: [{ id: 1, text: "Нужны документы", mine: true, time: "Пн", status: "read" }, { id: 2, text: "Документы отправил", mine: false, time: "Пн" }] },
];

const initialCalls = [
  { id: 1, name: "Алина", avatar: "А", type: "in" as const, date: "Сегодня, 14:20", duration: "5 мин" },
  { id: 2, name: "Максим", avatar: "М", type: "out" as const, date: "Сегодня, 11:05", duration: "12 мин" },
  { id: 3, name: "Соня", avatar: "С", type: "missed" as const, date: "Вчера, 20:33" },
  { id: 4, name: "Алина", avatar: "А", type: "out" as const, date: "Вчера, 18:10", duration: "3 мин" },
];

// ─── NFT CARD ──────────────────────────────────────────────────────────────
function NFTCard({ gift, onBuy, onRent, onSend, compact = false }: {
  gift: NFTGift; onBuy?: () => void; onRent?: () => void; onSend?: () => void; compact?: boolean;
}) {
  const meta = RARITY_META[gift.rarity];
  return (
    <div className={`nft-card ${compact ? "compact" : ""}`}
      style={{ "--nft-glow": meta.glow, "--nft-border": meta.border, "--nft-color": meta.color, background: gift.bg } as React.CSSProperties}>
      <div className="nft-particle" style={{ background: gift.particleColor }} />
      <div className="nft-particle p2" style={{ background: gift.particleColor }} />
      <div className="nft-particle p3" style={{ background: gift.particleColor }} />
      {gift.isNFT && <div className="nft-badge">NFT</div>}
      <div className="nft-emoji">{gift.emoji}</div>
      <div className="nft-name">{gift.name}</div>
      {!compact && <div className="nft-collection">{gift.collection}</div>}
      <div className="nft-rarity-badge" style={{ color: meta.color, borderColor: meta.border, background: `${meta.glow}` }}>
        {meta.label}
      </div>
      {!compact && (
        <div className="nft-supply">
          <span>{gift.owners.toLocaleString()} владельцев</span>
          <span>из {gift.totalSupply.toLocaleString()}</span>
        </div>
      )}
      <div className="nft-price-row">
        <span className="nft-price">💎 {gift.price}</span>
        {!compact && gift.floorPrice !== gift.price && (
          <span className="nft-floor">Пол: {gift.floorPrice}</span>
        )}
      </div>
      {!compact && (
        <div className="nft-actions">
          {gift.isForSale && onBuy && (
            <button className="nft-btn buy" onClick={onBuy}>Купить</button>
          )}
          {gift.isForRent && onRent && (
            <button className="nft-btn rent" onClick={onRent}>{gift.rentPricePerDay} TON/д</button>
          )}
          {onSend && (
            <button className="nft-btn send" onClick={onSend}><Icon name="Send" size={13} /></button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── MY NFT CARD ───────────────────────────────────────────────────────────
function MyNFTCard({ nft, onList, onUpgrade }: { nft: MyNFT; onList: () => void; onUpgrade: () => void }) {
  const meta = RARITY_META[nft.rarity];
  const statusLabels = { owned: "В коллекции", listed: "На продаже", rented_out: "Сдаётся", rented_in: "Арендовано" };
  const statusColors = { owned: "#8890a4", listed: "#3ECFB2", rented_out: "#FFB347", rented_in: "#c37dff" };
  return (
    <div className="my-nft-card" style={{ "--nft-glow": meta.glow, "--nft-border": meta.border, background: nft.bg } as React.CSSProperties}>
      <div className="nft-particle" style={{ background: nft.particleColor }} />
      <div className="my-nft-left">
        <div className="my-nft-emoji">{nft.emoji}</div>
      </div>
      <div className="my-nft-info">
        <div className="my-nft-name">{nft.name}</div>
        <div className="my-nft-meta">
          {nft.tokenId && <span className="my-nft-token">{nft.tokenId}</span>}
          <span className="my-nft-status" style={{ color: statusColors[nft.status] }}>● {statusLabels[nft.status]}</span>
        </div>
        {nft.status === "listed" && <div className="my-nft-list-price">💎 {nft.listPrice} TON</div>}
        {nft.status === "rented_out" && <div className="my-nft-list-price">💎 {nft.rentDays}д аренды</div>}
        <div className="my-nft-actions-row">
          {!nft.isNFT && (
            <button className="my-nft-btn upgrade" onClick={onUpgrade}>
              ⭐ Улучшить · {nft.upgradeStars} Stars
            </button>
          )}
          {nft.isNFT && nft.status === "owned" && (
            <button className="my-nft-btn list" onClick={onList}>Продать / Сдать</button>
          )}
          {nft.isNFT && nft.status !== "owned" && (
            <button className="my-nft-btn cancel" onClick={onList}>Снять с продажи</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
export default function Index() {
  const [tab, setTab] = useState<Tab>("chats");
  const [giftsTab, setGiftsTab] = useState<GiftsTab>("market");
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [activeId, setActiveId] = useState<number | null>(1);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");
  const [wallpaper, setWallpaper] = useState("default");
  const [profile, setProfile] = useState({ name: "Мой профиль", status: "На связи", notifications: true });
  const [activeCall, setActiveCall] = useState<(typeof initialCalls)[0] | null>(null);
  const [panelMode, setPanelMode] = useState<PanelMode>(null);
  const [emojiCat, setEmojiCat] = useState("recent");
  const [emojiSubTab, setEmojiSubTab] = useState<"emoji" | "stickers">("emoji");
  const [selectedNFT, setSelectedNFT] = useState<NFTGift | null>(null);
  const [nftAction, setNftAction] = useState<"buy" | "rent" | "upgrade" | "list" | null>(null);
  const [myNfts, setMyNfts] = useState<MyNFT[]>(MY_NFTS);
  const [rarityFilter, setRarityFilter] = useState<Rarity | "all">("all");
  const [sortBy, setSortBy] = useState<"price_asc" | "price_desc" | "rarity">("rarity");
  const [toast, setToast] = useState<string | null>(null);
  const [walletBalance] = useState(1247.5);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeChat = chats.find((c) => c.id === activeId);
  const filteredChats = chats.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  const currentWp = WALLPAPERS.find((w) => w.id === wallpaper) ?? WALLPAPERS[0];

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const filteredGifts = NFT_GIFTS
    .filter((g) => rarityFilter === "all" || g.rarity === rarityFilter)
    .sort((a, b) => sortBy === "price_asc" ? a.price - b.price : sortBy === "price_desc" ? b.price - a.price : Object.keys(RARITY_META).indexOf(b.rarity) - Object.keys(RARITY_META).indexOf(a.rarity));

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, activeChat?.messages.length]);

  useEffect(() => {
    if (activeId) setChats((p) => p.map((c) => c.id === activeId ? { ...c, unread: 0 } : c));
  }, [activeId]);

  const now = () => { const d = new Date(); return `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; };

  const pushMsg = (msg: Omit<Message, "id">) => {
    if (!activeId) return;
    setChats((p) => p.map((c) => c.id === activeId
      ? { ...c, messages: [...c.messages, { id: Date.now(), ...msg }], lastMessage: msg.text ?? (msg.mediaType ?? ""), time: now() }
      : c));
  };

  const sendMessage = () => {
    if (!input.trim()) return;
    pushMsg({ text: input.trim(), mine: true, time: now(), status: "sent" });
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setPanelMode(null);
  };

  const handleKey = (e: React.KeyboardEvent) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const ta = e.target; ta.style.height = "auto"; ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const url = URL.createObjectURL(file);
    if (file.type.startsWith("image/")) pushMsg({ mine: true, time: now(), status: "sent", mediaType: "image", mediaUrl: url });
    else if (file.type.startsWith("video/")) pushMsg({ mine: true, time: now(), status: "sent", mediaType: "video", mediaUrl: url });
    else pushMsg({ mine: true, time: now(), status: "sent", mediaType: "file", fileName: file.name, fileSize: (file.size / 1024).toFixed(0) + " KB" });
    setPanelMode(null); e.target.value = "";
  };

  const getAvatarBg = (a: string) => AVATAR_COLORS[a] ?? "#555";

  const currentEmojis = EMOJI_CATS.find((c) => c.id === emojiCat)?.emojis ?? EMOJI_CATS[0].emojis;

  const confirmBuy = () => {
    if (!selectedNFT) return;
    const newNft: MyNFT = { ...selectedNFT, tokenId: `#${Math.floor(Math.random() * 9000 + 1000)}`, mintedAt: new Date().toLocaleDateString("ru"), status: "owned" };
    setMyNfts((p) => [...p, newNft]);
    showToast(`🎉 ${selectedNFT.name} куплен!`);
    setSelectedNFT(null); setNftAction(null);
  };

  const confirmRent = () => {
    if (!selectedNFT) return;
    showToast(`✅ Аренда ${selectedNFT.name} на 3 дня`);
    setSelectedNFT(null); setNftAction(null);
  };

  const confirmUpgrade = () => {
    if (!selectedNFT) return;
    setMyNfts((p) => p.map((n) => n.id === selectedNFT.id ? { ...n, isNFT: true } : n));
    showToast(`💫 ${selectedNFT.name} улучшен до NFT!`);
    setSelectedNFT(null); setNftAction(null);
  };

  const callIcon = (type: string) => {
    if (type === "in") return <Icon name="PhoneIncoming" size={15} className="call-icon in" />;
    if (type === "out") return <Icon name="PhoneOutgoing" size={15} className="call-icon out" />;
    return <Icon name="PhoneMissed" size={15} className="call-icon missed" />;
  };

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
                  <div className="ime-chat-top"><span className="ime-chat-name">{chat.name}</span><span className="ime-chat-time">{chat.time}</span></div>
                  <div className="ime-chat-bottom"><span className="ime-chat-last">{chat.lastMessage}</span>{chat.unread > 0 && <span className="ime-unread">{chat.unread}</span>}</div>
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
              <div className="ime-avatar-wrap"><div className="ime-avatar" style={{ background: getAvatarBg(call.avatar) }}>{call.avatar}</div></div>
              <div className="ime-call-info">
                <div className="ime-call-top"><span className="ime-call-name">{call.name}</span><button className="ime-icon-btn small" onClick={() => setActiveCall(call)}><Icon name="Phone" size={15} /></button></div>
                <div className="ime-call-bottom">{callIcon(call.type)}<span className="ime-call-date">{call.date}</span>{call.duration && <span className="ime-call-dur">· {call.duration}</span>}</div>
              </div>
            </div>
          ))}
        </div>}

        {/* GIFTS / NFT MARKET */}
        {tab === "gifts" && <div className="gifts-panel">
          {/* Sub-tabs */}
          <div className="gifts-subtabs">
            {(["market","my","activity"] as GiftsTab[]).map((t) => (
              <button key={t} className={`gifts-subtab ${giftsTab === t ? "active" : ""}`} onClick={() => setGiftsTab(t)}>
                {t === "market" ? "🏪 Рынок" : t === "my" ? "💎 Мои NFT" : "📊 История"}
              </button>
            ))}
          </div>

          {/* MARKET */}
          {giftsTab === "market" && <>
            <div className="market-filters">
              <select className="market-select" value={rarityFilter} onChange={(e) => setRarityFilter(e.target.value as Rarity | "all")}>
                <option value="all">Все редкости</option>
                {(Object.keys(RARITY_META) as Rarity[]).map((r) => <option key={r} value={r}>{RARITY_META[r].label}</option>)}
              </select>
              <select className="market-select" value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}>
                <option value="rarity">По редкости</option>
                <option value="price_asc">Дешевле</option>
                <option value="price_desc">Дороже</option>
              </select>
            </div>
            <div className="nft-market-grid">
              {filteredGifts.map((gift) => (
                <NFTCard key={gift.id} gift={gift}
                  onBuy={() => { setSelectedNFT(gift); setNftAction("buy"); }}
                  onRent={() => { setSelectedNFT(gift); setNftAction("rent"); }}
                  onSend={() => { pushMsg({ mine: true, time: now(), status: "sent", mediaType: "gift", gift }); setTab("chats"); showToast(`🎁 ${gift.name} отправлен!`); }}
                />
              ))}
            </div>
          </>}

          {/* MY NFTS */}
          {giftsTab === "my" && <div className="my-nfts-list">
            <div className="my-nfts-stat-row">
              <div className="my-nft-stat"><div className="my-nft-stat-val">{myNfts.filter((n) => n.isNFT).length}</div><div className="my-nft-stat-label">NFT</div></div>
              <div className="my-nft-stat"><div className="my-nft-stat-val">{myNfts.filter((n) => n.status === "listed").length}</div><div className="my-nft-stat-label">На продаже</div></div>
              <div className="my-nft-stat"><div className="my-nft-stat-val">{myNfts.reduce((a, n) => a + n.price, 0)}</div><div className="my-nft-stat-label">💎 TON</div></div>
            </div>
            {myNfts.map((nft) => (
              <MyNFTCard key={nft.id + nft.tokenId} nft={nft}
                onList={() => showToast(nft.status === "owned" ? "📋 Выставлено на продажу" : "❌ Снято с продажи")}
                onUpgrade={() => { setSelectedNFT(nft); setNftAction("upgrade"); }}
              />
            ))}
          </div>}

          {/* ACTIVITY */}
          {giftsTab === "activity" && <div className="activity-list">
            <div className="ime-section-title">История операций</div>
            {ACTIVITY.map((tx) => (
              <div key={tx.id} className="activity-item">
                <div className="activity-icon">{tx.icon}</div>
                <div className="activity-info">
                  <div className="activity-label">{tx.label}</div>
                  <div className="activity-date">{tx.date}</div>
                </div>
                <div className={`activity-amount ${tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "in" : "out"}`}>
                  {tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "+" : "-"}{tx.amount} TON
                </div>
              </div>
            ))}
          </div>}
        </div>}

        {/* WALLET */}
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
            {ACTIVITY.map((tx) => (
              <div key={tx.id} className="ime-tx-item">
                <div className={`ime-tx-icon ${tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "in" : "out"}`}>
                  <Icon name={tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "ArrowDownLeft" : "ArrowUpRight"} size={16} />
                </div>
                <div className="ime-tx-info"><span className="ime-tx-label">{tx.label}</span><span className="ime-tx-date">{tx.date}</span></div>
                <span className={`ime-tx-amount ${tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "in" : "out"}`}>
                  {tx.type === "in" || tx.type === "gift_sell" || tx.type === "rent" ? "+" : "-"}{tx.amount}
                </span>
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

      {/* ── MAIN AREA ── */}
      <main className="ime-main">
        {activeChat && tab === "chats" ? (<>
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
              <button className="ime-icon-btn" onClick={() => setTab("gifts")}><Icon name="Gift" size={18} /></button>
              <button className="ime-icon-btn"><Icon name="MoreVertical" size={18} /></button>
            </div>
          </header>

          <div className="ime-messages" style={currentWp.style as React.CSSProperties}>
            <div className="ime-date-divider"><span>Сегодня</span></div>
            {activeChat.messages.map((msg, i) => (
              <div key={msg.id} className={`ime-msg-row ${msg.mine ? "mine" : "theirs"}`} style={{ animationDelay: `${i * 0.03}s` }}>
                <div className={`ime-bubble ${msg.mine ? "mine" : "theirs"} ${msg.mediaType ? "media" : ""}`}>
                  {msg.mediaType === "image" && msg.mediaUrl && <img src={msg.mediaUrl} className="ime-msg-img" alt="фото" />}
                  {msg.mediaType === "video" && msg.mediaUrl && <video src={msg.mediaUrl} className="ime-msg-img" controls />}
                  {msg.mediaType === "file" && <div className="ime-msg-file"><Icon name="FileText" size={28} className="ime-file-icon" /><div><div className="ime-file-name">{msg.fileName}</div><div className="ime-file-size">{msg.fileSize}</div></div></div>}
                  {msg.mediaType === "sticker" && <span className="ime-msg-sticker">{msg.emoji}</span>}
                  {msg.mediaType === "gift" && msg.gift && (
                    <div className="ime-msg-gift" style={{ background: msg.gift.bg }}>
                      <div className="nft-particle" style={{ background: msg.gift.particleColor }} />
                      <span className="ime-msg-gift-emoji">{msg.gift.emoji}</span>
                      <div className="ime-msg-gift-info">
                        <span className="ime-msg-gift-name">{msg.gift.name}</span>
                        <span style={{ color: RARITY_META[msg.gift.rarity].color, fontSize: 11 }}>{RARITY_META[msg.gift.rarity].label}</span>
                        {msg.gift.isNFT && <span className="nft-badge mini">NFT</span>}
                      </div>
                    </div>
                  )}
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

          {panelMode === "emoji" && (
            <div className="ime-emoji-panel">
              <div className="ime-emoji-tabs">
                <button className={`ime-emoji-subtab ${emojiSubTab === "emoji" ? "active" : ""}`} onClick={() => setEmojiSubTab("emoji")}>😀 Эмодзи</button>
                <button className={`ime-emoji-subtab ${emojiSubTab === "stickers" ? "active" : ""}`} onClick={() => setEmojiSubTab("stickers")}>🐱 Стикеры</button>
              </div>
              {emojiSubTab === "emoji" && <>
                <div className="ime-emoji-cats">
                  {EMOJI_CATS.map((c) => (<button key={c.id} className={`ime-emoji-cat-btn ${emojiCat === c.id ? "active" : ""}`} onClick={() => setEmojiCat(c.id)}>{c.icon}</button>))}
                </div>
                <div className="ime-emoji-grid">
                  {currentEmojis.map((emoji, i) => (<button key={i} className="ime-emoji-btn" onClick={() => { pushMsg({ text: emoji, mine: true, time: now(), status: "sent" }); }}>{emoji}</button>))}
                </div>
              </>}
              {emojiSubTab === "stickers" && (
                <div className="ime-sticker-grid">
                  {STICKERS.map((s) => (<button key={s.id} className="ime-sticker-btn" onClick={() => { pushMsg({ mine: true, time: now(), status: "sent", mediaType: "sticker", emoji: s.emoji }); setPanelMode(null); }}><span>{s.emoji}</span></button>))}
                </div>
              )}
            </div>
          )}

          {panelMode === "attach" && (
            <div className="ime-attach-panel">
              {[
                { icon: "Image", label: "Фото", accept: "image/*", cls: "photo" },
                { icon: "Video", label: "Видео", accept: "video/*", cls: "video" },
                { icon: "FileText", label: "Файл", accept: "*/*", cls: "file" },
              ].map((item) => (
                <button key={item.label} className="ime-attach-btn" onClick={() => { fileInputRef.current!.accept = item.accept; fileInputRef.current!.click(); }}>
                  <div className={`ime-attach-icon ${item.cls}`}><Icon name={item.icon as "Image"} size={22} /></div>
                  <span>{item.label}</span>
                </button>
              ))}
              <button className="ime-attach-btn" onClick={() => { setTab("gifts"); setPanelMode(null); }}>
                <div className="ime-attach-icon gift"><Icon name="Gift" size={22} /></div><span>Подарок</span>
              </button>
              <button className="ime-attach-btn" onClick={() => { setTab("wallet"); setPanelMode(null); }}>
                <div className="ime-attach-icon ton"><span style={{ fontSize: 22 }}>💎</span></div><span>TON</span>
              </button>
            </div>
          )}

          <div className="ime-input-bar">
            <button className={`ime-icon-btn ${panelMode === "emoji" ? "active-panel" : ""}`} onClick={() => setPanelMode((p) => p === "emoji" ? null : "emoji")}><Icon name="Smile" size={20} /></button>
            <textarea ref={textareaRef} className="ime-input" placeholder="Сообщение..." value={input} onChange={handleTextInput} onKeyDown={handleKey} rows={1} />
            <button className={`ime-icon-btn ${panelMode === "attach" ? "active-panel" : ""}`} onClick={() => setPanelMode((p) => p === "attach" ? null : "attach")}><Icon name="Paperclip" size={18} /></button>
            <button className={`ime-send-btn ${input.trim() ? "active" : ""}`} onClick={sendMessage}><Icon name="Send" size={18} /></button>
          </div>
          <input ref={fileInputRef} type="file" style={{ display: "none" }} onChange={handleFileChange} />
        </>) : (
          <div className="ime-empty-state">
            <div className="ime-empty-icon">{tab === "calls" ? "📞" : tab === "gifts" ? "🎁" : tab === "wallet" ? "💎" : tab === "profile" ? "👤" : "💬"}</div>
            <div className="ime-empty-title">{tab === "chats" ? "Выберите чат" : tab === "calls" ? "Звонки" : tab === "gifts" ? "NFT Рынок" : tab === "wallet" ? "TON Кошелёк" : "Профиль"}</div>
            <div className="ime-empty-sub">Управление в панели слева</div>
          </div>
        )}
      </main>

      {/* ── NFT ACTION MODAL ── */}
      {selectedNFT && nftAction && (
        <div className="ime-call-overlay" onClick={() => { setSelectedNFT(null); setNftAction(null); }}>
          <div className="nft-modal" onClick={(e) => e.stopPropagation()} style={{ "--nft-glow": RARITY_META[selectedNFT.rarity].glow } as React.CSSProperties}>
            <div className="nft-modal-preview" style={{ background: selectedNFT.bg }}>
              <div className="nft-particle" style={{ background: selectedNFT.particleColor }} />
              <div className="nft-particle p2" style={{ background: selectedNFT.particleColor }} />
              <div className="nft-particle p3" style={{ background: selectedNFT.particleColor }} />
              <span className="nft-modal-emoji">{selectedNFT.emoji}</span>
            </div>
            <div className="nft-modal-title">{selectedNFT.name}</div>
            <div className="nft-modal-collection">{selectedNFT.collection}</div>
            <div className="nft-rarity-badge large" style={{ color: RARITY_META[selectedNFT.rarity].color, borderColor: RARITY_META[selectedNFT.rarity].border, background: RARITY_META[selectedNFT.rarity].glow }}>
              {RARITY_META[selectedNFT.rarity].label}
            </div>

            {/* Attributes */}
            <div className="nft-attrs">
              {selectedNFT.attrs.map((a, i) => (
                <div key={i} className="nft-attr-chip">
                  <div className="nft-attr-trait">{a.trait}</div>
                  <div className="nft-attr-value">{a.value}</div>
                  <div className="nft-attr-rarity">{a.rarity}%</div>
                </div>
              ))}
            </div>

            <div className="nft-modal-info">
              <div className="nft-info-row"><span>Предложение</span><span>{selectedNFT.totalSupply.toLocaleString()} шт.</span></div>
              <div className="nft-info-row"><span>Владельцев</span><span>{selectedNFT.owners.toLocaleString()}</span></div>
              {nftAction === "buy" && <div className="nft-info-row price"><span>Цена</span><span>💎 {selectedNFT.price} TON</span></div>}
              {nftAction === "rent" && <div className="nft-info-row price"><span>Аренда / 3 дня</span><span>💎 {(selectedNFT.rentPricePerDay ?? 0) * 3} TON</span></div>}
              {nftAction === "upgrade" && <div className="nft-info-row price"><span>Стоимость</span><span>⭐ {selectedNFT.upgradeStars} Stars</span></div>}
            </div>

            {nftAction === "upgrade" && (
              <div className="nft-upgrade-note">После улучшения нужно подождать 21 день, затем вывести в блокчейн TON</div>
            )}

            <div className="nft-modal-btns">
              <button className="nft-modal-cancel" onClick={() => { setSelectedNFT(null); setNftAction(null); }}>Отмена</button>
              <button className="nft-modal-confirm"
                onClick={nftAction === "buy" ? confirmBuy : nftAction === "rent" ? confirmRent : confirmUpgrade}>
                {nftAction === "buy" ? `Купить за ${selectedNFT.price} TON` : nftAction === "rent" ? `Арендовать` : `Улучшить за ${selectedNFT.upgradeStars} ⭐`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CALL OVERLAY */}
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

      {/* TOAST */}
      {toast && <div className="ime-toast">{toast}</div>}
    </div>
  );
}
