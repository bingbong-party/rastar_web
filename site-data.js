/* =====================================================================
   라별 — 공개 사이트 데이터 렌더러
   content.json 을 읽어 랜딩 캐러셀 / 프로젝트 갤러리 / 블로그 목록·상세를
   렌더링한다. Decap CMS 가 content.json 을 커밋하면 그대로 반영된다.
   (백엔드 없음 · 빌드 단계 없음 — 브라우저에서 fetch 후 렌더)
   ===================================================================== */
(function () {
  "use strict";

  var DATA_URL = "content.json";
  var dataP = null;

  function getData() {
    if (dataP) return dataP;
    dataP = fetch(DATA_URL, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .catch(function () { return { projects: [], insights: [] }; });
    return dataP;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }
  function pub(list) {
    return (list || []).filter(function (x) { return x.status === "published"; });
  }
  // 이미지 값은 문자열 경로이거나 {src}/{image} 객체일 수 있다 (Decap 리스트 위젯 호환)
  function imgUrl(x) {
    if (!x) return "";
    return typeof x === "string" ? x : (x.src || x.image || "");
  }

  function coverImg(p, cls) {
    var url = esc(p.cover || "");
    if (!url) return '<div class="' + cls + ' g-img-ph"></div>';
    return '<img class="' + cls + '" src="' + url + '" alt="' + esc(p.title || "") + '" loading="lazy">';
  }

  /* ---------------- 프로젝트 갤러리 (랜딩 + Projects) ---------------- */
  function galleryItem(p) {
    return '<article class="gallery-item"><a href="Project.html?id=' + encodeURIComponent(p.id) + '" class="gallery-link" aria-label="' + esc(p.title || "") + ' 상세 보기">' +
      coverImg(p, "g-img") +
      '<div class="gallery-overlay"><div class="g-inner">' +
        '<span class="g-cat">' + esc(p.category || "") + '</span>' +
        '<div class="g-ttl">' + esc(p.title || "") + '</div>' +
        '<p class="g-desc">' + esc(p.summary || "") + '</p>' +
        '<div class="g-date">' + esc(p.date || "") + (p.location ? " · " + esc(p.location) : "") + '</div>' +
      '</div></div></a></article>';
  }
  function renderGallery(sel, opts) {
    opts = opts || {};
    var host = document.querySelector(sel);
    if (!host) return;
    getData().then(function (d) {
      var list = pub(d.projects);
      if (opts.featuredOnly) list = list.filter(function (p) { return p.featured; });
      if (opts.limit) list = list.slice(0, opts.limit);
      host.innerHTML = list.map(galleryItem).join("") ||
        '<p class="data-empty">표시할 프로젝트가 없습니다.</p>';
    });
  }

  /* ---------------- 블로그 목록 ---------------- */
  function postCard(p) {
    return '<article class="post-card" data-id="' + esc(p.id) + '">' +
      '<div class="post-thumb"><span class="post-cat">' + esc(p.category || "") + '</span>' +
        coverImg(p, "g-img") + '</div>' +
      '<div class="post-body">' +
        '<div class="p-date">' + esc(p.date || "") + '</div>' +
        '<h2 class="p-ttl">' + esc(p.title || "") + '</h2>' +
        '<p class="p-ex">' + esc(p.summary || "") + '</p>' +
        '<span class="p-more">자세히 보기 <span class="go" aria-hidden="true">→</span></span>' +
      '</div></article>';
  }
  function renderBlogList(sel) {
    var host = document.querySelector(sel);
    if (!host) return;
    getData().then(function (d) {
      var list = pub(d.insights);
      host.innerHTML = list.map(postCard).join("") ||
        '<p class="data-empty">아직 게시된 글이 없습니다.</p>';
      Array.prototype.forEach.call(host.querySelectorAll(".post-card"), function (card) {
        card.addEventListener("click", function () {
          location.href = "Blog Post.html?id=" + encodeURIComponent(card.getAttribute("data-id"));
        });
      });
    });
  }

  /* ---------------- 블로그 상세 (마크다운 본문) ---------------- */
  // content.json 의 body 는 운영자가 git 으로 관리하는 신뢰된 마크다운.
  // 사용하는 문법(제목 ##/###, 문단)만 가볍게 변환한다.
  function mdInline(s) {
    // s 는 이미 esc() 처리된 문자열. 안전한 인라인 문법만 변환.
    s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|mailto:[^\s)]+|\/[^\s)]*|[A-Za-z0-9._%-]+\.html[^\s)]*)\)/g,
      '<a href="$2">$1</a>');
    return s;
  }
  function mdToHtml(md) {
    var lines = String(md || "").replace(/\r\n/g, "\n").split("\n");
    var out = [], list = null, para = [];
    function flushPara() {
      if (para.length) { out.push("<p>" + mdInline(esc(para.join("\n"))).replace(/\n/g, "<br>") + "</p>"); para = []; }
    }
    function flushList() { if (list) { out.push("<ul>" + list.join("") + "</ul>"); list = null; } }
    lines.forEach(function (raw) {
      var line = raw.replace(/\s+$/, "");
      if (/^###\s+/.test(line)) { flushPara(); flushList(); out.push("<h3>" + mdInline(esc(line.replace(/^###\s+/, ""))) + "</h3>"); }
      else if (/^##\s+/.test(line)) { flushPara(); flushList(); out.push("<h2>" + mdInline(esc(line.replace(/^##\s+/, ""))) + "</h2>"); }
      else if (/^[-*]\s+/.test(line)) { flushPara(); list = list || []; list.push("<li>" + mdInline(esc(line.replace(/^[-*]\s+/, ""))) + "</li>"); }
      else if (!line.trim()) { flushPara(); flushList(); }
      else { flushList(); para.push(line); }
    });
    flushPara(); flushList();
    return out.join("");
  }
  function renderArticle(sel) {
    var host = document.querySelector(sel);
    if (!host) return;
    var id = new URLSearchParams(location.search).get("id");
    getData().then(function (d) {
      var list = pub(d.insights);
      var post = list.filter(function (x) { return x.id === id; })[0] || list[0];
      if (!post) { host.innerHTML = '<p class="data-empty">글을 찾을 수 없습니다.</p>'; return; }
      var hero = post.cover
        ? '<div class="a-hero"><img class="g-img" src="' + esc(post.cover) + '" alt="' + esc(post.title) + '"></div>'
        : "";
      host.innerHTML =
        '<a class="back-link" href="Blog.html"><span aria-hidden="true">←</span> 블로그로 돌아가기</a>' +
        '<div class="a-cat">' + esc(post.category || "") + '</div>' +
        '<h1>' + esc(post.title || "") + '</h1>' +
        '<div class="a-meta">' + esc(post.date || "") + (post.author ? " · " + esc(post.author) : "") + '</div>' +
        hero + mdToHtml(post.body);
      document.title = (post.title || "Blog") + " — Rabyeol Comms";
    });
  }

  function renderProject(sel) {
    var host = document.querySelector(sel);
    if (!host) return;
    var id = new URLSearchParams(location.search).get("id");
    getData().then(function (d) {
      var list = pub(d.projects);
      var proj = list.filter(function (x) { return x.id === id; })[0] || list[0];
      if (!proj) { host.innerHTML = '<p class="data-empty">프로젝트를 찾을 수 없습니다.</p>'; return; }
      var hero = proj.cover
        ? '<div class="a-hero"><img class="g-img" src="' + esc(proj.cover) + '" alt="' + esc(proj.title) + '"></div>'
        : "";
      var extraImgs = (proj.images || []).length
        ? '<div class="proj-images">' + proj.images.map(function (img) {
            var url = esc(imgUrl(img));
            return url ? '<img class="g-img" src="' + url + '" alt="' + esc(proj.title) + '" loading="lazy">' : "";
          }).join("") + '</div>'
        : "";
      host.innerHTML =
        '<a class="back-link" href="Projects.html"><span aria-hidden="true">←</span> 전체 프로젝트 보기</a>' +
        '<div class="a-cat">' + esc(proj.category || "") + '</div>' +
        '<h1>' + esc(proj.title || "") + '</h1>' +
        '<div class="a-meta">' + esc(proj.date || "") +
          (proj.location ? " · " + esc(proj.location) : "") +
          (proj.client ? " · " + esc(proj.client) : "") +
        '</div>' +
        hero +
        '<div class="a-body">' + mdToHtml(proj.body) + '</div>' +
        extraImgs;
      document.title = (proj.title || "Project") + " — Rabyeol Comms";
    });
  }

  window.RabyeolData = {
    getData: getData,
    renderGallery: renderGallery,
    renderBlogList: renderBlogList,
    renderArticle: renderArticle,
    renderProject: renderProject
  };
})();
