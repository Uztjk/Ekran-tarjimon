import type { CropRegion, TextBlock } from "../types/translator";

export interface SampleScreenPreset {
  id: string;
  label: string;
  langHint: string;
  sourceCode: string;
  detectedLanguage: string;
  summary: string;
  previewBlocks: TextBlock[];
  generate: () => string;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function createEnglishSettingsSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  // Background
  ctx.fillStyle = "#F2F4F7";
  ctx.fillRect(0, 0, 540, 1080);

  // Status bar
  ctx.fillStyle = "#0F172A";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("09:41", 32, 42);
  ctx.fillText("5G  86%", 425, 42);

  // Header
  ctx.font = "700 34px sans-serif";
  ctx.fillText("System Settings", 32, 110);

  // Search box
  ctx.fillStyle = "#E2E8F0";
  drawRoundedRect(ctx, 32, 136, 476, 52, 14);
  ctx.fill();
  ctx.fillStyle = "#64748B";
  ctx.font = "400 18px sans-serif";
  ctx.fillText("Search device preferences...", 54, 168);

  // Account card
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 212, 476, 104, 20);
  ctx.fill();
  ctx.fillStyle = "#2563EB";
  ctx.beginPath();
  ctx.arc(82, 264, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("AK", 68, 271);

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("Azizbek Karimov", 128, 256);
  ctx.fillStyle = "#64748B";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("Cloud Backup & Security Active", 128, 284);

  // Settings group 1
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 344, 476, 260, 20);
  ctx.fill();

  const items1 = [
    { title: "Wi-Fi & Internet", sub: "Connected to Office_5G", right: "On" },
    { title: "Bluetooth Devices", sub: "AirPods Pro connected", right: "2 devices" },
    { title: "Mobile Data Usage", sub: "14.2 GB used this month", right: "Details" },
    { title: "Battery Optimization", sub: "Estimated 18 hours left", right: "86%" },
  ];

  items1.forEach((item, i) => {
    const y = 376 + i * 64;
    if (i > 0) {
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(52, y - 24, 436, 1);
    }
    ctx.fillStyle = "#0F172A";
    ctx.font = "600 19px sans-serif";
    ctx.fillText(item.title, 52, y + 4);
    ctx.fillStyle = "#64748B";
    ctx.font = "400 15px sans-serif";
    ctx.fillText(item.sub, 52, y + 27);
    ctx.fillStyle = "#2563EB";
    ctx.font = "600 15px sans-serif";
    ctx.fillText(item.right, 410, y + 14);
  });

  // Security banner
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, 32, 632, 476, 160, 20);
  ctx.fill();
  ctx.fillStyle = "#F8FAFC";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("Software Update Available", 56, 676);
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("Version 18.4 improves battery life and", 56, 708);
  ctx.fillText("includes latest privacy patches.", 56, 730);

  ctx.fillStyle = "#2563EB";
  drawRoundedRect(ctx, 56, 744, 190, 36, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 15px sans-serif";
  ctx.fillText("Install Update Now", 82, 767);

  // Storage card
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 820, 476, 180, 20);
  ctx.fill();
  ctx.fillStyle = "#0F172A";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("Device Storage", 56, 862);
  ctx.fillStyle = "#64748B";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("94.5 GB used of 128 GB total", 56, 892);
  ctx.fillStyle = "#E2E8F0";
  drawRoundedRect(ctx, 56, 914, 428, 16, 8);
  ctx.fill();
  ctx.fillStyle = "#2563EB";
  drawRoundedRect(ctx, 56, 914, 315, 16, 8);
  ctx.fill();
  ctx.fillStyle = "#475569";
  ctx.font = "500 15px sans-serif";
  ctx.fillText("Clear temporary cache to free 3.2 GB", 56, 966);

  return canvas.toDataURL("image/png");
}

function createRussianOrderSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, 540, 1080);

  // Top bar
  ctx.fillStyle = "#0F172A";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("14:20", 32, 42);
  ctx.fillText("LTE  92%", 425, 42);

  ctx.font = "700 30px sans-serif";
  ctx.fillText("Оформление заказа", 32, 105);

  // Delivery status card
  ctx.fillStyle = "#F8FAFC";
  drawRoundedRect(ctx, 32, 136, 476, 148, 18);
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("Курьерская доставка", 56, 178);
  ctx.fillStyle = "#475569";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("ул. Амира Темура, дом 45, кв. 12", 56, 210);
  ctx.fillStyle = "#059669";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("Привезем завтра с 10:00 до 14:00", 56, 246);

  // Product card
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 310, 476, 190, 18);
  ctx.fill();
  ctx.strokeStyle = "#E2E8F0";
  ctx.stroke();

  ctx.fillStyle = "#E2E8F0";
  drawRoundedRect(ctx, 52, 336, 110, 130, 14);
  ctx.fill();
  ctx.fillStyle = "#475569";
  ctx.font = "600 14px sans-serif";
  ctx.fillText("ФОТО", 85, 405);

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 19px sans-serif";
  ctx.fillText("Беспроводные наушники", 182, 366);
  ctx.fillStyle = "#64748B";
  ctx.font = "400 15px sans-serif";
  ctx.fillText("Цвет: Черный титан · Гарантия 1 год", 182, 396);
  ctx.fillText("Количество: 1 шт.", 182, 424);
  ctx.fillStyle = "#0F172A";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("1 250 000 сум", 182, 464);

  // Summary block
  ctx.fillStyle = "#F8FAFC";
  drawRoundedRect(ctx, 32, 528, 476, 220, 18);
  ctx.fill();

  const rows = [
    ["Товары (1)", "1 250 000 сум"],
    ["Доставка курьером", "Бесплатно"],
    ["Скидка по промокоду", "- 100 000 сум"],
    ["Итого к оплате", "1 150 000 сум"],
  ];
  rows.forEach(([label, val], idx) => {
    const y = 574 + idx * 44;
    ctx.fillStyle = idx === 3 ? "#0F172A" : "#475569";
    ctx.font = idx === 3 ? "700 20px sans-serif" : "400 17px sans-serif";
    ctx.fillText(label, 56, y);
    ctx.fillText(val, 330, y);
  });

  // Payment notice
  ctx.fillStyle = "#64748B";
  ctx.font = "400 15px sans-serif";
  ctx.fillText("Нажимая кнопку ниже, вы соглашаетесь с", 56, 800);
  ctx.fillText("правилами возврата и условиями сервиса.", 56, 824);

  // Primary CTA
  ctx.fillStyle = "#2563EB";
  drawRoundedRect(ctx, 32, 920, 476, 64, 16);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 20px sans-serif";
  ctx.fillText("Оплатить заказ картой", 148, 959);

  return canvas.toDataURL("image/png");
}

function createJapaneseTravelSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#0F172A";
  ctx.fillRect(0, 0, 540, 1080);

  // Status bar
  ctx.fillStyle = "#E2E8F0";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("18:05", 32, 42);
  ctx.fillText("Wi-Fi  74%", 410, 42);

  // Title
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 30px sans-serif";
  ctx.fillText("乗換案内 · 東京駅", 32, 106);

  // Route card
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, 32, 140, 476, 260, 20);
  ctx.fill();

  ctx.fillStyle = "#38BDF8";
  ctx.font = "700 16px sans-serif";
  ctx.fillText("おすすめルート · 最短", 56, 182);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 28px sans-serif";
  ctx.fillText("18:12 → 18:39 (27分)", 56, 226);

  ctx.fillStyle = "#CBD5E1";
  ctx.font = "400 18px sans-serif";
  ctx.fillText("JR山手線 · 新宿・渋谷方面", 56, 268);
  ctx.fillText("乗換 0回 · 運賃 210円", 56, 300);

  ctx.fillStyle = "#2563EB";
  drawRoundedRect(ctx, 56, 330, 210, 44, 12);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "600 16px sans-serif";
  ctx.fillText("ルートを開始する", 88, 358);

  // Cafe menu section
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, 32, 430, 476, 390, 20);
  ctx.fill();

  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("駅ナカカフェ メニュー", 56, 476);

  const menu = [
    ["抹茶ラテ (ホット)", "520円"],
    ["黒糖タピオカミルク", "640円"],
    ["焼き立てクロワッサン", "380円"],
    ["本日のモーニングセット", "790円"],
  ];
  menu.forEach(([name, price], i) => {
    const y = 532 + i * 68;
    if (i > 0) {
      ctx.fillStyle = "#334155";
      ctx.fillRect(56, y - 34, 428, 1);
    }
    ctx.fillStyle = "#F8FAFC";
    ctx.font = "500 18px sans-serif";
    ctx.fillText(name, 56, y);
    ctx.fillStyle = "#94A3B8";
    ctx.font = "600 18px sans-serif";
    ctx.fillText(price, 405, y);
  });

  // Footer warning
  ctx.fillStyle = "#1E293B";
  drawRoundedRect(ctx, 32, 850, 476, 130, 20);
  ctx.fill();
  ctx.fillStyle = "#FBBF24";
  ctx.font = "700 17px sans-serif";
  ctx.fillText("お知らせ", 56, 892);
  ctx.fillStyle = "#CBD5E1";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("現在、中央線は強風のため5分ほど", 56, 926);
  ctx.fillText("遅れて運転しています。", 56, 952);

  return canvas.toDataURL("image/png");
}

function createChineseShopSample(): string {
  const canvas = document.createElement("canvas");
  canvas.width = 540;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  ctx.fillStyle = "#F8FAFC";
  ctx.fillRect(0, 0, 540, 1080);

  // Status bar
  ctx.fillStyle = "#0F172A";
  ctx.font = "600 18px sans-serif";
  ctx.fillText("16:45", 32, 42);
  ctx.fillText("5G  88%", 425, 42);

  // Product photo banner
  ctx.fillStyle = "#E2E8F0";
  drawRoundedRect(ctx, 32, 72, 476, 310, 22);
  ctx.fill();
  ctx.fillStyle = "#F97316";
  drawRoundedRect(ctx, 56, 98, 128, 36, 10);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 16px sans-serif";
  ctx.fillText("工厂直供", 82, 122);

  ctx.fillStyle = "#334155";
  ctx.font = "700 26px sans-serif";
  ctx.fillText("智能无线蓝牙降噪耳机", 118, 232);
  ctx.fillStyle = "#64748B";
  ctx.font = "500 18px sans-serif";
  ctx.fillText("超长续航 48小时 · 现货秒发", 136, 268);

  // Price card
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 404, 476, 210, 20);
  ctx.fill();

  ctx.fillStyle = "#EA580C";
  ctx.font = "700 34px sans-serif";
  ctx.fillText("¥49.00", 56, 460);
  ctx.fillStyle = "#64748B";
  ctx.font = "500 17px sans-serif";
  ctx.fillText("2件起批 · 包邮发全国", 188, 456);

  ctx.fillStyle = "#0F172A";
  ctx.font = "700 21px sans-serif";
  ctx.fillText("新款Pro主动降噪运动耳机", 56, 514);
  ctx.fillStyle = "#475569";
  ctx.font = "400 16px sans-serif";
  ctx.fillText("支持一件代发 · 七天无理由退换", 56, 552);
  ctx.fillText("月销 1.2万+ · 好评率 99%", 56, 584);

  // Specs card
  ctx.fillStyle = "#FFFFFF";
  drawRoundedRect(ctx, 32, 636, 476, 224, 20);
  ctx.fill();
  const rows = [
    ["发货地", "浙江义乌 · 24小时发货"],
    ["颜色规格", "曜石黑 / 珍珠白 (可选)"],
    ["售后保障", "官方质保1年 · 破损包赔"],
  ];
  rows.forEach(([k, v], idx) => {
    const y = 688 + idx * 66;
    if (idx > 0) {
      ctx.fillStyle = "#F1F5F9";
      ctx.fillRect(56, y - 36, 428, 1);
    }
    ctx.fillStyle = "#64748B";
    ctx.font = "500 17px sans-serif";
    ctx.fillText(k, 56, y);
    ctx.fillStyle = "#0F172A";
    ctx.font = "600 17px sans-serif";
    ctx.fillText(v, 178, y);
  });

  // Bottom action buttons
  ctx.fillStyle = "#F97316";
  drawRoundedRect(ctx, 32, 916, 224, 66, 16);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 19px sans-serif";
  ctx.fillText("加入进货单", 92, 956);

  ctx.fillStyle = "#2563EB";
  drawRoundedRect(ctx, 280, 916, 228, 66, 16);
  ctx.fill();
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "700 19px sans-serif";
  ctx.fillText("立即订购", 350, 956);

  return canvas.toDataURL("image/png");
}

