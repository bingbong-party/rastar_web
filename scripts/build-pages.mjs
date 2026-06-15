/* =====================================================================
   content.json → 프로젝트/인사이트 상세 정적 페이지 생성기

   AI/검색 크롤러가 JS 없이도 본문·제목·구조화 데이터를 볼 수 있도록,
   site-data.js의 renderProject()/renderArticle()이 브라우저에서 만드는
   내용을 빌드 타임에 동일하게 생성해 projects/<id>.html, insights/<id>.html
   로 저장한다. 동시에 sitemap.xml을 이 URL들로 재생성한다.

   Project.html / Blog Post.html (?id= 버전)은 그대로 유지되며,
   site-data.js의 applyMeta()가 canonical을 이 정적 URL로 지정한다.

   실행: npm run build-pages
   ===================================================================== */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_ORIGIN = "https://rastarcomms.com";

/* ---------------- site-data.js 와 동일한 헬퍼 (포팅) ---------------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"]/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])
  );
}
function mdInline(s) {
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  s = s.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*|[A-Za-z0-9._%-]+\.html[^\s)]*)\)/g,
    '<a href="$2">$1</a>'
  );
  return s;
}
function mdToHtml(md) {
  const lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let list = null;
  let para = [];
  function flushPara() {
    if (para.length) {
      out.push("<p>" + mdInline(esc(para.join("\n"))).replace(/\n/g, "<br>") + "</p>");
      para = [];
    }
  }
  function flushList() {
    if (list) {
      out.push("<ul>" + list.join("") + "</ul>");
      list = null;
    }
  }
  lines.forEach((raw) => {
    const line = raw.replace(/\s+$/, "");
    if (/^###\s+/.test(line)) { flushPara(); flushList(); out.push("<h3>" + mdInline(esc(line.replace(/^###\s+/, ""))) + "</h3>"); }
    else if (/^##\s+/.test(line)) { flushPara(); flushList(); out.push("<h2>" + mdInline(esc(line.replace(/^##\s+/, ""))) + "</h2>"); }
    else if (/^!\[([^\]]*)\]\(([^)]+)\)\s*$/.test(line)) {
      flushPara(); flushList();
      const img = line.match(/^!\[([^\]]*)\]\(([^)]+)\)\s*$/);
      out.push('<img src="' + esc(img[2]) + '" alt="' + esc(img[1]) + '" loading="lazy">');
    }
    else if (/^[-*]\s+/.test(line)) { flushPara(); list = list || []; list.push("<li>" + mdInline(esc(line.replace(/^[-*]\s+/, ""))) + "</li>"); }
    else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); para.push(line); }
  });
  flushPara(); flushList();
  return out.join("");
}
function imgUrl(x) {
  if (!x) return "";
  return typeof x === "string" ? x : (x.src || x.image || "");
}
function absImage(p) {
  if (!p) return `${SITE_ORIGIN}/images/hero-bg-1.jpg`;
  return `${SITE_ORIGIN}/${String(p).replace(/^\/+/, "")}`;
}
/* projects_images/... 같은 루트 상대경로를 상위 디렉토리(projects/, insights/)에서도
   동작하도록 루트 절대경로로 바꾼다. */
