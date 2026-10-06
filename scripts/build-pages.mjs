/* =====================================================================
   content.json → 정적 사이트 생성기 (2026 리뉴얼)

   src/pages/*.mjs 의 페이지 본문을 src/layout.mjs 의 공통 레이아웃에 끼워
   루트에 index.html, about.html, btl.html ... 로 써낸다. 프로젝트 목록,
   서비스 페이지의 featured projects, 프로젝트 상세(projects/<id>.html)는
   content.json 의 projects 로부터 빌드 타임에 채운다(JS 없이도 크롤러가
   내용을 볼 수 있도록).

   또한
     - 프로젝트 이미지의 목록/썸네일용 축소본을 projects_images/<id>/thumbs/ 에 만든다.
     - sitemap.xml 을 재생성한다.

   실행: npm run build-pages
   ===================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

import { layout, esc, SITE_ORIGIN } from "../src/layout.mjs";
import projectPage from "../src/project-detail.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PAGES_DIR = path.join(ROOT, "src", "pages");
const THUMB_WIDTH = 800;

/* ---------------- 유틸 ---------------- */
async function exists(p) {
  try { await fs.access(p); return true; } catch { return false; }
}
function toPosix(p) {
  return p.split(path.sep).join("/");
}
function imgUrl(x) {
  if (!x) return "";
  return typeof x === "string" ? x : x.src || x.image || "";
}

/* 본문 markdown 에서 이미지 경로와 일반 문단을 뽑는다. */
function bodyImages(md) {
  const out = [];
  const re = /!\[[^\]]*\]\(([^)\s]+)\)/g;
  let m;
  while ((m = re.exec(md || ""))) out.push(m[1]);
  return out;
}
function bodyParagraphs(md) {
  return String(md || "")
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b && !/^#{1,6}\s/.test(b) && !/^!\[/.test(b) && !/^[-*]\s/.test(b))
    .map((b) => b.replace(/\*\*([^*]+)\*\*/g, "$1").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1"));
}

/* 목록/썸네일용 축소본. 원본보다 새로우면 다시 만들지 않는다. */
async function ensureThumb(relPath) {
  const src = path.join(ROOT, relPath);
  if (!(await exists(src))) return null;
  const ext = path.extname(relPath).toLowerCase();
  if (![".jpg", ".jpeg", ".png", ".webp"].includes(ext)) return "/" + relPath;
  const dir = path.join(path.dirname(src), "thumbs");
  const dest = path.join(dir, path.basename(relPath, ext) + ".jpg");
  const [s, d] = await Promise.all([fs.stat(src), fs.stat(dest).catch(() => null)]);
  if (!d || d.mtimeMs < s.mtimeMs) {
    await fs.mkdir(dir, { recursive: true });
    await sharp(src)
      .rotate()
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .jpeg({ quality: 78, mozjpeg: true })
      .toFile(dest);
  }
  return "/" + toPosix(path.relative(ROOT, dest));
}

/* ---------------- 프로젝트 정규화 ---------------- */
async function prepareProjects(raw) {
  const list = [];
  for (const p of raw) {
    if (p.status !== "published") continue;
    const sources = [p.cover, ...(p.images || []).map(imgUrl), ...bodyImages(p.body)]
      .filter(Boolean)
      .map((s) => s.replace(/^\/+/, ""))
      .filter((s, i, arr) => arr.indexOf(s) === i);
    const gallery = [];
    for (const s of sources) {
      if (/^https?:/.test(s)) { gallery.push({ full: s, thumb: s }); continue; }
      const thumb = await ensureThumb(s);
      if (thumb) gallery.push({ full: "/" + s, thumb });
    }
    const start = String(p.date || "").split(" ~ ")[0];
    list.push({
      ...p,
      url: `/projects/${encodeURIComponent(p.id)}`,
      gallery,
      coverThumb: gallery[0] ? gallery[0].thumb : "",
      venue: p.venue || "",
      desc: p.desc || bodyParagraphs(p.body).slice(0, 2).join("\n\n"),
      year: start ? start.slice(0, 4) : "",
      sortKey: start,
    });
  }
  // 행사일(Date) 최신 순, 행사일이 없는 프로젝트는 맨 뒤. 같으면 ID 내림차순.
  list.sort((a, b) =>
    (!a.sortKey - !b.sortKey) || b.sortKey.localeCompare(a.sortKey) || (Number(b.id) - Number(a.id))
  );
  return list;
}

/* ---------------- 메인 ---------------- */
async function main() {
  const content = JSON.parse(await fs.readFile(path.join(ROOT, "content.json"), "utf8"));
  const projects = await prepareProjects(content.projects || []);

  const ctx = {
    projects,
    featured: (key, n) => projects.filter((p) => p.featuredCategory === key).slice(0, n),
    thumbImg: (p) =>
      p.coverThumb
        ? `<img src="${esc(p.coverThumb)}" alt="" loading="lazy" decoding="async">`
        : `<span class="ph">IMAGE</span>`,
  };

  // 1) 정적 페이지
  const pageFiles = (await fs.readdir(PAGES_DIR)).filter((f) => f.endsWith(".mjs")).sort();
  const pages = [];
  for (const f of pageFiles) {
    const mod = await import(pathToFileURL(path.join(PAGES_DIR, f)).href);
    pages.push(...[].concat(mod.default));
  }
  for (const page of pages) {
    const html = layout({ ...page, body: page.body(ctx) });
    await fs.writeFile(path.join(ROOT, page.file), html);
  }

  // 2) 프로젝트 상세. 더 이상 공개되지 않는 프로젝트의 페이지는 지운다.
  const projectsDir = path.join(ROOT, "projects");
  await fs.mkdir(projectsDir, { recursive: true });
  const keep = new Set();
  for (const p of projects) {
    const page = projectPage(p, ctx);
    await fs.writeFile(path.join(ROOT, page.file), layout({ ...page, body: page.body(ctx) }));
    keep.add(path.basename(page.file));
  }
  for (const f of await fs.readdir(projectsDir)) {
    if (f.endsWith(".html") && !keep.has(f)) await fs.unlink(path.join(projectsDir, f));
  }

  // 4) sitemap.xml
  const urls = [
    ...pages.filter((p) => !p.noindex).map((p) => `${SITE_ORIGIN}${p.path}`),
    ...projects.map((p) => `${SITE_ORIGIN}${p.url}`),
  ];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  await fs.writeFile(path.join(ROOT, "sitemap.xml"), xml);

  console.log(`완료: 페이지 ${pages.length}개, 프로젝트 ${projects.length}개 생성, sitemap.xml 갱신`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