export const SAMPLE_SCREENS: SampleScreenPreset[] = [
  {
    id: "zh-1688",
    label: "1688 / Taobao (Xitoycha)",
    langHint: "Xitoycha do'kon",
    sourceCode: "zh",
    detectedLanguage: "Xitoycha",
    summary: "1688 ulgurji savdo sahifasi: simsiz quloqchin narxi, yetkazib berish va buyurtma tugmalari.",
    generate: createChineseShopSample,
    previewBlocks: [
      { id: "zh-1", originalText: "工厂直供", translatedText: "To'g'ridan-to'g'ri zavoddan", box_2d: [90, 98, 128, 344], category: "status", bgTone: "accent" },
      { id: "zh-2", originalText: "智能无线蓝牙降噪耳机", translatedText: "Aqlli simsiz shovqinni pasaytiruvchi quloqchin", box_2d: [188, 180, 232, 820], category: "heading", bgTone: "light" },
      { id: "zh-3", originalText: "超长续航 48小时 · 现货秒发", translatedText: "48 soat zaryad · Tezkor jo'natish", box_2d: [232, 210, 266, 790], category: "label", bgTone: "light" },
      { id: "zh-4", originalText: "2件起批 · 包邮发全国", translatedText: "Minimal 2 dona · Bepul yetkazish", box_2d: [400, 340, 434, 860], category: "label", bgTone: "light" },
      { id: "zh-5", originalText: "新款Pro主动降噪运动耳机", translatedText: "Yangi Pro sport simsiz quloqchin", box_2d: [454, 96, 492, 870], category: "heading", bgTone: "light" },
      { id: "zh-6", originalText: "支持一件代发 · 七天无理由退换", translatedText: "1 donadan dropshipping · 7 kun qaytarish", box_2d: [494, 96, 526, 870], category: "body", bgTone: "light" },
      { id: "zh-7", originalText: "月销 1.2万+ · 好评率 99%", translatedText: "Oylik savdo 12 ming+ · 99% ijobiy", box_2d: [528, 96, 558, 790], category: "status", bgTone: "light" },
      { id: "zh-8", originalText: "浙江义乌 · 24小时发货", translatedText: "Yiwu ombori · 24 soatda chiqadi", box_2d: [616, 320, 652, 880], category: "body", bgTone: "light" },
      { id: "zh-9", originalText: "曜石黑 / 珍珠白 (可选)", translatedText: "Qora / Marvarid oq (tanlanadi)", box_2d: [678, 320, 714, 880], category: "body", bgTone: "light" },
      { id: "zh-10", originalText: "官方质保1年 · 破损包赔", translatedText: "1 yil kafolat · Zarar qoplanadi", box_2d: [740, 320, 776, 880], category: "body", bgTone: "light" },
      { id: "zh-11", originalText: "加入进货单", translatedText: "Savatga qo'shish", box_2d: [848, 59, 910, 474], category: "button", bgTone: "accent" },
      { id: "zh-12", originalText: "立即订购", translatedText: "Hozir buyurtma berish", box_2d: [848, 518, 910, 940], category: "button", bgTone: "accent" },
    ],
  },
  {
    id: "en-settings",
    label: "Sozlamalar (Inglizcha)",
    langHint: "Inglizcha UI",
    sourceCode: "en",
    detectedLanguage: "Inglizcha",
    summary: "Telefon tizim sozlamalari: Wi-Fi, Bluetooth, xotira va tizim yangilanishi ekrani.",
    generate: createEnglishSettingsSample,
    previewBlocks: [
      { id: "en-1", originalText: "System Settings", translatedText: "Tizim sozlamalari", box_2d: [72, 56, 114, 610], category: "heading", bgTone: "light" },
      { id: "en-2", originalText: "Search device preferences...", translatedText: "Qurilma sozlamalaridan qidirish...", box_2d: [130, 88, 170, 760], category: "label", bgTone: "light" },
      { id: "en-3", originalText: "Cloud Backup & Security Active", translatedText: "Bulutli nusxa va xavfsizlik faol", box_2d: [248, 226, 278, 860], category: "body", bgTone: "light" },
      { id: "en-4", originalText: "Wi-Fi & Internet", translatedText: "Wi-Fi va Internet", box_2d: [332, 92, 362, 520], category: "heading", bgTone: "light" },
      { id: "en-5", originalText: "Bluetooth Devices", translatedText: "Bluetooth qurilmalar", box_2d: [392, 92, 422, 540], category: "heading", bgTone: "light" },
      { id: "en-6", originalText: "Mobile Data Usage", translatedText: "Mobil trafik sarfi", box_2d: [452, 92, 482, 540], category: "heading", bgTone: "light" },
      { id: "en-7", originalText: "Battery Optimization", translatedText: "Batareyani tejash", box_2d: [510, 92, 542, 540], category: "heading", bgTone: "light" },
      { id: "en-8", originalText: "Software Update Available", translatedText: "Tizim yangilanishi mavjud", box_2d: [604, 96, 638, 760], category: "heading", bgTone: "dark" },
      { id: "en-9", originalText: "Install Update Now", translatedText: "Hozir o'rnatish", box_2d: [688, 104, 724, 456], category: "button", bgTone: "accent" },
      { id: "en-10", originalText: "Device Storage", translatedText: "Qurilma xotirasi", box_2d: [774, 96, 808, 490], category: "heading", bgTone: "light" },
      { id: "en-11", originalText: "94.5 GB used of 128 GB total", translatedText: "128 GB dan 94.5 GB band", box_2d: [810, 96, 838, 660], category: "body", bgTone: "light" },
      { id: "en-12", originalText: "Clear temporary cache to free 3.2 GB", translatedText: "3.2 GB bo'shatish uchun keshni tozalang", box_2d: [876, 96, 908, 790], category: "label", bgTone: "light" },
    ],
  },
  {
    id: "ru-order",
    label: "Buyurtma (Ruscha)",
    langHint: "Ruscha ilova",
    sourceCode: "ru",
    detectedLanguage: "Ruscha",
    summary: "Onlayn buyurtmani rasmiylashtirish: kuryer yetkazib berish manzili, narx va karta orqali to'lov.",
    generate: createRussianOrderSample,
    previewBlocks: [
      { id: "ru-1", originalText: "Оформление заказа", translatedText: "Buyurtmani rasmiylashtirish", box_2d: [68, 56, 110, 740], category: "heading", bgTone: "light" },
      { id: "ru-2", originalText: "Курьерская доставка", translatedText: "Kuryer orqali yetkazish", box_2d: [144, 96, 178, 620], category: "heading", bgTone: "light" },
      { id: "ru-3", originalText: "Привезем завтра с 10:00 до 14:00", translatedText: "Ertaga 10:00–14:00 oralig'ida", box_2d: [212, 96, 242, 760], category: "status", bgTone: "light" },
      { id: "ru-4", originalText: "Беспроводные наушники", translatedText: "Simsiz quloqchinlar", box_2d: [318, 330, 352, 870], category: "heading", bgTone: "light" },
      { id: "ru-5", originalText: "Цвет: Черный титан · Гарантия 1 год", translatedText: "Rangi: Qora titan · 1 yil kafolat", box_2d: [352, 330, 380, 880], category: "body", bgTone: "light" },
      { id: "ru-6", originalText: "1 250 000 сум", translatedText: "1 250 000 so'm", box_2d: [410, 330, 444, 710], category: "heading", bgTone: "light" },
      { id: "ru-7", originalText: "Доставка курьером", translatedText: "Kuryer yetkazib berishi", box_2d: [554, 96, 586, 520], category: "body", bgTone: "light" },
      { id: "ru-8", originalText: "Бесплатно", translatedText: "Bepul", box_2d: [554, 600, 586, 860], category: "status", bgTone: "light" },
      { id: "ru-9", originalText: "Итого к оплате", translatedText: "Jami to'lov", box_2d: [634, 96, 668, 490], category: "heading", bgTone: "light" },
      { id: "ru-10", originalText: "Оплатить заказ картой", translatedText: "Karta orqali to'lash", box_2d: [852, 62, 912, 938], category: "button", bgTone: "accent" },
    ],
  },
  {
    id: "ja-travel",
    label: "Transport va menyu (Yaponcha)",
    langHint: "Yaponcha ekran",
    sourceCode: "ja",
    detectedLanguage: "Yaponcha",
    summary: "Tokio bekati marshrutlari va bekat kafesidagi taomnomani o'zbekcha ko'rsatadi.",
    generate: createJapaneseTravelSample,
    previewBlocks: [
      { id: "ja-1", originalText: "乗換案内 · 東京駅", translatedText: "Yo'nalishlar · Tokio bekati", box_2d: [68, 56, 112, 680], category: "heading", bgTone: "dark" },
      { id: "ja-2", originalText: "おすすめルート · 最短", translatedText: "Tavsiya etilgan eng tez yo'l", box_2d: [148, 96, 180, 620], category: "status", bgTone: "dark" },
      { id: "ja-3", originalText: "JR山手線 · 新宿・渋谷方面", translatedText: "JR Yamanote liniyasi · Shinjuku tomon", box_2d: [228, 96, 260, 790], category: "body", bgTone: "dark" },
      { id: "ja-4", originalText: "乗換 0回 · 運賃 210円", translatedText: "Almashinuv 0 · Yo'lkira 210 iyena", box_2d: [262, 96, 294, 680], category: "label", bgTone: "dark" },
      { id: "ja-5", originalText: "ルートを開始する", translatedText: "Yo'nalishni boshlash", box_2d: [306, 104, 348, 494], category: "button", bgTone: "accent" },
      { id: "ja-6", originalText: "駅ナカカフェ メニュー", translatedText: "Bekat kafesi menyusi", box_2d: [418, 96, 452, 660], category: "heading", bgTone: "dark" },
      { id: "ja-7", originalText: "抹茶ラテ (ホット)", translatedText: "Issiq matcha latte", box_2d: [472, 96, 506, 560], category: "body", bgTone: "dark" },
      { id: "ja-8", originalText: "黒糖タピオカミルク", translatedText: "Sutli tapioka choyi", box_2d: [534, 96, 568, 580], category: "body", bgTone: "dark" },
      { id: "ja-9", originalText: "焼き立てクロワッサン", translatedText: "Yangi pishgan kruassan", box_2d: [598, 96, 632, 600], category: "body", bgTone: "dark" },
      { id: "ja-10", originalText: "本日のモーニングセット", translatedText: "Bugungi nonushta to'plami", box_2d: [662, 96, 696, 610], category: "body", bgTone: "dark" },
      { id: "ja-11", originalText: "お知らせ", translatedText: "Muhim bildirishnoma", box_2d: [806, 96, 840, 420], category: "status", bgTone: "dark" },
    ],
  },
];

