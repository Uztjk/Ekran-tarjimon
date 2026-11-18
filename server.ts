import dotenv from "dotenv";
import express from "express";
import type { Request, Response } from "express";
import path from "path";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = "gemini-4-hydrogen";

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY_MISSING");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

interface TranslateScreenBody {
  imageBase64?: string;
  mimeType?: string;
  sourceLang?: string;
  targetLang?: string;
  targetLangName?: string;
  sourceLangName?: string;
  isCroppedRegion?: boolean;
  nicheMode?: "general" | "ecommerce" | "finance" | "travel";
}

interface TranslateTextBody {
  text?: string;
  sourceLang?: string;
  targetLang?: string;
  targetLangName?: string;
  sourceLangName?: string;
  context?: string;
}

function parseErrorResponse(err: unknown): { status: number; message: string } {
  const raw = err instanceof Error ? err.message : String(err);
  if (raw === "API_KEY_MISSING" || raw.includes("API_KEY_INVALID")) {
    return {
      status: 400,
      message:
        "Gemini API kaliti sozlanmagan yoki noto'g'ri. Iltimos, Settings > Secrets bo'limida API kalitni tekshiring.",
    };
  }
  if (raw.includes("PERMISSION_DENIED") || raw.includes("403")) {
    return {
      status: 403,
      message:
        "API kalit ruxsati yetarli emas. Settings > Secrets bo'limidan kalitni tekshiring.",
    };
  }
  if (raw.includes("RESOURCE_EXHAUSTED") || raw.includes("429")) {
    return {
      status: 429,
      message:
        "So'rovlar limiti tugadi. Biroz kutib qayta urinib ko'ring yoki Settings > Secrets panelidan tarifni yangilang.",
    };
  }
  if (raw.includes("NOT_FOUND") || raw.includes("404")) {
    return {
      status: 404,
      message: "Tarjima modeli topilmadi. Iltimos, birozdan so'ng qayta urinib ko'ring.",
    };
  }
  return {
    status: 500,
    message: "Tasvirni tarjima qilishda xatolik yuz berdi. Qayta urinib ko'ring.",
  };
}

