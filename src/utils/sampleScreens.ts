import type { CropRegion } from "../types/translator";

export interface SampleScreenPreset {
  id: string;
  label: string;
  langHint: string;
  sourceCode: string;
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

export const SAMPLE_SCREENS: SampleScreenPreset[] = [
  {
    id: "en-settings",
    label: "Sozlamalar (Inglizcha)",
    langHint: "Inglizcha UI",
    sourceCode: "en",
    generate: createEnglishSettingsSample,
  },
  {
    id: "ru-order",
    label: "Buyurtma (Ruscha)",
    langHint: "Ruscha ilova",
    sourceCode: "ru",
    generate: createRussianOrderSample,
  },
  {
    id: "ja-travel",
    label: "Transport va menyu (Yaponcha)",
    langHint: "Yaponcha ekran",
    sourceCode: "ja",
    generate: createJapaneseTravelSample,
  },
];

export async function prepareImageForUpload(
  fileOrDataUrl: File | string,
  maxDimension = 1600
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
  const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
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
