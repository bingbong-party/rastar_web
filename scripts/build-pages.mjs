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
     - GEO(AI 검색 최적화): 화면에는 보이지 않는 텍스트 자료를 함께 만든다.
         · projects/<id>.md  — 프로젝트별 Notion 본문 전체 (상세 페이지 <head> 에서 링크)
         · llms.txt          — 회사·서비스·페이지·프로젝트 요약 안내 (llmstxt.org 형식)
         · llms-full.txt     — llms.txt + 모든 프로젝트 본문
         · 갤러리 사진 alt   — 본문의 소제목을 사진 설명으로 사용

   실행: npm run build-pages
   ===================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import sharp from "sharp";

import { layout, esc, SITE_ORIGIN, DEFAULT_DESCRIPTION } from "../src/layout.mjs";
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
/* 본문 이미지 → 바로 위 소제목(## …) 또는 이미지 캡션. 갤러리 사진 alt 로 쓴다. */
function bodyImageLabels(md) {
  const labels = new Map();
  let heading = "";
  for (const line of String(md || "").replace(/\r\n/g, "\n").split("\n")) {
    const h = line.match(/^#{2,3}\s+(.+)/);
    if (h) { heading = h[1].replace(/\*\*/g, "").trim(); continue; }
    const img = line.match(/^!\[([^\]]*)\]\(([^)\s]+)\)/);
    if (img) labels.set(img[2].replace(/^\/+/, ""), img[1].trim() || heading);
  }
  return labels;
}
/* 본문 markdown → 텍스트 버전(이미지 줄 제거) */
function bodyText(md) {
  return String(md || "")
    .replace(/\r\n/g, "\n")
    .split("\n")
    .filter((l) => !/^!\[[^\]]*\]\([^)]*\)\s*$/.test(l.trim()))
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
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
    const labels = bodyImageLabels(p.body);
    const altFor = (s) => (labels.get(s) ? `${p.title} – ${labels.get(s)}` : p.title);
    const gallery = [];
    for (const s of sources) {
      if (/^https?:/.test(s)) { gallery.push({ full: s, thumb: s, alt: altFor(s) }); continue; }
      const thumb = await ensureThumb(s);
      if (thumb) gallery.push({ full: "/" + s, thumb, alt: altFor(s) });
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

/* ---------------- GEO 텍스트 자료 ---------------- */
const COMPANY = {
  name: "라별커뮤니케이션즈 (라별, Rastar Comms)",
  phone: "032-262-2164",
  email: "ws@rastarcomms.com",
  address: "인천광역시 서구 중봉대로 490, 893호 (청라더리브티아모)",
};
function projectMarkdown(p) {
  const rows = [
    ["행사 분류", p.category],
    ["서비스 분야", p.featuredCategory],
    ["클라이언트(주최)", p.client],
    ["일시", p.date],
    ["장소", [p.venue, p.location].filter(Boolean).join(" · ")],
    ["대행", "라별커뮤니케이션즈 (기획·운영)"],
    ["페이지", `${SITE_ORIGIN}${p.url}`],
  ].filter(([, v]) => v);
  return [
    `# ${p.title}`,
    rows.map(([k, v]) => `- ${k}: ${v}`).join("\n"),
    p.summary ? `## 요약\n\n${p.summary}` : "",
    p.desc ? `## 개요\n\n${p.desc}` : "",
    bodyText(p.body) ? `## 상세\n\n${bodyText(p.body)}` : "",
  ].filter(Boolean).join("\n\n") + "\n";
}
function llmsTxt(pages, projects) {
  const byPath = (path) => pages.find((p) => p.path === path);
  const link = (pg) => (pg ? `- [${pg.title.replace(/ \| 라별$/, "")}](${SITE_ORIGIN}${pg.path}): ${pg.description}` : "");
  return [
    "# 라별 (Rastar Comms)",
    `> ${DEFAULT_DESCRIPTION} 컨퍼런스·포럼·세미나, 대학 축제와 신입생 오리엔테이션, 기업 행사·워크숍·송년회, 기념식·학위수여식, 팝업스토어·브랜드 프로모션 등을 기획부터 현장 운영까지 대행합니다.`,
    `- 회사: ${COMPANY.name}\n- 전화: ${COMPANY.phone}\n- 이메일: ${COMPANY.email}\n- 주소: ${COMPANY.address}\n- 웹사이트: ${SITE_ORIGIN}/`,
    "## 서비스",
    ["/btl", "/festival", "/mice"].map((p) => link(byPath(p))).filter(Boolean).join("\n"),
    "## 회사 소개·문의",
    ["/about", "/faq", "/Projects"].map((p) => link(byPath(p))).filter(Boolean).join("\n"),
    "## 프로젝트 (행사 대행 실적)",
    projects.map((p) => {
      const meta = [p.client, p.date, p.venue || p.location].filter(Boolean).join(" · ");
      return `- [${p.title}](${SITE_ORIGIN}${p.url}): ${p.summary || ""}${meta ? ` (${meta})` : ""} — 전체 텍스트: ${SITE_ORIGIN}${p.url}.md`;
    }).join("\n"),
    "## Optional",
    `- [전체 본문 모음](${SITE_ORIGIN}/llms-full.txt): 모든 프로젝트의 상세 텍스트`,
  ].join("\n\n") + "\n";
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
  // GEO: 프로젝트별 본문 전체 텍스트 (projects/<id>.md)
  const projectMd = new Map();
  for (const p of projects) {
    const md = projectMarkdown(p);
    projectMd.set(p.id, md);
    await fs.writeFile(path.join(projectsDir, `${p.id}.md`), md);
    keep.add(`${p.id}.md`);
  }
  for (const f of await fs.readdir(projectsDir)) {
    if ((f.endsWith(".html") || f.endsWith(".md")) && !keep.has(f)) await fs.unlink(path.join(projectsDir, f));
  }

  // 3) GEO: llms.txt / llms-full.txt
  const llms = llmsTxt(pages, projects);
  await fs.writeFile(path.join(ROOT, "llms.txt"), llms);
  await fs.writeFile(
    path.join(ROOT, "llms-full.txt"),
    llms + "\n\n---\n\n# 프로젝트 전체 본문\n\n" + projects.map((p) => projectMd.get(p.id)).join("\n\n---\n\n") + "\n"
  );

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

  console.log(`완료: 페이지 ${pages.length}개, 프로젝트 ${projects.length}개 생성, sitemap.xml·llms.txt 갱신`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
