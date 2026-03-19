import { NextRequest, NextResponse } from "next/server";

// In-memory cache: Map<`${locale}:${text}`, translatedText>
const cache = new Map<string, string>();

// MyMemory language code mapping
const LANG_MAP: Record<string, string> = {
  zh: "zh-CN",
  pt: "pt-BR",
};

async function translateWithMyMemory(text: string, targetLocale: string): Promise<string> {
  const langCode = LANG_MAP[targetLocale] ?? targetLocale;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${langCode}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`MyMemory error ${res.status}`);
  const data = await res.json();
  if (data.responseStatus !== 200) throw new Error(data.responseDetails ?? "Translation failed");
  return data.responseData.translatedText as string;
}

async function translateWithDeepL(text: string, targetLocale: string, apiKey: string): Promise<string> {
  const DEEPL_LANG: Record<string, string> = {
    en: "EN-US", es: "ES", zh: "ZH", fr: "FR", de: "DE",
    pt: "PT-BR", ja: "JA", ar: "AR", ru: "RU", lt: "LT",
  };
  const target_lang = DEEPL_LANG[targetLocale] ?? targetLocale.toUpperCase();
  const res = await fetch("https://api-free.deepl.com/v2/translate", {
    method: "POST",
    headers: { "Authorization": `DeepL-Auth-Key ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ text: [text], source_lang: "EN", target_lang }),
  });
  if (!res.ok) throw new Error(`DeepL error ${res.status}`);
  const data = await res.json();
  return data.translations[0].text as string;
}

export async function POST(req: NextRequest) {
  const { text, targetLocale } = await req.json() as { text: string; targetLocale: string };

  if (!text || !targetLocale || targetLocale === "en") {
    return NextResponse.json({ translatedText: text });
  }

  const cacheKey = `${targetLocale}:${text}`;
  if (cache.has(cacheKey)) {
    return NextResponse.json({ translatedText: cache.get(cacheKey) });
  }

  try {
    let translatedText: string;
    const deeplKey = process.env.DEEPL_API_KEY;
    if (deeplKey) {
      translatedText = await translateWithDeepL(text, targetLocale, deeplKey);
    } else {
      translatedText = await translateWithMyMemory(text, targetLocale);
    }
    cache.set(cacheKey, translatedText);
    return NextResponse.json({ translatedText });
  } catch (err) {
    console.error("Translation error:", err);
    return NextResponse.json({ translatedText: text }); // fallback to original
  }
}