export async function prepareImageForUpload(
  fileOrDataUrl: File | string,
  maxDimension = 1280
): Promise<{ dataUrl: string; mimeType: string; width: number; height: number }> {
  const srcUrl =
    typeof fileOrDataUrl === "string"
      ? fileOrDataUrl
      : await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."));
          reader.readAsDataURL(fileOrDataUrl);
        });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Tasvir formati noto'g'ri."));
    image.src = srcUrl;
  });

  let { width, height } = img;
  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataUrl: srcUrl, mimeType: "image/png", width: img.width, height: img.height };
  }
  ctx.drawImage(img, 0, 0, width, height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.84);
  return { dataUrl, mimeType: "image/jpeg", width, height };
}

export async function cropImageRegion(
  srcDataUrl: string,
  region: CropRegion
): Promise<{ dataUrl: string; mimeType: string }> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Tasvirni kesib bo'lmadi."));
    image.src = srcDataUrl;
  });

  const sx = Math.max(0, Math.round(region.xmin * img.width));
  const sy = Math.max(0, Math.round(region.ymin * img.height));
  const sw = Math.max(20, Math.round((region.xmax - region.xmin) * img.width));
  const sh = Math.max(20, Math.round((region.ymax - region.ymin) * img.height));

  const canvas = document.createElement("canvas");
  canvas.width = sw;
  canvas.height = sh;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return { dataUrl: srcDataUrl, mimeType: "image/jpeg" };
  }
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return {
    dataUrl: canvas.toDataURL("image/jpeg", 0.92),
    mimeType: "image/jpeg",
  };
}

