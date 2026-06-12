/* =====================================================================
   Notion → content.json 동기화 스크립트 (projects 전용)

   Notion의 "Projects" 데이터베이스를 읽어 content.json 의 projects 배열을
   교체하고, 커버/이미지/본문 이미지 파일을 projects_images/<id>/ 로
   다운로드한 뒤, sitemap.xml 을 재생성한다. insights 는 건드리지 않는다.

   본문(페이지 콘텐츠) 안의 이미지 블록도 다운로드하여
   projects_images/<id>/body-N.<ext> 로 저장하고, body 의 markdown은
   해당 로컬 경로를 가리키도록 변환된다.

   사용하는 Notion 속성:
     ID, Name, Category, Date, Location, Client, Cover, Images,
     Summary, Status, Written Date(date), Main_Visible(checkbox), Main_Order(number)

   필요 환경변수:
     NOTION_API_KEY        - Notion Internal Integration 토큰
     NOTION_PROJECTS_DB_ID - Projects 데이터베이스 ID

   실행: npm run sync-notion
   ===================================================================== */

import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_PATH = path.join(ROOT, "content.json");
const SITEMAP_PATH = path.join(ROOT, "sitemap.xml");
const SITE_ORIGIN = "https://rastarcomms.com";

const NOTION_API_KEY = process.env.NOTION_API_KEY;
const NOTION_PROJECTS_DB_ID = process.env.NOTION_PROJECTS_DB_ID;

if (!NOTION_API_KEY || !NOTION_PROJECTS_DB_ID) {
  console.error("NOTION_API_KEY / NOTION_PROJECTS_DB_ID 환경변수가 필요합니다.");
  process.exit(1);
}

const notion = new Client({ auth: NOTION_API_KEY });
const n2m = new NotionToMarkdown({ notionClient: notion });

/* ---------------- 본문 인라인 이미지 다운로드 ----------------
   mapProject() 가 페이지를 처리하기 직전에 currentImageDir/bodyImageIndex 를
   설정해두면, n2m 이 본문의 image 블록을 만날 때마다 다운로드하여
   projects_images/<id>/body-N.<ext> 로 저장하고 로컬 경로를 가리키는
   markdown 으로 치환한다. main() 에서 페이지를 순차 처리하므로
   동시성 문제는 없다. */
let currentImageDir = "";
let bodyImageIndex = 0;
n2m.setCustomTransformer("image", async (block) => {
  const img = block.image;
  const url = img?.type === "external" ? img.external?.url : img?.file?.url;
  if (!url) return "";
  bodyImageIndex += 1;
  const dest = path.join(currentImageDir, `body-${bodyImageIndex}${extFromUrl(url)}`);
  await downloadFile(url, dest);
  const rel = path.relative(ROOT, dest).split(path.sep).join("/");
  const caption = (img.caption || []).map((t) => t.plain_text).join("");
  return `![${caption}](${rel})`;
});

/* ---------------- Notion 속성 헬퍼 ---------------- */
function richText(page, name) {
  const prop = page.properties[name];
  if (!prop) return "";
  if (prop.type === "title") return prop.title.map((t) => t.plain_text).join("").trim();
  if (prop.type === "rich_text") return prop.rich_text.map((t) => t.plain_text).join("").trim();
  if (prop.type === "number") return prop.number == null ? "" : String(prop.number);
  if (prop.type === "unique_id") return prop.unique_id?.number == null ? "" : String(prop.unique_id.number);
  return "";
}
function selectVal(page, name) {
  return page.properties[name]?.select?.name || "";
}
function checkboxVal(page, name) {
  return !!page.properties[name]?.checkbox;
}
function numberVal(page, name) {
  const prop = page.properties[name];
  if (!prop || prop.type !== "number") return null;
  return prop.number;
}
function dateVal(page, name) {
  const prop = page.properties[name];
  if (!prop || prop.type !== "date" || !prop.date) return "";
  return prop.date.start || "";
}
function fileUrls(page, name) {
  const prop = page.properties[name];
  if (!prop || prop.type !== "files") return [];
  return prop.files
    .map((f) => (f.type === "file" ? f.file.url : f.external?.url))
    .filter(Boolean);
}

