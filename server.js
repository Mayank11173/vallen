const http = require("http");
const fs = require("fs");
const fsp = fs.promises;
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");
const DATA_DIR = path.join(ROOT_DIR, "data");
const QUIZ_FILE = path.join(DATA_DIR, "quiz.json");

function send(res, statusCode, headers, body) {
  res.writeHead(statusCode, headers);
  if (body && res.req?.method !== "HEAD") res.end(body);
  else res.end();
}

function sendJson(res, statusCode, data) {
  send(
    res,
    statusCode,
    {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    JSON.stringify(data, null, 2),
  );
}

function sendText(res, statusCode, text) {
  send(
    res,
    statusCode,
    {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
    text,
  );
}

function contentTypeForExt(ext) {
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".svg":
      return "image/svg+xml";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    case ".webm":
      return "video/webm";
    case ".mp3":
      return "audio/mpeg";
    case ".wav":
      return "audio/wav";
    case ".ogg":
      return "audio/ogg";
    case ".m4a":
      return "audio/mp4";
    case ".ico":
      return "image/x-icon";
    default:
      return "application/octet-stream";
  }
}

async function fileExists(filePath) {
  try {
    await fsp.access(filePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function safeJoin(root, requestedPathname) {
  const decoded = decodeURIComponent(requestedPathname);
  const stripped = decoded.replace(/^[/\\\\]+/, "");
  const normalized = path.normalize(stripped);
  const resolved = path.resolve(root, normalized);
  const rootResolved = path.resolve(root);
  if (resolved === rootResolved) return resolved;
  if (!resolved.startsWith(rootResolved + path.sep)) return null;
  return resolved;
}

async function readJsonBody(req, { maxBytes = 32_000 } = {}) {
  const contentType = String(req.headers["content-type"] || "");
  if (!contentType.includes("application/json")) {
    const err = new Error("Expected application/json");
    err.statusCode = 415;
    throw err;
  }

  let bytes = 0;
  let raw = "";
  for await (const chunk of req) {
    bytes += chunk.length;
    if (bytes > maxBytes) {
      const err = new Error("Body too large");
      err.statusCode = 413;
      throw err;
    }
    raw += chunk.toString("utf8");
  }

  try {
    return JSON.parse(raw || "{}");
  } catch {
    const err = new Error("Invalid JSON");
    err.statusCode = 400;
    throw err;
  }
}

function loadQuizDataSync() {
  try {
    const raw = fs.readFileSync(QUIZ_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid quiz");
    if (!Array.isArray(parsed.questions)) throw new Error("Invalid questions");
    return parsed;
  } catch (err) {
    // Server should still boot even if quiz is missing; quiz page will show error.
    return {
      title: "Love Quiz",
      correctReply: "aww mera gunna",
      incorrectReply: "huhhh",
      questions: [],
      _loadError: String(err && err.message ? err.message : err),
    };
  }
}

let quizData = loadQuizDataSync();

async function serveStatic(req, res, pathname) {
  const filePath = safeJoin(PUBLIC_DIR, pathname);
  if (!filePath) return sendText(res, 400, "Bad path");

  const exists = await fileExists(filePath);
  if (!exists) return false;

  const stat = await fsp.stat(filePath);
  if (stat.isDirectory()) return false;

  const ext = path.extname(filePath).toLowerCase();
  const type = contentTypeForExt(ext);

  res.writeHead(200, { "Content-Type": type, "Cache-Control": "public, max-age=300" });
  if (req.method === "HEAD") {
    res.end();
    return true;
  }

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => sendText(res, 500, "Read error"));
  stream.pipe(res);
  return true;
}

async function handleApi(req, res, pathname) {
  if (pathname === "/api/quiz" && req.method === "GET") {
    quizData = loadQuizDataSync();
    const payload = {
      title: quizData.title,
      questions: quizData.questions.map(({ id, question, options }) => ({
        id,
        question,
        options,
      })),
    };
    return sendJson(res, 200, payload);
  }

  if (pathname === "/api/quiz/answer" && req.method === "POST") {
    quizData = loadQuizDataSync();
    const { id, optionIndex } = await readJsonBody(req);
    const q = quizData.questions.find((qq) => qq.id === id);
    if (!q) return sendJson(res, 404, { error: "Question not found" });

    const selected = Number(optionIndex);
    const isCorrect = Number.isInteger(selected) && selected === q.answerIndex;
    return sendJson(res, 200, {
      correct: isCorrect,
      reply: isCorrect ? quizData.correctReply : quizData.incorrectReply,
    });
  }

  if (pathname === "/api/moments" && req.method === "GET") {
    const dir = path.join(PUBLIC_DIR, "assets", "moments");
    let files = [];
    try {
      files = await fsp.readdir(dir, { withFileTypes: true });
    } catch {
      files = [];
    }
    const allowed = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"]);
    const images = files
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => allowed.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b))
      .map((name) => ({
        name,
        url: `/assets/moments/${encodeURIComponent(name)}`,
      }));
    return sendJson(res, 200, { images });
  }

  return sendJson(res, 404, { error: "Not found" });
}

function routeToHtml(pathname) {
  if (pathname === "/") return "/index.html";
  if (pathname === "/quiz") return "/quiz.html";
  if (pathname === "/favorite") return "/favorite.html";
  if (pathname === "/moments") return "/moments.html";
  if (pathname === "/valentine") return "/valentine.html";
  return null;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  try {
    if (pathname.startsWith("/api/")) return await handleApi(req, res, pathname);

    const htmlRoute = routeToHtml(pathname);
    if (htmlRoute) {
      const ok = await serveStatic(req, res, htmlRoute);
      if (ok) return;
      return sendText(res, 404, "Page not found");
    }

    const ok = await serveStatic(req, res, pathname);
    if (ok) return;

    if (pathname === "/favicon.ico") return send(res, 204, {}, "");
    return sendText(res, 404, "Not found");
  } catch (err) {
    const statusCode = err && err.statusCode ? err.statusCode : 500;
    const message = err && err.message ? err.message : "Server error";
    return sendJson(res, statusCode, { error: message });
  }
});

server.listen(PORT, HOST, () => {
  const shownHost = HOST === "127.0.0.1" ? "localhost" : HOST;
  console.log(`Valentine Week site running on http://${shownHost}:${PORT}`);
});