function rootRelativeImages(html) {
  return html.replace(/src="projects_images\//g, 'src="/projects_images/');
}

/* ---------------- 템플릿의 자산 경로를 루트 절대경로로 치환 ---------------- */
function absolutizeAssets(html) {
  return html
    .replace('href="styles.css"', 'href="/styles.css"')
    .replace('href="images/favicon-32.png"', 'href="/images/favicon-32.png"')
    .replace('href="images/favicon-16.png"', 'href="/images/favicon-16.png"')
    .replace('href="images/apple-touch-icon.png"', 'href="/images/apple-touch-icon.png"')
    .replace('src="site-nav.js"', 'src="/site-nav.js"')
    .replace('src="site-footer.js"', 'src="/site-footer.js"')
    .replace('src="site-data.js"', 'src="/site-data.js"')
    .replace('src="app.js"', 'src="/app.js"')
    .replace('src="consult-modal.js"', 'src="/consult-modal.js"')
    .replace('href="Contact.html"', 'href="/Contact.html"');
}

/* ---------------- <head> 메타 치환 ---------------- */
function setHeadMeta(html, { title, description, canonicalUrl, image }) {
  return html
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${description}">`)
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${title}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${description}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${image}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${title}">`)
    .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${description}">`)
    .replace(/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${image}">`);
}
function insertJsonLd(html, data) {
  const script = `<script type="application/ld+json">\n${JSON.stringify(data, null, 2)}\n</script>\n`;
  return html.replace("</head>", script + "</head>");
}

/* ---------------- 본문 마크업 (renderProject/renderArticle과 동일) ---------------- */
function projectArticleHtml(proj) {
  const hero = proj.cover
    ? `<div class="a-hero"><img class="g-img" src="${esc(proj.cover)}" alt="${esc(proj.title)}"></div>`
    : "";
  const extraImgs = (proj.images || []).length
    ? '<div class="proj-images">' + proj.images.map((img) => {
        const url = esc(imgUrl(img));
        return url ? `<img class="g-img" src="${url}" alt="${esc(proj.title)}" loading="lazy">` : "";
      }).join("") + '</div>'
    : "";
  const html =
    '<a class="back-link" href="/Projects.html"><span aria-hidden="true">←</span> 전체 프로젝트 보기</a>' +
    `<div class="a-cat">${esc(proj.category || "")}</div>` +
    `<h1>${esc(proj.title || "")}</h1>` +
    `<div class="a-meta">${esc(proj.date || "")}` +
      (proj.location ? ` · ${esc(proj.location)}` : "") +
      (proj.client ? ` · ${esc(proj.client)}` : "") +
    `</div>` +
    hero +
    `<div class="a-body">${mdToHtml(proj.body)}</div>` +
    extraImgs;
  return rootRelativeImages(html);
}
function insightArticleHtml(post) {
  const hero = post.cover
    ? `<div class="a-hero"><img class="g-img" src="${esc(post.cover)}" alt="${esc(post.title)}"></div>`
    : "";
  const html =
    '<a class="back-link" href="/Blog.html"><span aria-hidden="true">←</span> 블로그로 돌아가기</a>' +
    `<div class="a-cat">${esc(post.category || "")}</div>` +
    `<h1>${esc(post.title || "")}</h1>` +
    `<div class="a-meta">${esc(post.date || "")}` + (post.author ? ` · ${esc(post.author)}` : "") + `</div>` +
    hero + mdToHtml(post.body);
  return rootRelativeImages(html);
}

/* ---------------- 메인 ---------------- */
async function main() {
  const content = JSON.parse(await fs.readFile(path.join(ROOT, "content.json"), "utf8"));
  const projectTemplate = await fs.readFile(path.join(ROOT, "Project.html"), "utf8");
  const insightTemplate = await fs.readFile(path.join(ROOT, "Blog Post.html"), "utf8");

  const projectsDir = path.join(ROOT, "projects");
  const insightsDir = path.join(ROOT, "insights");
  await fs.mkdir(projectsDir, { recursive: true });
  await fs.mkdir(insightsDir, { recursive: true });

  const sitemapUrls = [
    `${SITE_ORIGIN}/`,
    `${SITE_ORIGIN}/Projects.html`,
    `${SITE_ORIGIN}/Blog.html`,
    `${SITE_ORIGIN}/Contact.html`,
  ];

  let projectCount = 0;
  for (const proj of content.projects || []) {
    if (proj.status !== "published") continue;
    const url = `${SITE_ORIGIN}/projects/${encodeURIComponent(proj.id)}.html`;
    const image = absImage(proj.cover);
    let html = absolutizeAssets(projectTemplate);
    html = setHeadMeta(html, {
      title: esc(`${proj.title || "프로젝트"} | 라별`),
      description: esc(proj.summary || ""),
      canonicalUrl: url,
      image,
    });
    html = insertJsonLd(html, {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: proj.title || "",
      description: proj.summary || "",
      image,
      url,
    });
    html = html.replace(
      /<article class="article" id="project-detail">[\s\S]*?<\/article>/,
      `<article class="article" id="project-detail">${projectArticleHtml(proj)}</article>`
    );
    html = html.replace(/\n?<script>RabyeolData\.renderProject\("#project-detail"\);<\/script>/, "");
    await fs.writeFile(path.join(projectsDir, `${proj.id}.html`), html);
    sitemapUrls.push(url);
    projectCount += 1;
  }

  let insightCount = 0;
  for (const post of content.insights || []) {
    if (post.status !== "published") continue;
    const url = `${SITE_ORIGIN}/insights/${encodeURIComponent(post.id)}.html`;
    const image = absImage(post.cover);
    let html = absolutizeAssets(insightTemplate);
    html = setHeadMeta(html, {
      title: esc(`${post.title || "인사이트"} | 라별`),
      description: esc(post.summary || ""),
      canonicalUrl: url,
      image,
    });
    html = insertJsonLd(html, {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title || "",
      description: post.summary || "",
      image,
      author: { "@type": "Organization", name: post.author || "라별" },
      ...(post.date ? { datePublished: post.date } : {}),
      url,
    });
    html = html.replace(
      /<article class="article" id="article">[\s\S]*?<\/article>/,
      `<article class="article" id="article">${insightArticleHtml(post)}</article>`
    );
    html = html.replace(/\n?<script>RabyeolData\.renderArticle\("#article"\);<\/script>/, "");
    await fs.writeFile(path.join(insightsDir, `${post.id}.html`), html);
    sitemapUrls.push(url);
    insightCount += 1;
  }

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapUrls.map((u) => `  <url><loc>${u}</loc></url>`).join("\n") +
    `\n</urlset>\n`;
  await fs.writeFile(path.join(ROOT, "sitemap.xml"), xml);

  console.log(`완료: projects ${projectCount}개, insights ${insightCount}개 정적 페이지 생성, sitemap.xml 갱신`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