export async function exportTranslatedImage(
  srcDataUrl: string,
  blocks: TextBlock[],
  filename = "ekran-tarjima.png"
): Promise<void> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Rasmni eksport qilib bo'lmadi."));
    image.src = srcDataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.drawImage(img, 0, 0);

  for (const block of blocks) {
    const [ymin, xmin, ymax, xmax] = block.box_2d;
    const x = (xmin / 1000) * canvas.width;
    const y = (ymin / 1000) * canvas.height;
    const w = Math.max(24, ((xmax - xmin) / 1000) * canvas.width);
    const h = Math.max(18, ((ymax - ymin) / 1000) * canvas.height);

    let bg = "#FFFFFF";
    let fg = "#0F172A";
    let border = "rgba(148, 163, 184, 0.7)";
    if (block.bgTone === "dark") {
      bg = "#0F172A";
      fg = "#F8FAFC";
      border = "rgba(51, 65, 85, 0.85)";
    } else if (block.bgTone === "accent") {
      bg = "#2563EB";
      fg = "#FFFFFF";
      border = "#1D4ED8";
    }

    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, Math.min(8, h * 0.2));
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.strokeStyle = border;
    ctx.lineWidth = Math.max(1, canvas.width * 0.0018);
    ctx.stroke();
    ctx.clip();

    const text = block.translatedText.trim();
    const padX = Math.max(4, w * 0.04);
    const availW = Math.max(12, w - padX * 2);
    const weight = block.category === "heading" || block.category === "button" ? "600" : "500";
    let fontSize = Math.max(10, Math.min(34, h * 0.56));
    let lines: string[] = [text];

    while (fontSize >= 9) {
      ctx.font = `${weight} ${fontSize}px sans-serif`;
      const words = text.split(/\s+/);
      const wrapped: string[] = [];
      let cur = "";
      for (const word of words) {
        const next = cur ? `${cur} ${word}` : word;
        if (ctx.measureText(next).width <= availW || !cur) {
          cur = next;
        } else {
          wrapped.push(cur);
          cur = word;
        }
      }
      if (cur) wrapped.push(cur);
      const lineH = fontSize * 1.18;
      if (wrapped.length * lineH <= h - 4 || fontSize <= 10) {
        lines = wrapped.slice(0, 3);
        break;
      }
      fontSize -= 1;
    }

    ctx.fillStyle = fg;
    ctx.font = `${weight} ${fontSize}px sans-serif`;
    ctx.textBaseline = "middle";
    const lineH = fontSize * 1.18;
    const totalH = lines.length * lineH;
    const startY = y + (h - totalH) / 2 + lineH / 2;
    ctx.textAlign = block.category === "button" ? "center" : "left";
    const drawX = block.category === "button" ? x + w / 2 : x + padX;
    lines.forEach((line, idx) => {
      ctx.fillText(line, drawX, startY + idx * lineH, availW);
    });
    ctx.restore();
  }

  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  link.remove();
}