/* ---------------- 파일 다운로드 ---------------- */
function extFromUrl(url) {
  const clean = url.split("?")[0];
  const ext = path.extname(clean);
  return ext || ".jpg";
}
async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`이미지 다운로드 실패 (${res.status}): ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await fs.mkdir(path.dirname(destPath), { recursive: true });
  await fs.writeFile(destPath, buf);
}

/* ---------------- 본문(Markdown) 정리 ----------------
   site-data.js 의 mdToHtml 은 ##/### 헤딩, 문단, -/* 리스트,
   **bold**, *italic*, [text](url) 링크만 지원한다.
   notion-to-md 출력 중 미지원 구문은 단순화/제거한다. */
function sanitizeMarkdown(md) {
  return md
    .split("\n")
    .map((line) => line.replace(/^\s+/, "")) // 중첩 들여쓰기 평탄화
    .map((line) => line.replace(/^#\s+/, "## ")) // H1 -> H2
    .map((line) => line.replace(/^####+\s+/, "### ")) // H4+ -> H3
    .map((line) => line.replace(/^>\s?/, "")) // blockquote -> 문단
    .map((line) => line.replace(/^[-*]\s+\[[ xX]\]\s+/, "- ")) // 체크박스 -> 일반 리스트
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/* ---------------- Notion DB 페이지 조회 ---------------- */
async function fetchAllPages(databaseId) {
  const results = [];
  let cursor;
  do {
    const res = await notion.databases.query({
      database_id: databaseId,
      start_cursor: cursor,
    });
    results.push(...res.results);
    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
  return results;
}

/* ---------------- 페이지 -> project 객체 매핑 ---------------- */
async function mapProject(page) {
  const id = richText(page, "ID");
  if (!id) {
    const idProp = page.properties["ID"];
    console.warn(
      `[skip] ID 속성이 비어 있는 페이지를 건너뜁니다: ${page.id} ` +
      `(ID 속성 타입: ${idProp ? idProp.type : "속성 없음"}, ` +
      `사용 가능한 속성: ${Object.keys(page.properties).join(", ")})`
    );
    return null;
  }

  const dir = path.join(ROOT, "projects_images", id);

  let cover = "";
  const coverUrls = fileUrls(page, "Cover");
  if (coverUrls[0]) {
    const dest = path.join(dir, `cover${extFromUrl(coverUrls[0])}`);
    await downloadFile(coverUrls[0], dest);
    cover = path.relative(ROOT, dest).split(path.sep).join("/");
  }

  const images = [];
  const imageUrls = fileUrls(page, "Images");
  for (let i = 0; i < imageUrls.length; i++) {
    const dest = path.join(dir, `img-${i + 1}${extFromUrl(imageUrls[i])}`);
    await downloadFile(imageUrls[i], dest);
    images.push(path.relative(ROOT, dest).split(path.sep).join("/"));
  }

  currentImageDir = dir;
  bodyImageIndex = 0;
  const mdBlocks = await n2m.pageToMarkdown(page.id);
  const { parent } = n2m.toMarkdownString(mdBlocks);
  const body = sanitizeMarkdown(parent || "");

  const status = selectVal(page, "Status") === "Published" ? "published" : "draft";

  return {
    id,
    title: richText(page, "Name"),
    category: selectVal(page, "Category"),
    date: richText(page, "Date"),
    writtenDate: dateVal(page, "Written Date"),
    location: richText(page, "Location"),
    client: richText(page, "Client"),
    cover,
    images,
    summary: richText(page, "Summary"),
    body,
    featured: checkboxVal(page, "Main_Visible"),
    mainOrder: numberVal(page, "Main_Order"),
    status,
  };
}

/* ---------------- sitemap.xml 재생성 ---------------- */
async function writeSitemap(content) {
  const urls = [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/Projects.html`,
    `${SITE_ORIGIN}/Blog.html`,
    `${SITE_ORIGIN}/Contact.html`,
  ];
  for (const p of content.projects) {
    if (p.status === "published") {
      urls.push(`${SITE_ORIGIN}/Project.html?id=${encodeURIComponent(p.id)}`);
    }
  }
  for (const i of content.insights || []) {
    if (i.status === "published") {
      urls.push(`${SITE_ORIGIN}/Blog%20Post.html?id=${encodeURIComponent(i.id)}`);
    }
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;

  await fs.writeFile(SITEMAP_PATH, xml);
}

/* ---------------- 메인 ---------------- */
async function main() {
  const content = JSON.parse(await fs.readFile(CONTENT_PATH, "utf8"));

  const pages = await fetchAllPages(NOTION_PROJECTS_DB_ID);
  console.log(`Notion에서 조회된 페이지 수: ${pages.length}`);
  const projects = [];
  for (const page of pages) {
    const project = await mapProject(page);
    if (project) projects.push(project);
  }

  content.projects = projects;
  content.savedAt = new Date().toISOString();

  await fs.writeFile(CONTENT_PATH, JSON.stringify(content, null, 2) + "\n");
  await writeSitemap(content);

  console.log(`완료: projects ${projects.length}개 동기화`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
