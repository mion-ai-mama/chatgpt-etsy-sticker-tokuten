/**
 * script.js — content.js の内容からページを組み立てる（通常は編集不要）
 */
(function () {
  "use strict";

  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const ext = (url, text, cls) => `<a class="btn ${cls || ""}" href="${esc(url)}" target="_blank" rel="noopener">${text}</a>`;
  const paras = (arr) => (arr || []).map((p) => `<p>${p}</p>`).join("");

  function setMeta(selector, value) {
    const el = document.querySelector(selector);
    if (el && value != null) el.setAttribute("content", value);
  }

  function applyMeta(m) {
    document.title = m.pageTitle;
    setMeta('meta[name="description"]', m.description);
    setMeta('meta[property="og:title"]', m.pageTitle);
    setMeta('meta[property="og:description"]', m.description);
    setMeta('meta[property="og:url"]', m.siteUrl);
  }

  // プロンプト本文を安全にHTML化し、書き換える場所（［ ］）を目立たせる
  function highlightSlots(text) {
    return esc(text).replace(/［[^］\n]*］/g, '<span class="slot">$&</span>');
  }

  const list = (items, cls) => (items && items.length ? `<ul class="${cls}">${items.map((i) => `<li>${i}</li>`).join("")}</ul>` : "");
  const textLink = (url, text) => `<a class="text-link" href="${esc(url)}" target="_blank" rel="noopener">${text} ↗</a>`;
  const linkLines = (links) => (links && links.length ? `<p class="source">${links.map((l) => textLink(l.url, l.text)).join("<br>")}</p>` : "");
  const figure = (img, alt, ratio, caption) =>
    `<figure class="figure"><img src="${esc(img)}" alt="${esc(alt)}" style="aspect-ratio:${ratio}" loading="lazy">${caption ? `<figcaption>${caption}</figcaption>` : ""}</figure>`;

  function hero(h) {
    return `
    <section class="hero" aria-labelledby="hero-title">
      <div class="container">
        <p class="hero__brand">${h.brand}</p>
        <h1 class="hero__title" id="hero-title">${h.titleLines.map((l) => `<span>${l}</span>`).join("")}</h1>
        <p class="hero__sub">${h.subtitle}</p>
        <div class="hero__lead">${paras(h.lead)}</div>
        ${figure(h.image.src, h.image.alt, h.image.ratio, h.image.caption).replace('class="figure"', 'class="figure figure--hero"')}
        <a class="btn btn--ghost" href="#${esc(h.buttonTarget)}" data-scroll>${h.buttonText}</a>
      </div>
    </section>`;
  }

  function topCta(c, url) {
    const image = `<a class="cta-soft__image" href="${esc(url)}" target="_blank" rel="noopener"><img src="${esc(c.image.src)}" alt="${esc(c.image.alt)}" width="1855" height="848"></a>`;
    return `
    <section class="container top-cta" aria-labelledby="top-cta-title">
      <div class="cta-soft">
        ${image}
        <div class="cta-soft__text">
          <h2 class="cta-soft__title" id="top-cta-title">${c.heading}</h2>
          <p>${c.text}</p>
          <ul class="cta-soft__list">${c.items.map((i) => `<li>${i}</li>`).join("")}</ul>
        </div>
        ${ext(url, c.buttonText)}
      </div>
    </section>`;
  }

  function features(f) {
    return `
    <section class="section section--soft" id="${f.id}" aria-labelledby="${f.id}-title">
      <div class="container">
        <h2 class="heading" id="${f.id}-title">${f.heading}</h2>
        ${list(f.items, "check-list")}
        <p class="source">${f.note}</p>
      </div>
    </section>`;
  }

  function flow(f) {
    const steps = f.steps.map((s) => `<li><span class="route__tool">${s.tag}</span>${s.text}</li>`).join("");
    return `
    <section class="section" id="${f.id}" aria-labelledby="${f.id}-title">
      <div class="container">
        <h2 class="heading" id="${f.id}-title">${f.heading}</h2>
        <ol class="route">${steps}</ol>
        <p class="emphasis">${f.note}</p>
      </div>
    </section>`;
  }

  function toc(t) {
    const rows = t.items.map((i) => `<li><a href="#${esc(i.id)}" data-scroll><span class="toc__term">${i.label}</span></a></li>`).join("");
    return `
    <nav class="section section--soft" id="${t.id}" aria-labelledby="${t.id}-title">
      <div class="container">
        <h2 class="heading" id="${t.id}-title">${t.heading}</h2>
        <ol class="toc">${rows}</ol>
      </div>
    </nav>`;
  }

  function promptBlock(b, id) {
    const slots = (b.text.match(/［[^］\n]*］/g) || []).length;
    const slotHint = `<strong>黄色の <span class="slot">［　］</span> の中が、書き換える場所（${slots}か所）</strong>です。自分の内容に変えてから、コピーしてください。`;
    const hint = /［/.test(b.text) ? slotHint + (b.hint ? ` ${b.hint}` : "") : b.hint || "そのまま貼り付けて使えます。";
    return `
    <div class="prompt">
      <p class="prompt__label">${b.label}</p>
      <p class="prompt__hint">${hint}</p>
      <pre class="prompt__text" id="${id}">${highlightSlots(b.text)}</pre>
      <button type="button" class="btn btn--primary copy-btn" data-copy-target="${id}">
        <span class="copy-btn__label">プロンプトをコピー</span>
        <span class="copy-btn__done" role="status" aria-live="polite">コピーしました！</span>
      </button>
      <p class="prompt__fallback" hidden>コピーできない場合は、上の文章を長押し（PCはドラッグ）で選択して、手動でコピーしてください。</p>
    </div>`;
  }

  function flowBlock(b) {
    const nodes = b.nodes
      .map((n) => {
        if (n.chip) return `<li class="vis__chip" aria-hidden="true"><span>${n.chip}</span></li>`;
        const body = n.img ? `<img src="${esc(n.img)}" alt="${esc(n.alt)}" style="aspect-ratio:${n.ratio}" loading="lazy">` : `<p class="vis__box">${n.box}</p>`;
        return `<li class="vis__node">${body}<span class="vis__cap">${n.caption}</span></li>`;
      })
      .join("");
    return `<div><h3 class="sub-heading">${b.heading}</h3><ol class="vis">${nodes}</ol>${b.note ? `<p class="source">${b.note}</p>` : ""}</div>`;
  }

  function block(b, id) {
    switch (b.type) {
      case "text":
        return `<div><h3 class="sub-heading">${b.heading}</h3>${paras(b.paragraphs)}</div>`;
      case "list":
        return `<div><h3 class="sub-heading">${b.heading}</h3>${list(b.items, "bullet-list")}</div>`;
      case "ordered":
        return `<div><h3 class="sub-heading">${b.heading}</h3><ol class="num-list">${b.items.map((i) => `<li>${i}</li>`).join("")}</ol></div>`;
      case "prompt":
        return promptBlock(b, id);
      case "flow":
        return flowBlock(b);
      case "image":
        return figure(b.img, b.alt, b.ratio, b.caption);
      case "point":
        return `<aside class="point-box"><p class="point-box__label">${b.label}</p>${b.text ? `<p>${b.text}</p>` : ""}${list(b.list, "point-box__list")}${linkLines(b.links)}${b.note ? `<p class="source">${b.note}</p>` : ""}</aside>`;
      case "caution":
        return `<aside class="point-box point-box--caution"><p class="point-box__label">${b.label}</p>${b.text ? `<p>${b.text}</p>` : ""}${list(b.list, "point-box__list")}${linkLines(b.links)}${b.note ? `<p class="source">${b.note}</p>` : ""}</aside>`;
      case "note":
        return `<p class="source">${b.text}</p>`;
      default:
        return "";
    }
  }

  function card(c) {
    const body = c.blocks.map((b, i) => block(b, `${c.id}-b${i}`)).join("");
    return `
    <section class="step" id="${c.id}" aria-labelledby="${c.id}-title">
      <div class="container">
        <article class="step-card">
          <header class="tech__head">
            <p class="tech__no">${c.no}</p>
            <h2 class="tech__title" id="${c.id}-title">${c.title}</h2>
            <p class="tech__sub">${c.lead}</p>
          </header>
          <div class="step__body">${body}</div>
        </article>
      </div>
    </section>`;
  }

  function rules(r) {
    const items = r.items
      .map(
        (it) => `<li><strong class="rule__title">${it.title}</strong>${it.text}${
          it.example ? `<span class="rule__example" lang="en">${it.example}</span><span class="source">${it.exampleNote}</span>` : ""
        }${it.unconfirmed ? `<span class="source">${it.unconfirmed}</span>` : ""}</li>`
      )
      .join("");
    return `
    <section class="section section--soft" id="${r.id}" aria-labelledby="${r.id}-title">
      <div class="container">
        <h2 class="heading" id="${r.id}-title">${r.heading}</h2>
        <p>${r.lead}</p>
        <ol class="num-list rules">${items}</ol>
        <aside class="point-box point-box--caution"><p class="point-box__label">${r.linksLabel}</p>${linkLines(r.links)}<p class="source">${r.note}</p></aside>
      </div>
    </section>`;
  }

  function summary(s) {
    return `
    <section class="section" id="${s.id}" aria-labelledby="${s.id}-title">
      <div class="container">
        <h2 class="heading" id="${s.id}-title">${s.heading}</h2>
        ${paras(s.paragraphs)}
      </div>
    </section>`;
  }

  function finalCta(c, t, url) {
    const pains = c.pains.map((p) => `<li class="pain__bubble">${p}</li>`).join("");
    const rows = c.solutions
      .map((r) => `<li class="solve__row"><p class="solve__pain">${r.pain}</p><p class="solve__give">${r.give}</p></li>`)
      .join("");
    return `
    <section class="section section--soft" id="line" aria-labelledby="pain-title">
      <div class="container">
        <h2 class="heading" id="pain-title">${c.painHeading}</h2>
        <ul class="pain">${pains}</ul>
        <p class="bridge">${c.bridge}</p>
        <div class="cta-final">
          <h2 class="cta-final__title" id="final-cta-title">${c.heading}</h2>
          <p class="cta-final__lead">${c.lead}</p>
          <p class="solve__label">${c.solutionsLabel}</p>
          <ul class="solve">${rows}</ul>
          <p class="cta-final__caution">${c.caution}</p>
          ${ext(url, c.buttonText, "btn--large")}
        </div>
        <div class="textbook">
          <p>${t.bridge}</p>
          <a class="textbook__banner" href="${esc(url)}" target="_blank" rel="noopener">
            <img src="${esc(t.banner)}" alt="${esc(t.bannerAlt)}" loading="lazy">
          </a>
          <p>${t.support}</p>
        </div>
      </div>
    </section>`;
  }

  // クリップボードAPIが使えない環境では、本文を選択状態にして手動コピーを案内する
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).then(() => true, () => false);
    }
    return Promise.resolve(false);
  }

  function selectText(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function onCopy(btn) {
    const target = document.getElementById(btn.dataset.copyTarget);
    const fallback = btn.parentElement.querySelector(".prompt__fallback");
    copyText(target.textContent).then((ok) => {
      if (!ok) {
        selectText(target);
        fallback.hidden = false;
        return;
      }
      fallback.hidden = true;
      btn.classList.add("is-copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => btn.classList.remove("is-copied"), 2200);
    });
  }

  function onScroll(e, link) {
    const dest = document.querySelector(link.getAttribute("href"));
    if (!dest) return;
    e.preventDefault();
    dest.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  function bind() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".copy-btn[data-copy-target]");
      if (btn) return onCopy(btn);
      const link = e.target.closest("a[data-scroll]");
      if (link) onScroll(e, link);
    });
  }

  function init() {
    const main = document.getElementById("main");
    if (typeof CONTENT === "undefined") return;
    const c = CONTENT;
    applyMeta(c.meta);
    main.innerHTML =
      hero(c.hero) +
      topCta(c.topCta, c.lineUrl) +
      features(c.features) +
      flow(c.flow) +
      toc(c.toc) +
      `<div class="basic-zone">${c.cards.map(card).join("")}</div>` +
      rules(c.rules) +
      summary(c.summary) +
      finalCta(c.finalCta, c.textbook, c.lineUrl);
    document.getElementById("footer").innerHTML = `<p>${c.footer.copyright}</p><p>${c.footer.notice}</p>`;
    bind();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