async function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const isTransient =
      msg.includes("503") ||
      msg.includes("500") ||
      msg.includes("UNAVAILABLE") ||
      msg.includes("fetch failed");
    if (retries > 0 && isTransient) {
      await new Promise((r) => setTimeout(r, 700));
      return withRetry(fn, retries - 1);
    }
    throw err;
  }
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "25mb" }));

  app.get("/api/health", (_req: Request, res: Response) => {
    res.json({ ok: true });
  });

  app.post("/api/translate-screen", async (req: Request, res: Response) => {
    try {
      const body = req.body as TranslateScreenBody;
      const {
        imageBase64,
        mimeType = "image/png",
        sourceLang = "auto",
        targetLang = "uz",
        sourceLangName = "Avto-aniqlash",
        targetLangName = "O'zbekcha",
        isCroppedRegion = false,
        nicheMode = "general",
      } = body;

      if (!imageBase64 || typeof imageBase64 !== "string") {
        res.status(400).json({ error: "Tasvir ma'lumotlari yuborilmadi." });
        return;
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
      const ai = getGeminiClient();

      const sourceInstruction =
        sourceLang === "auto"
          ? "Detect the primary language(s) on the phone screen automatically."
          : `The source language on the screen is primarily ${sourceLangName} (${sourceLang}).`;

      const regionHint = isCroppedRegion
        ? "This image is a cropped region from a phone screen. Extract and translate all visible text in this region accurately."
        : "This image is a phone screen (screenshot or photo of a phone display). Extract every readable UI text block (headings, buttons, menu items, messages, labels, prices, captions) with tight, accurate bounding boxes.";

      let nicheHint = "";
      if (nicheMode === "ecommerce") {
        nicheHint =
          "Specialized Mode: E-Commerce & Marketplaces (1688, Taobao, Pinduoduo, Trendyol, Wildberries, Amazon). Translate product specs, sizes, colors, shipping terms, MOQ, coupons, and checkout actions clearly for online shoppers and sellers.";
      } else if (nicheMode === "finance") {
        nicheHint =
          "Specialized Mode: Banking, Government & Official Apps. Translate financial terms, fees, transfer limits, account statuses, and legal notices with strict formal clarity.";
      } else if (nicheMode === "travel") {
        nicheHint =
          "Specialized Mode: Travel, Transit & Restaurant Menus. Translate transit routes, platform numbers, dish ingredients, prices, and booking buttons clearly.";
      }

      const systemInstruction = `You are a precision mobile screen OCR and UI translation engine.
${regionHint}
${sourceInstruction}
${nicheHint}
Translate every detected text block accurately and naturally into ${targetLangName} (${targetLang}).
Rules:
1. Keep UI translations concise so they fit cleanly inside the original button/label bounding box on the screen.
2. Preserve numbers, currencies, times, percentages, and proper brand names appropriately while translating surrounding labels.
3. For each block, return box_2d as [ymin, xmin, ymax, xmax] normalized integers from 0 to 1000 relative to the full image dimensions. Ensure ymin < ymax and xmin < xmax, and avoid merging unrelated distant columns into one huge box.
4. Classify each block's UI role as "heading", "button", "label", "body", or "status".
5. Detect each block's visual background tone on the screenshot: "light" (light/white background), "dark" (dark/black background), or "accent" (colored button/banner).
6. Write the brief 1-sentence "summary" of what this screen is showing in ${targetLangName}.
7. Write "detectedLanguage" in ${targetLangName} (e.g., "Inglizcha", "Ruscha", "Yaponcha").`;

      const startTime = Date.now();

      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: cleanBase64,
                },
              },
              {
                text: `Extract all visible text blocks with 0-1000 [ymin, xmin, ymax, xmax] coordinates and translate them into ${targetLangName}.`,
              },
            ],
          },
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                detectedLanguage: {
                  type: Type.STRING,
                  description: "Detected primary language name in target language.",
                },
                summary: {
                  type: Type.STRING,
                  description: "Concise 1-sentence summary of the screen content in target language.",
                },
                blocks: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      originalText: { type: Type.STRING },
                      translatedText: { type: Type.STRING },
                      box_2d: {
                        type: Type.ARRAY,
                        items: { type: Type.INTEGER },
                        description: "[ymin, xmin, ymax, xmax] normalized 0 to 1000",
                      },
                      category: {
                        type: Type.STRING,
                        description: "One of: heading, button, label, body, status",
                      },
                      bgTone: {
                        type: Type.STRING,
                        description: "One of: light, dark, accent",
                      },
                    },
                    required: [
                      "id",
                      "originalText",
                      "translatedText",
                      "box_2d",
                      "category",
                      "bgTone",
                    ],
                  },
                },
              },
              required: ["detectedLanguage", "summary", "blocks"],
            },
          },
        })
      );

      const rawText = (response.text ?? "{}").trim();
      const parsed = JSON.parse(rawText) as {
        detectedLanguage?: string;
        summary?: string;
        blocks?: Array<{
          id?: string;
          originalText?: string;
          translatedText?: string;
          box_2d?: number[];
          category?: string;
          bgTone?: string;
        }>;
      };

      const sanitizedBlocks = (parsed.blocks ?? [])
        .filter((b) => b.originalText && b.translatedText && Array.isArray(b.box_2d) && b.box_2d.length === 4)
        .map((b, idx) => {
          const [rawYmin, rawXmin, rawYmax, rawXmax] = b.box_2d!;
          const ymin = Math.max(0, Math.min(990, Math.round(rawYmin)));
          const xmin = Math.max(0, Math.min(990, Math.round(rawXmin)));
          const ymax = Math.max(ymin + 10, Math.min(1000, Math.round(rawYmax)));
          const xmax = Math.max(xmin + 10, Math.min(1000, Math.round(rawXmax)));
          const validCategories = ["heading", "button", "label", "body", "status"];
          const validTones = ["light", "dark", "accent"];
          return {
            id: b.id || `block-${idx + 1}`,
            originalText: String(b.originalText).trim(),
            translatedText: String(b.translatedText).trim(),
            box_2d: [ymin, xmin, ymax, xmax] as [number, number, number, number],
            category: validCategories.includes(String(b.category))
              ? (b.category as "heading" | "button" | "label" | "body" | "status")
              : "body",
            bgTone: validTones.includes(String(b.bgTone))
              ? (b.bgTone as "light" | "dark" | "accent")
              : "light",
          };
        });

      const durationMs = Date.now() - startTime;

      res.json({
        detectedLanguage: parsed.detectedLanguage || "Aniqlangan",
        summary: parsed.summary || "",
        blocks: sanitizedBlocks,
        durationMs,
      });
    } catch (err) {
      const { status, message } = parseErrorResponse(err);
      res.status(status).json({ error: message });
    }
  });

  app.post("/api/translate-text", async (req: Request, res: Response) => {
    try {
      const body = req.body as TranslateTextBody;
      const {
        text,
        sourceLang = "auto",
        targetLang = "uz",
        sourceLangName = "Avto-aniqlash",
        targetLangName = "O'zbekcha",
        context = "",
      } = body;

      if (!text || typeof text !== "string" || !text.trim()) {
        res.status(400).json({ error: "Tarjima uchun matn kiritilmadi." });
        return;
      }

      const ai = getGeminiClient();
      const response = await withRetry(() =>
        ai.models.generateContent({
          model: MODEL_NAME,
          contents: `Source language: ${sourceLang === "auto" ? "Auto-detect" : sourceLangName}.
Target language: ${targetLangName} (${targetLang}).
${context ? `UI Context: ${context}\n` : ""}Text to translate:
"""
${text.trim()}
"""`,
          config: {
            systemInstruction: `You are an expert mobile UI and natural language translator. Translate accurately into ${targetLangName} and provide 2 concise alternative phrasings suitable for phone screens. Return detectedLanguage in ${targetLangName}.`,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                translatedText: { type: Type.STRING },
                detectedLanguage: { type: Type.STRING },
                alternatives: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ["translatedText", "detectedLanguage", "alternatives"],
            },
          },
        })
      );

      const parsed = JSON.parse((response.text ?? "{}").trim());
      res.json({
        translatedText: parsed.translatedText || text,
        detectedLanguage: parsed.detectedLanguage || "Aniqlangan",
        alternatives: Array.isArray(parsed.alternatives) ? parsed.alternatives : [],
      });
    } catch (err) {
      const { status, message } = parseErrorResponse(err);
      res.status(status).json({ error: message });
    }
  });

  const STARS_PRICES: Record<
    "pro_monthly" | "pro_yearly" | "pack_100",
    { title: string; description: string; stars: number }
  > = {
    pro_monthly: {
      title: "EkranTarjimon Pro (1 oy)",
      description: "Cheksiz ekran tarjimasi va barcha maxsus rejimlar (1 oy)",
      stars: 150,
    },
    pro_yearly: {
      title: "EkranTarjimon Pro (1 yil)",
      description: "Yil davomida cheksiz ekran tarjimasi (33% chegirma)",
      stars: 1200,
    },
    pack_100: {
      title: "EkranTarjimon — 100 ta Kredit",
      description: "Muddati tugamaydigan 100 ta qo'shimcha ekran tarjimasi",
      stars: 75,
    },
  };

  const verifiedStarsPayments = new Map<
    string,
    {
      payloadId: string;
      chargeId: string;
      totalAmount: number;
      userId: string;
      planRequested: string;
      paidAt: number;
    }
  >();

  async function sendTelegramAdminMessage(text: string): Promise<boolean> {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID?.trim();
    if (!token || !chatId) return false;

    try {
      const resp = await fetch(
        `https://api.telegram.org/bot${token}/sendMessage`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            disable_web_page_preview: true,
          }),
        }
      );
      return resp.ok;
    } catch {
      return false;
    }
  }

  app.get("/api/telegram/capabilities", (_req: Request, res: Response) => {
    const botConfigured = Boolean(process.env.TELEGRAM_BOT_TOKEN?.trim());
    const adminNotifyConfigured = Boolean(
      botConfigured && process.env.TELEGRAM_ADMIN_CHAT_ID?.trim()
    );
    res.json({
      botConfigured,
      adminNotifyConfigured,
    });
  });

  app.post("/api/notify-payment", async (req: Request, res: Response) => {
    try {
      const body = req.body as {
        requestId?: string;
        userName?: string;
        planRequested?: string;
        paymentMethod?: string;
        amountUsd?: number;
        note?: string;
      };

      const planLabelMap: Record<string, string> = {
        pro_monthly: "Pro Oylik ($3)",
        pro_yearly: "Pro Yillik ($24)",
        pack_100: "100 ta Kredit ($1.50)",
      };
      const methodLabelMap: Record<string, string> = {
        spitamen_bank: "Spitamen Bank",
        dcity: "Dushanbe City (DCity)",
        alif_bank: "Alif Bank",
        tajikistan_cards: "Tojikiston kartalari (Korti Milli)",
        telegram_stars: "Telegram Stars",
        visa_mastercard: "Visa / Mastercard",
      };

      const appUrl = process.env.APP_URL?.trim() || "";
      const textLines = [
        "Yangi to'lov so'rovi (EkranTarjimon)",
        `Foydalanuvchi: ${String(body.userName || "Noma'lum").slice(0, 100)}`,
        `Tarif: ${planLabelMap[String(body.planRequested)] || String(body.planRequested || "-")}`,
        `Usul: ${methodLabelMap[String(body.paymentMethod)] || String(body.paymentMethod || "-")}`,
        `Summa: $${Number(body.amountUsd || 0).toFixed(2).replace(/\.00$/, "")}`,
        body.note ? `Izoh: ${String(body.note).slice(0, 240)}` : "",
        body.requestId ? `So'rov ID: ${String(body.requestId).slice(0, 64)}` : "",
        appUrl ? `Admin panel: ${appUrl}` : "",
      ].filter(Boolean);

      const notified = await sendTelegramAdminMessage(textLines.join("\n"));
      res.json({ notified });
    } catch {
      res.json({ notified: false });
    }
  });

  app.post(
    "/api/telegram/create-stars-invoice",
    async (req: Request, res: Response) => {
      const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
      if (!token) {
        res.status(503).json({
          error:
            "Telegram bot tokeni sozlanmagan. Hozircha @Admiin_0571 orqali to'lang.",
        });
        return;
      }

      try {
        const body = req.body as {
          userId?: string;
          planRequested?: "pro_monthly" | "pro_yearly" | "pack_100";
        };
        const planKey =
          body.planRequested && body.planRequested in STARS_PRICES
            ? body.planRequested
            : "pro_monthly";
        const plan = STARS_PRICES[planKey];
        const safeUserId = String(body.userId || "guest")
          .replace(/[^a-zA-Z0-9_-]/g, "")
          .slice(0, 48);
        const payloadId = `ekran_stars:${safeUserId}:${planKey}:${Date.now()}`;

        const tgRes = await fetch(
          `https://api.telegram.org/bot${token}/createInvoiceLink`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: plan.title,
              description: plan.description,
              payload: payloadId,
              provider_token: "",
              currency: "XTR",
              prices: [{ label: plan.title, amount: plan.stars }],
            }),
          }
        );

        const tgData = (await tgRes.json()) as {
          ok?: boolean;
          result?: string;
          description?: string;
        };

        if (!tgRes.ok || !tgData.ok || !tgData.result) {
          res.status(502).json({
            error:
              tgData.description ||
              "Telegram Stars havolasini yaratib bo'lmadi.",
          });
          return;
        }

        res.json({
          invoiceLink: tgData.result,
          starsAmount: plan.stars,
          payloadId,
        });
      } catch {
        res.status(500).json({
          error: "Telegram Stars xizmati bilan bog'lanishda xatolik.",
        });
      }
    }
  );

  app.get(
    "/api/telegram/verify-stars-payment/:payloadId",
    (req: Request, res: Response) => {
      const payloadId = String(req.params.payloadId || "");
      const found = verifiedStarsPayments.get(payloadId);
      if (!found) {
        res.json({ paid: false });
        return;
      }
      res.json({
        paid: true,
        chargeId: found.chargeId,
        totalAmount: found.totalAmount,
      });
    }
  );

  let lastWebhookError: string | null = null;

  async function callTelegramMethod(
    token: string,
    method: string,
    payload: Record<string, unknown> = {}
  ): Promise<{ ok?: boolean; description?: string; result?: unknown }> {
    const resp = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await resp.json()) as {
      ok?: boolean;
      description?: string;
      result?: unknown;
    };
  }

  async function sendTelegramSafe(
    token: string,
    payload: Record<string, unknown>,
    fallbackText?: string
  ) {
    const result = await callTelegramMethod(token, "sendMessage", payload);
    if (!result.ok) {
      lastWebhookError = result.description || "sendMessage failed";
      console.error("Telegram sendMessage failed:", lastWebhookError);
      if (fallbackText && payload.chat_id) {
        await callTelegramMethod(token, "sendMessage", {
          chat_id: payload.chat_id,
          text: fallbackText,
        });
      }
    }
    return result;
  }

  app.get("/api/telegram/webhook-status", async (_req: Request, res: Response) => {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!token) {
      res.json({ configured: false });
      return;
    }
    try {
      const [meRes, infoRes] = await Promise.all([
        callTelegramMethod(token, "getMe"),
        callTelegramMethod(token, "getWebhookInfo"),
      ]);
      const me = (meRes.result || {}) as { username?: string; first_name?: string };
      const info = (infoRes.result || {}) as {
        url?: string;
        pending_update_count?: number;
        last_error_message?: string;
        last_error_date?: number;
      };
      res.json({
        configured: true,
        botUsername: me.username || null,
        botName: me.first_name || null,
        webhookUrl: info.url || "",
        pendingUpdateCount: info.pending_update_count ?? 0,
        lastTelegramError: info.last_error_message || null,
        lastTelegramErrorDate: info.last_error_date || null,
        lastLocalError: lastWebhookError,
      });
    } catch {
      res.status(500).json({ configured: true, error: "Telegram API check failed" });
    }
  });

  app.post("/api/telegram/setup-webhook", async (req: Request, res: Response) => {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (!token) {
      res.status(400).json({
        error: "Avval Secrets bo'limiga TELEGRAM_BOT_TOKEN kiriting.",
      });
      return;
    }

    const body = req.body as { originUrl?: string };
    const baseUrl = (
      process.env.APP_URL?.trim() ||
      body.originUrl?.trim() ||
      ""
    ).replace(/\/$/, "");

    if (!baseUrl.startsWith("https://")) {
      res.status(400).json({
        error: "Webhook uchun HTTPS manzil topilmadi.",
      });
      return;
    }

    const webhookUrl = `${baseUrl}/api/telegram/webhook`;
    try {
      const tgData = await callTelegramMethod(token, "setWebhook", {
        url: webhookUrl,
        allowed_updates: ["pre_checkout_query", "message", "callback_query"],
      });
      if (!tgData.ok) {
        res.status(502).json({
          error: tgData.description || "Webhook ulashda xatolik yuz berdi.",
        });
        return;
      }

      // Configure clean Uzbek commands and Menu Button automatically
      await Promise.allSettled([
        callTelegramMethod(token, "setMyCommands", {
          commands: [
            { command: "start", description: "Ilovani ochish va boshlash" },
            { command: "tarif", description: "Pro tariflar va bepul bonuslar" },
            { command: "yordam", description: "Qo'llanma va admin bilan aloqa" },
          ],
        }),
        callTelegramMethod(token, "setChatMenuButton", {
          menu_button: {
            type: "web_app",
            text: "Tarjimonni ochish",
            web_app: { url: baseUrl },
          },
        }),
      ]);

      res.json({ ok: true, webhookUrl });
    } catch {
      res.status(500).json({ error: "Telegram API bilan bog'lanib bo'lmadi." });
    }
  });

  app.post("/api/telegram/webhook", async (req: Request, res: Response) => {
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    const webAppUrl = (
      process.env.APP_URL?.trim() || "https://ekran-tarjimon.onrender.com"
    ).replace(/\/$/, "");

    const update = req.body as {
      pre_checkout_query?: {
        id: string;
        from?: { id: number; username?: string };
        currency?: string;
        total_amount?: number;
        invoice_payload?: string;
      };
      callback_query?: {
        id: string;
        data?: string;
        from?: { id: number; first_name?: string; username?: string };
        message?: { chat?: { id: number } };
      };
      message?: {
        chat?: { id: number; type?: string };
        from?: { id: number; username?: string; first_name?: string };
        text?: string;
        photo?: unknown[];
        document?: { mime_type?: string };
        successful_payment?: {
          currency: string;
          total_amount: number;
          invoice_payload: string;
          telegram_payment_charge_id: string;
        };
      };
    };

    const escapeHtml = (s: string) =>
      s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    const botShareUrl = (
      process.env.TELEGRAM_BOT_URL?.trim() || "https://t.me/Ek_tarjimonbot"
    ).replace(/\/$/, "");
    const viralShareText =
      "🔥 1688, Taobao, Trendyol yoki telefoningizdagi istalgan chet tili rasmini 1 soniyada O'ZBEKCHAGA tarjima qiling! Bepul sinab ko'ring 👇";
    const viralShareUrl = `https://t.me/share/url?url=${encodeURIComponent(botShareUrl)}&text=${encodeURIComponent(viralShareText)}`;

    const sendWelcome = async (chatId: number, firstName?: string) => {
      if (!token) return;
      const safeName = firstName ? escapeHtml(firstName) : "";
      const greeting = safeName
        ? `<b>Assalomu alaykum, ${safeName}!</b>`
        : "<b>Assalomu alaykum!</b>";
      await sendTelegramSafe(
        token,
        {
          chat_id: chatId,
          parse_mode: "HTML",
          text: [
            greeting,
            "",
            "<b>EkranTarjimon</b> — telefon ekrani, skrinshot va rasmlardagi matnlarni bir zumda <b>o'zbek</b> va <b>105+</b> tillarga tarjima qiluvchi aqlli yordamchi.",
            "",
            "• <b>1688, Taobao, Trendyol, Wildberries</b> ilovalari uchun maxsus rejim",
            "• Matnni rasmning o'zida (ustma-ust) tarjima ko'rinishida chiqarish",
            "• Qisqa matn yuborsangiz, shu yerning o'zida ham tarjima qilib beraman!",
            "",
            "<i>Boshlash uchun pastdagi tugmani bosing:</i>",
          ].join("\n"),
          reply_markup: {
            inline_keyboard: [
              [{ text: "📱 EkranTarjimonni ochish", web_app: { url: webAppUrl } }],
              [{ text: "🚀 Guruh va do'stlarga ulashish", url: viralShareUrl }],
              [
                { text: "💎 Pro tariflar", callback_data: "show_plans" },
                { text: "❓ Qanday ishlaydi?", callback_data: "show_guide" },
              ],
              [{ text: "👨‍💻 Admin (@Admiin_0571)", url: "https://t.me/Admiin_0571" }],
            ],
          },
        },
        `Assalomu alaykum! EkranTarjimon ilovasini ochish uchun havola: ${webAppUrl}`
      );
    };

    const sendPlans = async (chatId: number) => {
      if (!token) return;
      await sendTelegramSafe(token, {
        chat_id: chatId,
        parse_mode: "HTML",
        text: [
          "💎 <b>EkranTarjimon Pro tariflari</b>",
          "",
          "• <b>Pro Oylik:</b> $3 / oy (yoki 150 ★)",
          "• <b>Pro Yillik:</b> $24 / yil (33% chegirma · 1200 ★)",
          "• <b>100 ta Kredit paketi:</b> $1.50 (75 ★)",
          "",
          "🎁 <b>Bepul imkoniyatlar:</b>",
          "• Ilova ichida <b>+2 (Reklama)</b> tugmasi orqali kunlik qo'shimcha tarjima",
          "• Do'st taklif qilib <b>+10 bonus</b> olish",
          "",
          "💳 <b>To'lov usullari:</b> Spitamen Bank, DCity, Alif Bank, Telegram Stars. Chekni @Admiin_0571 ga yuborishingiz mumkin.",
        ].join("\n"),
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱 Ilovada Pro olish", web_app: { url: webAppUrl } }],
            [{ text: "🚀 Guruhlarga ulashish", url: viralShareUrl }],
            [{ text: "💬 Chek yuborish (@Admiin_0571)", url: "https://t.me/Admiin_0571" }],
          ],
        },
      });
    };

    const sendGuide = async (chatId: number) => {
      if (!token) return;
      await sendTelegramSafe(token, {
        chat_id: chatId,
        parse_mode: "HTML",
        text: [
          "📖 <b>Qanday ishlatiladi?</b>",
          "",
          "1️⃣ Pastdagi <b>EkranTarjimonni ochish</b> tugmasini bosing.",
          "2️⃣ Telefoningizdan skrinshot yuklang yoki <b>Kamera</b> orqali rasmga oling.",
          "3️⃣ Bir necha soniyada rasm ichidagi barcha tugma va yozuvlar o'zbek tiliga o'giriladi!",
          "",
          "💡 <i>Maslahat: Xitoy/Turk do'konlari uchun ilova ichida «1688 / Taobao / Trendyol» uslubini tanlang.</i>",
        ].join("\n"),
        reply_markup: {
          inline_keyboard: [
            [{ text: "📱 Hoziroq sinab ko'rish", web_app: { url: webAppUrl } }],
            [{ text: "🚀 Do'stlarga ulashish", url: viralShareUrl }],
          ],
        },
      });
    };

    try {
      if (update.pre_checkout_query?.id && token) {
        await callTelegramMethod(token, "answerPreCheckoutQuery", {
          pre_checkout_query_id: update.pre_checkout_query.id,
          ok: true,
        });
      }

      if (update.callback_query?.id && token) {
        await callTelegramMethod(token, "answerCallbackQuery", {
          callback_query_id: update.callback_query.id,
        });
        const cbChatId = update.callback_query.message?.chat?.id;
        if (cbChatId) {
          if (update.callback_query.data === "show_plans") {
            await sendPlans(cbChatId);
          } else if (update.callback_query.data === "show_guide") {
            await sendGuide(cbChatId);
          }
        }
      }

      const sp = update.message?.successful_payment;
      if (sp) {
        const parts = String(sp.invoice_payload || "").split(":");
        const userId = parts[1] || "unknown";
        const planRequested = parts[2] || "pro_monthly";
        if (verifiedStarsPayments.size >= 500) {
          const oldestKey = verifiedStarsPayments.keys().next().value;
          if (oldestKey) verifiedStarsPayments.delete(oldestKey);
        }
        verifiedStarsPayments.set(sp.invoice_payload, {
          payloadId: sp.invoice_payload,
          chargeId: sp.telegram_payment_charge_id,
          totalAmount: sp.total_amount,
          userId,
          planRequested,
          paidAt: Date.now(),
        });

        const payer = update.message?.from?.username
          ? `@${update.message.from.username}`
          : update.message?.from?.first_name || "Telegram foydalanuvchi";
        await sendTelegramAdminMessage(
          [
            "Telegram Stars to'lovi tasdiqlandi!",
            `Foydalanuvchi: ${payer} (UID: ${userId})`,
            `Tarif: ${planRequested}`,
            `Miqdor: ${sp.total_amount} ${sp.currency}`,
            `Chek ID: ${sp.telegram_payment_charge_id}`,
          ].join("\n")
        );
      } else if (update.message?.chat?.id && token) {
        const chatId = update.message.chat.id;
        const firstName = update.message.from?.first_name;
        const rawText = update.message.text?.trim() || "";
        const isImageUpload =
          Array.isArray(update.message.photo) ||
          Boolean(update.message.document?.mime_type?.startsWith("image/"));

        if (rawText.startsWith("/start")) {
          await sendWelcome(chatId, firstName);
        } else if (rawText.startsWith("/tarif")) {
          await sendPlans(chatId);
        } else if (rawText.startsWith("/yordam") || rawText.startsWith("/help")) {
          await sendGuide(chatId);
        } else if (isImageUpload) {
          await callTelegramMethod(token, "sendMessage", {
            chat_id: chatId,
            parse_mode: "HTML",
            text: "🖼 Skrinshotdagi barcha yozuvlarni rasmning ustiga o'zbekcha qilib chiqarish uchun pastdagi tugma orqali <b>EkranTarjimon</b> ilovasini ochib rasmni yuklang:",
            reply_markup: {
              inline_keyboard: [
                [{ text: "📱 Skrinshotni tarjima qilish", web_app: { url: webAppUrl } }],
              ],
            },
          });
        } else if (rawText && !rawText.startsWith("/")) {
          try {
            const ai = getGeminiClient();
            const reply = await withRetry(() =>
              ai.models.generateContent({
                model: MODEL_NAME,
                contents: `Translate the following message naturally into Uzbek (or if it is already in Uzbek, translate it into clear English). Keep it concise and helpful:\n\n"""\n${rawText.slice(0, 600)}\n"""`,
                config: {
                  thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
                },
              })
            );
            const translated = (reply.text ?? "").trim();
            if (translated) {
              await callTelegramMethod(token, "sendMessage", {
                chat_id: chatId,
                text: `Tarjima:\n${translated}`,
                reply_markup: {
                  inline_keyboard: [
                    [{ text: "📱 Ekran / rasm tarjimasini ochish", web_app: { url: webAppUrl } }],
                  ],
                },
              });
            }
          } catch {
            await sendWelcome(chatId, firstName);
          }
        }
      }
    } catch {
      // Keep webhook responsive
    }

    res.json({ ok: true });
  });

  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), "dist");
    app.use(express.static(distDir));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EkranTarjimon server listening on http://0.0.0.0:${PORT}`);

    if (process.env.NODE_ENV === "production") {
      const prodToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
      const prodBaseUrl = (
        process.env.APP_URL?.trim() ||
        process.env.RENDER_EXTERNAL_URL?.trim() ||
        ""
      ).replace(/\/$/, "");
      if (prodToken && prodBaseUrl.startsWith("https://")) {
        setTimeout(() => {
          Promise.allSettled([
            callTelegramMethod(prodToken, "setWebhook", {
              url: `${prodBaseUrl}/api/telegram/webhook`,
              allowed_updates: [
                "pre_checkout_query",
                "message",
                "callback_query",
              ],
            }),
            callTelegramMethod(prodToken, "setMyCommands", {
              commands: [
                { command: "start", description: "Ilovani ochish va boshlash" },
                {
                  command: "tarif",
                  description: "Pro tariflar va bepul bonuslar",
                },
                {
                  command: "yordam",
                  description: "Qo'llanma va admin bilan aloqa",
                },
              ],
            }),
            callTelegramMethod(prodToken, "setChatMenuButton", {
              menu_button: {
                type: "web_app",
                text: "Tarjimonni ochish",
                web_app: { url: prodBaseUrl },
              },
            }),
          ]).catch(() => {});
        }, 2500);
      }
    }
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
