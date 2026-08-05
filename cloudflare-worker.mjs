const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET,POST,OPTIONS", "Access-Control-Allow-Headers": "Content-Type" };

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: JSON_HEADERS });
}

function decodeEntities(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function htmlToText(html) {
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "";
  const description = html.match(/<meta[^>]+(?:name|property)=["'](?:description|og:description)["'][^>]+content=["']([^"']*)["'][^>]*>/i)?.[1] || "";
  const text = decodeEntities(html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<svg[\s\S]*?<\/svg>/gi, " ")
    .replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ").trim();
  return {
    title: decodeEntities(title).replace(/\s+/g, " ").trim(),
    description: decodeEntities(description).replace(/\s+/g, " ").trim(),
    text: `${decodeEntities(title)} ${decodeEntities(description)} ${text}`.replace(/\s+/g, " ").trim().slice(0, 14000)
  };
}

function isBlockedHost(hostname) {
  const host = hostname.toLowerCase();
  return host === "localhost" || host === "::1" || host === "0.0.0.0" || host.startsWith("127.") || host.startsWith("10.") || host.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
}

async function fetchPublicPage(rawUrl) {
  const url = new URL(rawUrl);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("unsupported_url");
  if (isBlockedHost(url.hostname)) throw new Error("blocked_host");
  const response = await fetch(url, {
    redirect: "follow",
    headers: { "User-Agent": "AluWorkbench/0.2 (+personal content analysis)", Accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5" }
  });
  const type = response.headers.get("content-type") || "";
  if (!response.ok) throw new Error(`fetch_${response.status}`);
  if (!type.includes("text/html") && !type.includes("application/xhtml+xml")) throw new Error("not_html");
  return { ...htmlToText(await response.text()), finalUrl: response.url, fetched: true };
}

function splitSentences(text) {
  return String(text || "").split(/[。！？!?；;\n]+/).map(item => item.trim()).filter(Boolean);
}

function fallbackContentAnalysis({ text, url, title, source }) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (!clean) return {
    status: "needs_content",
    hook: "等待原文或正文内容",
    structure: "链接已接收，当前页面没有返回可分析正文",
    evidence: "请补充正文、字幕或图文文字；也可能需要登录后才能访问",
    remixAngle: "补充正文后，再生成适合你的二创切口",
    nextOptimization: "发布后记录完播、评论和收藏，再优化开头与节奏",
    keywords: []
  };
  const chunks = splitSentences(clean);
  const first = chunks[0]?.slice(0, 80) || clean.slice(0, 80);
  const words = [...new Set((clean.match(/[\u4e00-\u9fa5]{2,6}/g) || []).filter(word => !["然后", "这个", "可以", "就是", "因为"].includes(word)))].slice(0, 6);
  return {
    status: "heuristic",
    hook: first,
    structure: `识别到 ${chunks.length} 个信息段，建议按「开头吸引 · 中段展开 · 结尾行动」复盘`,
    evidence: `来源：${source || "链接"}；标题：${title || "未提供"}`,
    remixAngle: `围绕「${first.slice(0, 24)}」加入你的经历、对比或具体案例，形成二创版本`,
    nextOptimization: "下一次先测试更具体的开头，并在结尾增加一个可评论的问题",
    keywords: words
  };
}

function parseJsonText(value) {
  if (typeof value !== "string") return value;
  const cleaned = value.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try { return JSON.parse(cleaned); } catch { return null; }
}

async function callModel(env, { kind, text, url, title, source, imageData }) {
  const key = env.LLM_API_KEY || env.OPENAI_API_KEY || "";
  if (!key || (!text && !imageData)) return null;
  const base = (env.LLM_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = env.LLM_MODEL || env.OPENAI_MODEL || "gpt-4o-mini";
  const schema = kind === "content"
    ? "status, hook, structure, evidence, remixAngle, nextOptimization, keywords"
    : kind === "recipe"
      ? "status, title, ingredients (array), steps (array), tips, substitutions"
      : "status, title, destination, transport, parking, food, play, outfit, preparation";
  const prompt = `你是阿卢工作台的内容整理助手。请只返回 JSON，不要 Markdown。\n任务类型：${kind}\n来源：${source || "未知"}\n链接：${url || "无"}\n标题：${title || "未知"}\n正文：${String(text || "").slice(0, 12000)}\n请输出字段：${schema}。内容不确定时写“待核实”，不要编造具体事实。`;
  const message = [{ type: "text", text: prompt }];
  if (imageData) message.push({ type: "image_url", image_url: { url: imageData } });
  const response = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, temperature: 0.2, response_format: { type: "json_object" }, messages: [{ role: "system", content: "你擅长把中文内容整理成可执行、可复盘的结构化卡片。" }, { role: "user", content: message }] })
  });
  if (!response.ok) throw new Error(`llm_${response.status}`);
  const payload = await response.json();
  return parseJsonText(payload.choices?.[0]?.message?.content);
}

async function analyzeContent(body, env) {
  const url = String(body.url || "").trim();
  if (!url && !body.content) throw new Error("url_or_content_required");
  let fetched = null;
  let fetchError = "";
  if (!body.content && url) {
    try { fetched = await fetchPublicPage(url); } catch (error) { fetchError = error.message || "fetch_failed"; }
  }
  const text = String(body.content || fetched?.text || "").trim();
  const source = body.source || (url.includes("douyin") ? "抖音" : url.includes("xiaohongshu") ? "小红书" : "其他");
  let analysis = null;
  let engine = "heuristic";
  try { analysis = await callModel(env, { kind: "content", text, url, title: body.title, source, imageData: body.imageData }); if (analysis) engine = "model"; } catch (error) { fetchError = fetchError || error.message || "model_failed"; }
  analysis ||= fallbackContentAnalysis({ text, url, title: body.title, source });
  return { ok: true, kind: "content", engine, fetched: Boolean(fetched), fetchError, source, finalUrl: fetched?.finalUrl || url, sourceTitle: fetched?.title || body.title || "", analysis };
}

async function analyzeResource(body, env) {
  const kind = body.type === "trip" ? "trip" : "recipe";
  const url = String(body.url || "").trim();
  if (!url && !body.content) throw new Error("url_or_content_required");
  let fetched = null;
  let fetchError = "";
  if (!body.content && url) {
    try { fetched = await fetchPublicPage(url); } catch (error) { fetchError = error.message || "fetch_failed"; }
  }
  const text = String(body.content || fetched?.text || "").trim();
  let result = null;
  let engine = "heuristic";
  try { result = await callModel(env, { kind, text, url, title: body.title, source: body.source }); if (result) engine = "model"; } catch (error) { fetchError = fetchError || error.message || "model_failed"; }
  if (!result) result = kind === "recipe"
    ? { status: text ? "heuristic" : "needs_content", title: body.title || fetched?.title || "待整理菜谱", ingredients: [], steps: text ? ["已获取文字，接入模型后可继续拆分步骤"] : [], tips: text ? "请补充食材与步骤，或配置模型接口" : "链接未返回可分析正文", substitutions: [] }
    : { status: text ? "heuristic" : "needs_content", title: body.title || fetched?.title || "待整理攻略", destination: "待识别", transport: "待识别", parking: "待识别", food: "待识别", play: "待识别", outfit: "待识别", preparation: text ? "已获取文字，接入模型后可继续整理" : "链接未返回可分析正文" };
  return { ok: true, kind, engine, fetched: Boolean(fetched), fetchError, finalUrl: fetched?.finalUrl || url, result };
}

async function handleApi(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: JSON_HEADERS });
  if (request.method === "GET" && url.pathname === "/api/health") return json({ ok: true, service: "alu-workbench", modelConfigured: Boolean(env.LLM_API_KEY || env.OPENAI_API_KEY), model: env.LLM_MODEL || env.OPENAI_MODEL || "gpt-4o-mini" });
  try {
    const body = request.method === "POST" ? await request.json() : {};
    if (request.method === "POST" && url.pathname === "/api/analyze") return json(await analyzeContent(body, env));
    if (request.method === "POST" && url.pathname === "/api/analyze-resource") return json(await analyzeResource(body, env));
    return json({ ok: false, error: "not_found" }, 404);
  } catch (error) {
    const status = error.message === "url_or_content_required" ? 400 : 500;
    return json({ ok: false, error: error.message || "server_error" }, status);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url);
    return env.ASSETS.fetch(request);
  }
};
