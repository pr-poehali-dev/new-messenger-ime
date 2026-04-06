import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

type Tab = "chats" | "calls" | "gifts" | "wallet" | "profile";
type GiftsTab = "market" | "my" | "activity";
type CollectionFilter = "all" | "ultra_rare" | "celebrity" | "seasonal" | "special";
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

// helper
const g = (
  id: string, emoji: string, name: string, col: string,
  price: number, rarity: Rarity, supply: number,
  bg: string, pc: string,
  attrs: { trait: string; value: string; rarity: number }[],
  isNFT = true, rent?: number
): NFTGift => ({
  id, emoji, name, collection: col,
  price, floorPrice: Math.round(price * 0.88),
  rarity, totalSupply: supply,
  owners: Math.round(supply * 0.62),
  isNFT, isForSale: true,
  isForRent: !!rent, rentPricePerDay: rent,
  upgradeStars: 25, attrs, bg, particleColor: pc,
});

const NFT_GIFTS: NFTGift[] = [
  // ── ULTRA RARE (legendary / special) ──────────────────────────────────────
  g("heart-locket","💛","Heart Locket","Ultra Rare",18500,"special",1970,"linear-gradient(135deg,#2a0a14,#5a0a28)","#FF6B8A",[{trait:"Металл",value:"Золото",rarity:2},{trait:"Камень",value:"Рубин",rarity:1}],true,60),
  g("durovs-cap","🧢","Durov's Cap","Ultra Rare",12400,"special",5000,"linear-gradient(135deg,#0a0a1a,#1a1a3a)","#7C6FFF",[{trait:"Цвет",value:"Тёмно-синий",rarity:5},{trait:"Логотип",value:"Telegram",rarity:3}],true,40),
  g("golden-key","🔑","Golden Key","Ultra Rare",9800,"special",3000,"linear-gradient(135deg,#1a1000,#3a2800)","#FFB347",[{trait:"Металл",value:"Золото",rarity:3},{trait:"Гравировка",value:"TON",rarity:2}],true,30),
  g("precious-peach","🍑","Precious Peach","Ultra Rare",8700,"legendary",3200,"linear-gradient(135deg,#2a1000,#4a2010)","#FF9A5C",[{trait:"Спелость",value:"Идеальная",rarity:4},{trait:"Цвет",value:"Золотистый",rarity:6}],true,25),
  g("plush-pepe","🐸","Plush Pepe","Ultra Rare",6500,"legendary",10000,"linear-gradient(135deg,#0a1a0a,#102010)","#3ECFB2",[{trait:"Материал",value:"Плюш",rarity:5},{trait:"Глаза",value:"Классические",rarity:8}],true,20),
  g("diamond-dog","💎","Diamond Dog","Ultra Rare",5200,"legendary",7500,"linear-gradient(135deg,#080a1f,#12163a)","#c37dff",[{trait:"Порода",value:"Бульдог",rarity:6},{trait:"Огранка",value:"Brilliant",rarity:4}],true,18),
  g("heroic-helmet","⛑️","Heroic Helmet","Ultra Rare",4100,"legendary",3800,"linear-gradient(135deg,#1a0a0a,#3a1010)","#FF6B8A",[{trait:"Металл",value:"Сталь",rarity:7},{trait:"Гребень",value:"Золотой",rarity:5}],true,14),
  g("mighty-arm","💪","Mighty Arm","Ultra Rare",3800,"legendary",4100,"linear-gradient(135deg,#0a0a1a,#1a1040)","#7C6FFF",[{trait:"Браслет",value:"Энергетический",rarity:6},{trait:"Мощь",value:"Максимальная",rarity:3}],true,12),
  g("ion-gem","💠","Ion Gem","Ultra Rare",3200,"legendary",4700,"linear-gradient(135deg,#060a18,#0e1630)","#3ECFB2",[{trait:"Тип",value:"Ион",rarity:8},{trait:"Свечение",value:"Плазма",rarity:4}],true,10),
  g("nail-bracelet","📿","Nail Bracelet","Ultra Rare",2900,"legendary",4800,"linear-gradient(135deg,#1a0820,#2a1040)","#c37dff",[{trait:"Материал",value:"Нержавейка",rarity:9},{trait:"Гравировка",value:"Руны",rarity:5}],true,9),
  g("perfume-bottle","🧴","Perfume Bottle","Ultra Rare",2700,"legendary",4800,"linear-gradient(135deg,#0a1828,#102038)","#7C6FFF",[{trait:"Аромат",value:"Таинственный",rarity:7},{trait:"Флакон",value:"Хрусталь",rarity:5}],true,9),
  g("magic-potion","🧪","Magic Potion","Ultra Rare",2500,"legendary",4900,"linear-gradient(135deg,#0a200a,#102810)","#3ECFB2",[{trait:"Цвет",value:"Изумрудный",rarity:6},{trait:"Эффект",value:"Телепортация",rarity:4}],true,8),
  g("mini-oscar","🏆","Mini Oscar","Ultra Rare",2200,"legendary",5600,"linear-gradient(135deg,#1a1000,#2e1e00)","#FFB347",[{trait:"Металл",value:"Золото",rarity:5},{trait:"Гравировка",value:"Уникальная",rarity:3}],true,7),
  g("signet-ring","💍","Signet Ring","Ultra Rare",1900,"legendary",18500,"linear-gradient(135deg,#1a0a0a,#2a1010)","#FF6B8A",[{trait:"Камень",value:"Рубин",rarity:8},{trait:"Металл",value:"Золото",rarity:6}],true,6),
  g("loot-bag","🎒","Loot Bag","Ultra Rare",1700,"legendary",14500,"linear-gradient(135deg,#0a0e1a,#141e30)","#7C6FFF",[{trait:"Содержимое",value:"Секрет",rarity:3},{trait:"Замок",value:"Магический",rarity:5}],true,5),
  g("kissed-frog","🐸","Kissed Frog","Ultra Rare",1500,"legendary",14300,"linear-gradient(135deg,#0a1a0a,#0e2410)","#3ECFB2",[{trait:"Выражение",value:"Счастливое",rarity:10},{trait:"Корона",value:"Золотая",rarity:4}],true,5),

  // ── EPIC ──────────────────────────────────────────────────────────────────
  g("astral-shard","🔮","Astral Shard","Mystic",980,"epic",6200,"linear-gradient(135deg,#080a1f,#12163a)","#c37dff",[{trait:"Кристалл",value:"Астральный",rarity:9},{trait:"Свечение",value:"Пульсирующее",rarity:7}],true,3),
  g("gem-signet","💎","Gem Signet","Jewels",860,"epic",7000,"linear-gradient(135deg,#0d0a2e,#1a1060)","#7C6FFF",[{trait:"Огранка",value:"Изумруд",rarity:11},{trait:"Оправа",value:"Платина",rarity:7}],true,3),
  g("artisan-brick","🧱","Artisan Brick","Craft",720,"epic",6900,"linear-gradient(135deg,#1a0800,#2e1200)","#FFB347",[{trait:"Материал",value:"Редкая глина",rarity:12},{trait:"Узор",value:"Ручная работа",rarity:8}],true),
  g("sharp-tongue","👅","Sharp Tongue","Mystic",650,"epic",8500,"linear-gradient(135deg,#2a0a14,#4a1028)","#FF6B8A",[{trait:"Острота",value:"Максимальная",rarity:6},{trait:"Цвет",value:"Пурпурный",rarity:9}],true,2),
  g("bonded-ring","💍","Bonded Ring","Jewels",580,"epic",8100,"linear-gradient(135deg,#100818,#1e1030)","#c37dff",[{trait:"Связь",value:"Вечная",rarity:8},{trait:"Камень",value:"Аметист",rarity:11}],true,2),
  g("electric-skull","💀","Electric Skull","Dark",520,"epic",9400,"linear-gradient(135deg,#0a0a0a,#1a1020)","#c37dff",[{trait:"Разряд",value:"Молния",rarity:7},{trait:"Глаза",value:"Неон",rarity:9}],true,2),
  g("scared-cat","🐱","Scared Cat","Animals",480,"epic",19300,"linear-gradient(135deg,#0a0a1a,#10102a)","#7C6FFF",[{trait:"Выражение",value:"Испуганное",rarity:14},{trait:"Окрас",value:"Полосатый",rarity:18}],true,2),
  g("neko-helmet","🪖","Neko Helmet","Cosplay",440,"epic",16100,"linear-gradient(135deg,#0a1828,#102038)","#3ECFB2",[{trait:"Ушки",value:"Розовые",rarity:12},{trait:"Стиль",value:"Аниме",rarity:8}],true),
  g("crystal-ball","🔮","Crystal Ball","Mystic",410,"epic",27700,"linear-gradient(135deg,#100a28,#1e1048)","#c37dff",[{trait:"Видение",value:"Будущее",rarity:10},{trait:"Туман",value:"Фиолетовый",rarity:13}],true,1),
  g("skull-flower","💀","Skull Flower","Dark",380,"epic",24100,"linear-gradient(135deg,#0a0a14,#141428)","#FF6B8A",[{trait:"Цветок",value:"Чёрная роза",rarity:9},{trait:"Взгляд",value:"Загадочный",rarity:11}],true),
  g("voodoo-doll","🪆","Voodoo Doll","Dark",360,"epic",27600,"linear-gradient(135deg,#140a08,#281410)","#FF9A5C",[{trait:"Игла",value:"Серебряная",rarity:8},{trait:"Нить",value:"Красная",rarity:10}],true),
  g("flying-broom","🧹","Flying Broom","Magic",340,"epic",25900,"linear-gradient(135deg,#0c0814,#181028)","#c37dff",[{trait:"Скорость",value:"Гиперзвук",rarity:6},{trait:"Рукоять",value:"Дуб",rarity:12}],true),
  g("ionic-dryer","💨","Ionic Dryer","Tech",320,"epic",25700,"linear-gradient(135deg,#0a1020,#101828)","#3ECFB2",[{trait:"Мощность",value:"5000W",rarity:7},{trait:"Технология",value:"Ионная",rarity:5}],true),
  g("trapped-heart","💔","Trapped Heart","Romance",300,"epic",26400,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Цепи",value:"Золотые",rarity:9},{trait:"Разлом",value:"Трещина судьбы",rarity:6}],true),
  g("love-potion","🧪","Love Potion","Magic",280,"epic",30400,"linear-gradient(135deg,#1a0010,#2e0020)","#FF6B8A",[{trait:"Аромат",value:"Розовый",rarity:11},{trait:"Эффект",value:"Неотразимость",rarity:7}],true),
  g("diamond-ring","💍","Diamond Ring","Jewels",260,"epic",32900,"linear-gradient(135deg,#0a0a18,#14143a)","#7C6FFF",[{trait:"Камень",value:"Бриллиант",rarity:8},{trait:"Огранка",value:"Принцесса",rarity:6}],true),
  g("top-hat","🎩","Top Hat","Fashion",240,"epic",35100,"linear-gradient(135deg,#080808,#181818)","#8890a4",[{trait:"Материал",value:"Шёлк",rarity:10},{trait:"Лента",value:"Пурпурная",rarity:12}],true),
  g("vintage-cigar","🚬","Vintage Cigar","Lifestyle",220,"epic",31000,"linear-gradient(135deg,#1a0e04,#2e1c08)","#FFB347",[{trait:"Выдержка",value:"50 лет",rarity:5},{trait:"Происхождение",value:"Куба",rarity:7}],true),
  g("mad-pumpkin","🎃","Mad Pumpkin","Halloween",200,"epic",22200,"linear-gradient(135deg,#1e0a00,#3c1400)","#FF9A5C",[{trait:"Выражение",value:"Безумное",rarity:8},{trait:"Резьба",value:"Узор тьмы",rarity:6}],true),
  g("swiss-watch","⌚","Swiss Watch","Luxury",185,"epic",29300,"linear-gradient(135deg,#0a0e18,#14182e)","#8890a4",[{trait:"Механизм",value:"Турбийон",rarity:4},{trait:"Корпус",value:"Платина",rarity:5}],true),
  g("cupid-charm","💘","Cupid Charm","Romance",170,"epic",33100,"linear-gradient(135deg,#1a0010,#30001e)","#FF6B8A",[{trait:"Стрела",value:"Золотая",rarity:9},{trait:"Эффект",value:"Вечная любовь",rarity:6}],true),

  // ── RARE ──────────────────────────────────────────────────────────────────
  g("hanging-star","⭐","Hanging Star","Celestial",145,"rare",58100,"linear-gradient(135deg,#0e0c1a,#1a1830)","#FFB347",[{trait:"Нить",value:"Серебро",rarity:18},{trait:"Блеск",value:"Пульсация",rarity:14}],true),
  g("eternal-candle","🕯️","Eternal Candle","Mystic",130,"rare",46600,"linear-gradient(135deg,#1a1000,#2e1c00)","#FFB347",[{trait:"Пламя",value:"Вечное",rarity:16},{trait:"Воск",value:"Чёрный",rarity:20}],true),
  g("record-player","🎵","Record Player","Music",118,"rare",46900,"linear-gradient(135deg,#0a0a14,#141428)","#8890a4",[{trait:"Пластинка",value:"Ретро",rarity:20},{trait:"Игла",value:"Золотая",rarity:15}],true),
  g("hex-pot","⚗️","Hex Pot","Magic",105,"rare",69800,"linear-gradient(135deg,#0a1a0a,#101e10)","#3ECFB2",[{trait:"Зелье",value:"Проклятие",rarity:17},{trait:"Пар",value:"Фиолетовый",rarity:22}],true),
  g("berry-box","🫐","Berry Box","Food",95,"rare",66600,"linear-gradient(135deg,#100820,#1c1038)","#c37dff",[{trait:"Ягоды",value:"Черника",rarity:24},{trait:"Коробка",value:"Деревянная",rarity:30}],true),
  g("bow-tie","🎀","Bow Tie","Fashion",88,"rare",65700,"linear-gradient(135deg,#1a0010,#2e0020)","#FF6B8A",[{trait:"Цвет",value:"Малиновый",rarity:22},{trait:"Материал",value:"Шёлк",rarity:18}],true),
  g("valentine-box","💝","Valentine Box","Romance",80,"rare",41000,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Начинка",value:"Трюфели",rarity:25},{trait:"Лента",value:"Золотая",rarity:18}],true),
  g("snow-globe","❄️","Snow Globe","Winter",75,"rare",72800,"linear-gradient(135deg,#0a1428,#0e1e3c)","#3ECFB2",[{trait:"Фигурка",value:"Ёлочка",rarity:20},{trait:"Снег",value:"Серебряный",rarity:25}],true),
  g("love-candle","🕯️","Love Candle","Romance",70,"rare",30300,"linear-gradient(135deg,#1a0810,#2e1020)","#FF6B8A",[{trait:"Аромат",value:"Роза",rarity:18},{trait:"Цвет",value:"Красный",rarity:22}],true),
  g("sleigh-bell","🔔","Sleigh Bell","Winter",65,"rare",28000,"linear-gradient(135deg,#0a1208,#101e0e)","#3ECFB2",[{trait:"Металл",value:"Серебро",rarity:20},{trait:"Звук",value:"Магический",rarity:15}],true),
  g("toy-bear","🧸","Toy Bear","Toys",60,"rare",57700,"linear-gradient(135deg,#1a0e04,#2e1a08)","#FFB347",[{trait:"Мех",value:"Плюш",rarity:28},{trait:"Глазки",value:"Пуговицы",rarity:32}],true),
  g("sky-stilettos","👠","Sky Stilettos","Fashion",55,"rare",58600,"linear-gradient(135deg,#1a0010,#2a0018)","#FF6B8A",[{trait:"Высота",value:"15 см",rarity:10},{trait:"Материал",value:"Кожа питона",rarity:14}],true),
  g("eternal-rose","🌹","Eternal Rose","Flowers",50,"rare",37600,"linear-gradient(135deg,#1a0808,#300c0c)","#FF6B8A",[{trait:"Цвет",value:"Чёрный",rarity:15},{trait:"Вечность",value:"Заморожена",rarity:10}],true),
  g("snow-mittens","🧤","Snow Mittens","Winter",45,"rare",50000,"linear-gradient(135deg,#0a1428,#102040)","#3ECFB2",[{trait:"Узор",value:"Скандинавский",rarity:25},{trait:"Цвет",value:"Красный",rarity:30}],true),

  // ── COMMON (seasonal, массовые) ────────────────────────────────────────────
  g("lunar-snake","🐍","Lunar Snake","Zodiac",38,"common",259300,"linear-gradient(135deg,#0a1a08,#0e2210)","#3ECFB2",[{trait:"Год",value:"Змеи",rarity:50},{trait:"Фаза",value:"Полнолуние",rarity:40}],false),
  g("moon-pendant","🌙","Moon Pendant","Celestial",35,"common",111100,"linear-gradient(135deg,#0a0e1a,#10162a)","#8890a4",[{trait:"Фаза",value:"Убывающая",rarity:40},{trait:"Цвет",value:"Серебряный",rarity:45}],false),
  g("sakura-flower","🌸","Sakura Flower","Flowers",32,"common",93100,"linear-gradient(135deg,#1a0814,#2e1020)","#FF6B8A",[{trait:"Лепестки",value:"5",rarity:50},{trait:"Сезон",value:"Весна",rarity:45}],false),
  g("holiday-drink","🥂","Holiday Drink","Celebration",30,"common",121000,"linear-gradient(135deg,#1a1000,#2e1e00)","#FFB347",[{trait:"Напиток",value:"Шампанское",rarity:45},{trait:"Пузырьки",value:"Золотые",rarity:50}],false),
  g("jelly-bunny","🐰","Jelly Bunny","Animals",28,"common",129400,"linear-gradient(135deg,#1a0814,#2e1020)","#FF6B8A",[{trait:"Вкус",value:"Клубника",rarity:40},{trait:"Цвет",value:"Розовый",rarity:45}],false),
  g("light-sword","⚔️","Light Sword","Fantasy",26,"common",131200,"linear-gradient(135deg,#0a0a1a,#101030)","#7C6FFF",[{trait:"Цвет",value:"Синий",rarity:45},{trait:"Сила",value:"Джедайская",rarity:40}],false),
  g("jingle-bells","🔔","Jingle Bells","Winter",24,"common",124600,"linear-gradient(135deg,#0a1208,#101e0e)","#3ECFB2",[{trait:"Количество",value:"3",rarity:50},{trait:"Материал",value:"Медь",rarity:45}],false),
  g("lush-bouquet","💐","Lush Bouquet","Flowers",22,"common",140100,"linear-gradient(135deg,#0a1808,#0e2210)","#3ECFB2",[{trait:"Состав",value:"Смешанный",rarity:50},{trait:"Лента",value:"Розовая",rarity:45}],false),
  g("spiced-wine","🍷","Spiced Wine","Food",20,"common",146100,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Сорт",value:"Глинтвейн",rarity:45},{trait:"Специи",value:"Корица",rarity:50}],false),
  g("stellar-rocket","🚀","Stellar Rocket","Space",18,"common",156300,"linear-gradient(135deg,#080a14,#101828)","#7C6FFF",[{trait:"Цвет",value:"Красный",rarity:45},{trait:"Топливо",value:"TON",rarity:40}],false),
  g("big-year","🎊","Big Year","Celebration",16,"common",101400,"linear-gradient(135deg,#1a1000,#2e1e00)","#FFB347",[{trait:"Год",value:"2026",rarity:50},{trait:"Конфетти",value:"Золотое",rarity:45}],false),
  g("restless-jar","🫙","Restless Jar","Mystic",15,"common",120200,"linear-gradient(135deg,#0a1008,#101e10)","#3ECFB2",[{trait:"Содержимое",value:"Светлячки",rarity:50},{trait:"Крышка",value:"Деревянная",rarity:45}],false),
  g("joyful-bundle","🎁","Joyful Bundle","Celebration",14,"common",114100,"linear-gradient(135deg,#1a0010,#2a0018)","#FF6B8A",[{trait:"Лента",value:"Красная",rarity:50},{trait:"Бумага",value:"Золотая",rarity:45}],false),
  g("easter-egg","🥚","Easter Egg","Seasonal",13,"common",173200,"linear-gradient(135deg,#0a1828,#102038)","#3ECFB2",[{trait:"Рисунок",value:"Цветочный",rarity:45},{trait:"Цвет",value:"Пастель",rarity:50}],false),
  g("spy-agaric","🍄","Spy Agaric","Nature",12,"common",89400,"linear-gradient(135deg,#0e0808,#1e0e0e)","#FF6B8A",[{trait:"Шляпка",value:"Красная",rarity:50},{trait:"Горошек",value:"Белый",rarity:45}],false),
  g("winter-wreath","🪢","Winter Wreath","Winter",11,"common",100800,"linear-gradient(135deg,#0a1208,#0e1e0e)","#3ECFB2",[{trait:"Состав",value:"Ель",rarity:50},{trait:"Декор",value:"Ягоды",rarity:45}],false),
  g("hypno-lollipop","🍭","Hypno Lollipop","Food",10,"common",116600,"linear-gradient(135deg,#100818,#1e1030)","#c37dff",[{trait:"Узор",value:"Гипноз",rarity:45},{trait:"Цвет",value:"Радужный",rarity:50}],false),
  g("jack-in-the-box","🎪","Jack-in-the-Box","Toys",9,"common",97300,"linear-gradient(135deg,#1a0800,#2e1200)","#FFB347",[{trait:"Персонаж",value:"Шут",rarity:50},{trait:"Пружина",value:"Стальная",rarity:45}],false),
  g("witch-hat","🧙","Witch Hat","Halloween",8,"common",88500,"linear-gradient(135deg,#080808,#141420)","#c37dff",[{trait:"Размер",value:"Гигантский",rarity:50},{trait:"Полоска",value:"Золотая",rarity:45}],false),
  g("star-notepad","📓","Star Notepad","Office",7,"common",99100,"linear-gradient(135deg,#0a0e1a,#101628)","#7C6FFF",[{trait:"Обложка",value:"Звёзды",rarity:50},{trait:"Бумага",value:"Небесная",rarity:45}],false),
  g("evil-eye","👁️","Evil Eye","Mystic",6,"common",85200,"linear-gradient(135deg,#080c18,#0e1428)","#3ECFB2",[{trait:"Цвет",value:"Синий",rarity:50},{trait:"Сила",value:"Защита",rarity:45}],false),
  g("tama-gadget","📱","Tama Gadget","Tech",5,"common",135100,"linear-gradient(135deg,#0a0e1a,#101828)","#7C6FFF",[{trait:"Питомец",value:"Котик",rarity:45},{trait:"Экран",value:"LCD",rarity:50}],false),
  g("cookie-heart","🍪","Cookie Heart","Food",4,"common",264500,"linear-gradient(135deg,#1a0e04,#2e1a08)","#FFB347",[{trait:"Вкус",value:"Шоколад",rarity:50},{trait:"Глазурь",value:"Розовая",rarity:45}],false),
  g("xmas-stocking","🧦","Xmas Stocking","Winter",3,"common",334600,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Узор",value:"Олени",rarity:50},{trait:"Подарок",value:"Есть",rarity:45}],false),
  g("b-day-candle","🕯️","B-Day Candle","Celebration",3,"common",308600,"linear-gradient(135deg,#1a1000,#2e1e00)","#FFB347",[{trait:"Цвет",value:"Золотой",rarity:50},{trait:"Огонь",value:"Сердечко",rarity:45}],false),
  g("candy-cane","🍬","Candy Cane","Winter",3,"common",320600,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Вкус",value:"Мята",rarity:50},{trait:"Полосы",value:"Красные",rarity:45}],false),
  g("desk-calendar","📅","Desk Calendar","Office",2,"common",374100,"linear-gradient(135deg,#0a0e1a,#101628)","#8890a4",[{trait:"Год",value:"2026",rarity:50},{trait:"Обложка",value:"Кожаная",rarity:45}],false),
  g("instant-ramen","🍜","Instant Ramen","Food",2,"common",457400,"linear-gradient(135deg,#1a0800,#2e1200)","#FF9A5C",[{trait:"Вкус",value:"Острый",rarity:50},{trait:"Лапша",value:"Рамен",rarity:45}],false),
  g("lol-pop","🍭","Lol Pop","Food",1,"common",468700,"linear-gradient(135deg,#100818,#1e1030)","#c37dff",[{trait:"Вкус",value:"Арбуз",rarity:50},{trait:"Эффект",value:"Смех",rarity:45}],false),
  g("clover-pin","🍀","Clover Pin","Nature",1,"common",271000,"linear-gradient(135deg,#0a1808,#102010)","#3ECFB2",[{trait:"Листьев",value:"4",rarity:30},{trait:"Удача",value:"Максимальная",rarity:35}],false),
  g("party-sparkler","🎇","Party Sparkler","Celebration",1,"common",243800,"linear-gradient(135deg,#1a1000,#2e1e00)","#FFB347",[{trait:"Цвет",value:"Золото",rarity:50},{trait:"Время",value:"60 сек",rarity:45}],false),
  g("mousse-cake","🎂","Mousse Cake","Food",1,"common",230500,"linear-gradient(135deg,#1a0814,#2e1020)","#FF6B8A",[{trait:"Вкус",value:"Шоколад",rarity:50},{trait:"Декор",value:"Ягоды",rarity:45}],false),
  g("spring-basket","🧺","Spring Basket","Seasonal",1,"common",231300,"linear-gradient(135deg,#0a1808,#0e2010)","#3ECFB2",[{trait:"Содержимое",value:"Цветы",rarity:50},{trait:"Материал",value:"Ива",rarity:45}],false),
  g("faith-amulet","🧿","Faith Amulet","Mystic",1,"common",172800,"linear-gradient(135deg,#0a0e1a,#101828)","#7C6FFF",[{trait:"Сила",value:"Защита",rarity:50},{trait:"Камень",value:"Лазурит",rarity:45}],false),
  g("fresh-socks","🧦","Fresh Socks","Fun",1,"common",200500,"linear-gradient(135deg,#080e18,#101828)","#3ECFB2",[{trait:"Узор",value:"Смайлики",rarity:50},{trait:"Размер",value:"42",rarity:45}],false),
  g("santa-hat","🎅","Santa Hat","Winter",1,"common",89000,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Помпон",value:"Белый",rarity:50},{trait:"Ткань",value:"Бархат",rarity:45}],false),
  g("homemade-cake","🎂","Homemade Cake","Food",1,"common",199500,"linear-gradient(135deg,#1a0e04,#2e1a08)","#FFB347",[{trait:"Вкус",value:"Ваниль",rarity:50},{trait:"Декор",value:"Свечи",rarity:45}],false),
  g("ginger-cookie","🍪","Ginger Cookie","Food",1,"common",188900,"linear-gradient(135deg,#1a0c04,#2e1808)","#FF9A5C",[{trait:"Форма",value:"Человечек",rarity:50},{trait:"Вкус",value:"Имбирь",rarity:45}],false),
  g("jester-hat","🃏","Jester Hat","Carnival",1,"common",190200,"linear-gradient(135deg,#100818,#1e1030)","#c37dff",[{trait:"Цвета",value:"3",rarity:50},{trait:"Бубенцы",value:"Золотые",rarity:45}],false),
  g("pet-snake","🐍","Pet Snake","Animals",1,"common",279100,"linear-gradient(135deg,#0a1808,#0e2010)","#3ECFB2",[{trait:"Окрас",value:"Зелёный",rarity:50},{trait:"Характер",value:"Ласковый",rarity:45}],false),
  g("snake-box","📦","Snake Box","Zodiac",1,"common",273900,"linear-gradient(135deg,#0a1808,#102010)","#3ECFB2",[{trait:"Год",value:"Змеи",rarity:50},{trait:"Сюрприз",value:"Внутри",rarity:45}],false),
  g("bunny-muffin","🐰","Bunny Muffin","Food",1,"common",66700,"linear-gradient(135deg,#1a0814,#2e1020)","#FF6B8A",[{trait:"Вкус",value:"Морковь",rarity:50},{trait:"Декор",value:"Ушки",rarity:45}],false),

  // ── CELEBRITY ─────────────────────────────────────────────────────────────
  g("snoop-dogg","🐕","Snoop Dogg","Celebrity",12,"common",595358,"linear-gradient(135deg,#0a1008,#101810)","#3ECFB2",[{trait:"Артист",value:"@snoopdogg",rarity:100},{trait:"Серия",value:"Официальная",rarity:100}],false),
  g("swag-bag","👜","Swag Bag","Celebrity",18,"common",239091,"linear-gradient(135deg,#0a0a14,#141428)","#7C6FFF",[{trait:"Артист",value:"@snoopdogg",rarity:100},{trait:"Содержимое",value:"Секрет",rarity:80}],false),
  g("snoop-cigar","🚬","Snoop Cigar","Celebrity",28,"rare",119806,"linear-gradient(135deg,#1a0e04,#2e1808)","#FFB347",[{trait:"Артист",value:"@snoopdogg",rarity:100},{trait:"Выдержка",value:"Особая",rarity:60}],false),
  g("low-rider","🚗","Low Rider","Celebrity",85,"epic",23991,"linear-gradient(135deg,#0a0a18,#101030)","#c37dff",[{trait:"Артист",value:"@snoopdogg",rarity:100},{trait:"Цвет",value:"Фиолетовый",rarity:20}],false),
  g("westside-sign","🤙","Westside Sign","Celebrity",280,"legendary",11995,"linear-gradient(135deg,#080a14,#10142a)","#7C6FFF",[{trait:"Артист",value:"@snoopdogg",rarity:100},{trait:"Редкость",value:"Ультра",rarity:5}],false),
  g("khabibs-papakha","🪖","Khabib's Papakha","Celebrity",120,"epic",29000,"linear-gradient(135deg,#0e1208,#182010)","#3ECFB2",[{trait:"Артист",value:"@khabib_nurmagomedov",rarity:100},{trait:"Материал",value:"Каракуль",rarity:15}],false),
  g("ufc-strike","🥊","UFC Strike","Celebrity",45,"rare",60000,"linear-gradient(135deg,#1a0808,#2e1010)","#FF6B8A",[{trait:"Организация",value:"@ufc",rarity:100},{trait:"Удар",value:"Нокаут",rarity:30}],false),
];

const MY_NFTS: MyNFT[] = [
  { ...NFT_GIFTS.find((x) => x.id === "durovs-cap")!, tokenId: "#0042", mintedAt: "15.03.2025", status: "owned" },
  { ...NFT_GIFTS.find((x) => x.id === "astral-shard")!, tokenId: "#1337", mintedAt: "02.04.2025", status: "listed", listPrice: 1100 },
  { ...NFT_GIFTS.find((x) => x.id === "eternal-rose")!, tokenId: "#0888", mintedAt: "28.03.2025", status: "rented_out", rentDays: 3 },
  { ...NFT_GIFTS.find((x) => x.id === "lunar-snake")!, tokenId: "#9012", mintedAt: "10.04.2025", status: "owned", isNFT: false },
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
  { id: 3, name: "Команда православного", avatar: "✝️", lastMessage: "Релиз сегодня в 18:00", time: "12:00", unread: 5, online: false,
    messages: [{ id: 1, text: "Все готовы?", mine: false, time: "11:50" }, { id: 2, text: "Да, тесты прошли", mine: true, time: "11:55", status: "read" }, { id: 3, text: "Релиз сегодня в 18:00", mine: false, time: "12:00" }] },
];

const initialCalls = [
  { id: 1, name: "Команда православного", avatar: "✝️", type: "in" as const, date: "Сегодня, 12:00", duration: "18 мин" },
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
  const [activeId, setActiveId] = useState<number | null>(3);
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
  const [collectionFilter, setCollectionFilter] = useState<CollectionFilter>("all");
  const [marketSearch, setMarketSearch] = useState("");
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

  const COL_FILTERS: Record<CollectionFilter, string> = {
    all: "Все", ultra_rare: "🏆 Ультра-редкие", celebrity: "⭐ Знаменитости",
    seasonal: "🎄 Сезонные", special: "✨ Особые",
  };
  const COL_SETS: Record<CollectionFilter, string[]> = {
    all: [],
    ultra_rare: ["Ultra Rare"],
    celebrity: ["Celebrity"],
    seasonal: ["Winter","Halloween","Seasonal","Zodiac","Celebration"],
    special: ["Mystic","Dark","Magic","Fantasy","Space","Celestial"],
  };

  const filteredGifts = NFT_GIFTS
    .filter((gift) => {
      if (rarityFilter !== "all" && gift.rarity !== rarityFilter) return false;
      if (collectionFilter !== "all") {
        const sets = COL_SETS[collectionFilter];
        if (!sets.some((s) => gift.collection.includes(s))) return false;
      }
      if (marketSearch) {
        const q = marketSearch.toLowerCase();
        return gift.name.toLowerCase().includes(q) || gift.collection.toLowerCase().includes(q);
      }
      return true;
    })
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
            <div className="market-search-wrap">
              <Icon name="Search" size={13} className="ime-search-icon" />
              <input className="ime-search" style={{ paddingLeft: 30, fontSize: 12 }}
                placeholder="Поиск подарка..."
                value={marketSearch} onChange={(e) => setMarketSearch(e.target.value)} />
            </div>
            <div className="market-col-chips">
              {(Object.keys(COL_FILTERS) as CollectionFilter[]).map((c) => (
                <button key={c} className={`market-col-chip ${collectionFilter === c ? "active" : ""}`}
                  onClick={() => setCollectionFilter(c)}>{COL_FILTERS[c]}</button>
              ))}
            </div>
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
            <div className="market-count">Найдено: {filteredGifts.length} подарков</div>
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