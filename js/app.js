/* Labour of Love — interactions
   Data: data/plants.json, scraped from the nursery's own catalogue. */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- masthead ---------- */
const mast = $('#mast');
addEventListener('scroll', () => mast.classList.toggle('is-stuck', scrollY > 24), { passive: true });

/* ---------- mobile nav ---------- */
const navBtn = $('#navToggle'), navPanel = $('#navPanel');
const setNav = open => {
  navPanel.dataset.open = open;
  navBtn.setAttribute('aria-expanded', open);
  navBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navBtn.innerHTML = open
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 6l12 12M18 6l-12 12"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
};
navBtn.addEventListener('click', () => setNav(navPanel.dataset.open !== 'true'));
$$('#navPanel a').forEach(a => a.addEventListener('click', () => setNav(false)));
addEventListener('keydown', e => { if (e.key === 'Escape' && navPanel.dataset.open === 'true') { setNav(false); navBtn.focus(); } });

/* ---------- reveal ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    e.target.style.animationDelay = `${Math.min(i * 70, 280)}ms`;
    e.target.classList.add('rise-in');
    io.unobserve(e.target);
  });
}, { rootMargin: '0px 0px -12% 0px', threshold: .1 });
const rises = $$('[data-rise]');
rises.forEach(el => reduced ? el.classList.add('rise-in') : io.observe(el));
// Safety net: never let content stay invisible because an observer didn't fire.
setTimeout(() => rises.forEach(el => el.classList.add('rise-in')), 2500);
addEventListener('visibilitychange', () => {
  if (!document.hidden) rises.forEach(el => {
    const r = el.getBoundingClientRect();
    if (r.top < innerHeight) el.classList.add('rise-in');
  });
});

/* ============================================================
   THE GROUNDS — eight stops
   ============================================================ */
const STOPS = [
  { n:'The sign at the road',      x:112, y:104, img:'assets/photos/tourthegrounds.jpg',
    t:'Hand-painted, and repainted: perennial flowers and bulbs, installation and maintenance — and, underneath, Kate Butler, handweaver, fine woollens and more. Two trades on one signpost.' },
  { n:'The Greek Revival house',   x:348, y:150, img:'assets/photos/LabourOfLoveFooter.jpg',
    t:'An 1800s Greek Revival, restored room by room. Inside: the antiques, craft and gift shop, and three guest rooms full of tropical plants that have no business being this far north.' },
  { n:'The display gardens',       x:170, y:250, img:'assets/plants/aconitum-carmichaelii.jpeg',
    t:'Not a sales yard — a garden. Alpine miniatures at your feet, background giants behind them, and the whole point being to show you what a Zone-3 border can actually look like in August.' },
  { n:'The long border',           x:392, y:300, img:'assets/plants/aster-novi-angliae.jpeg',
    t:'English cottage planting on one side, formal display on the other. The same plants, arranged two ways, so you can see which argument you find more persuasive.' },
  { n:'The nursery rows',          x:668, y:152, img:'assets/plants/asclepias-tuberosa.jpeg',
    t:'Field-grown or potted, your choice. Everything here was raised from seed or by division on this ground — which is why it survives the winter after you take it home.' },
  { n:'The rock garden',           x:560, y:238, img:'assets/plants/arabis-albida.jpeg',
    t:'Where the oddball stuff lives. Alpines, creepers, and a running experiment in what is genuinely not supposed to do well up here.' },
  { n:'The picnic tables',         x:258, y:372, img:'assets/photos/tourthegrounds2.jpg',
    t:'Among the flowers and along the water. Bring lunch, stay the afternoon; nobody will hurry you toward the till.' },
  { n:"The river's edge",          x:520, y:392, img:'assets/photos/tourthegrounds2.jpg',
    t:'The Barton River runs the length of the property. Moisture-lovers get the bank, and the sound of it carries right up into the gardens.' },
];

const svgNS = 'http://www.w3.org/2000/svg';
const hostG = $('#hotspots');
if (hostG) STOPS.forEach((s, i) => {
  const g = document.createElementNS(svgNS, 'g');
  g.setAttribute('class', 'hotspot');
  g.setAttribute('tabindex', '0');
  g.setAttribute('role', 'button');
  g.setAttribute('aria-label', `Stop ${i + 1}: ${s.n}`);
  g.innerHTML =
    `<circle class="halo" cx="${s.x}" cy="${s.y}" r="10"></circle>
     <circle class="dot" cx="${s.x}" cy="${s.y}" r="6"></circle>
     <text x="${s.x + 12}" y="${s.y + 3}">${String(i + 1).padStart(2, '0')} ${s.n}</text>`;
  const go = () => setStop(i);
  g.addEventListener('click', go);
  g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
  hostG.appendChild(g);
});

let stopI = 0, timer = null;
const stopEls = { img:$('#stopImg'), title:$('#stopTitle'), text:$('#stopText'), kick:$('#stopKicker'), num:$('#stopNum') };
const playBtn = $('#stopPlay');

function setStop(i) {
  if (!stopEls.title) return;
  stopI = (i + STOPS.length) % STOPS.length;
  const s = STOPS[stopI];
  const card = $('.stopcard');
  card.style.opacity = '0';
  setTimeout(() => {
    stopEls.img.src = s.img;
    stopEls.img.alt = s.n;
    stopEls.title.textContent = s.n;
    stopEls.text.textContent = s.t;
    stopEls.kick.textContent = `Stop ${String(stopI + 1).padStart(2, '0')}`;
    stopEls.num.textContent = String(stopI + 1).padStart(2, '0');
    card.style.opacity = '1';
  }, reduced ? 0 : 180);
  $$('.hotspot').forEach((el, j) => el.setAttribute('aria-current', j === stopI));

  // Wash in the bed belonging to this stop and mute the rest.
  const map = $('.tour__map');
  if (map) {
    map.dataset.picked = 'true';
    $$('[data-bed]', map).forEach(b => b.classList.toggle('is-active', +b.dataset.bed === stopI + 1));
  }
}
function stopAuto() {
  clearInterval(timer); timer = null;
  if (!playBtn) return;
  playBtn.setAttribute('aria-pressed', 'false');
  playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4l14 8-14 8z"/></svg>';
}
if (hostG) {
  $('.stopcard').style.transition = 'opacity .38s cubic-bezier(.16,1,.3,1)';
  $('#stopNext').addEventListener('click', () => { stopAuto(); setStop(stopI + 1); });
  $('#stopPrev').addEventListener('click', () => { stopAuto(); setStop(stopI - 1); });
  playBtn.addEventListener('click', () => {
    if (timer) return stopAuto();
    timer = setInterval(() => setStop(stopI + 1), 4200);
    playBtn.setAttribute('aria-pressed', 'true');
    playBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 4v16M17 4v16"/></svg>';
  });
  setStop(0);
  const mapEl = $('.tour__map');
  if (mapEl) {
    if (reduced) mapEl.classList.add('is-drawn');
    else new IntersectionObserver(([e], ob) => {
      if (!e.isIntersecting) return;
      mapEl.classList.add('is-drawn'); ob.disconnect();
    }, { threshold: .15 }).observe(mapEl);
  }
}

/* ============================================================
   DATA-DRIVEN: succession + catalogue
   ============================================================ */
const COLOR_HEX = {
  white:'#FBFAF4', yellow:'#D8A521', blue:'#2B4E8C', pink:'#C77489',
  red:'#A21D1B', purple:'#6B4E8C', orange:'#C2701C'
};

const MONTHS = [
  { key:'spring',      label:'May',       note:'Bulbs and the alpine things — arabis, aubretia, the early crocus. The garden is mostly promise and low colour close to the ground.' },
  { key:'spring',      label:'June',      note:'The month everything wants to be. Columbine, iris, peonies leaning over after rain; the borders fill in almost faster than you can weed them.' },
  { key:'summer',      label:'July',      note:'Full height. Delphinium and campanula carry the back of the border while the daylilies take over the middle.' },
  { key:'summer',      label:'August',    note:'Phlox, monarda, milkweed for the monarchs. The heat-lovers finally get their fortnight, and the bees are loud about it.' },
  { key:'late season', label:'September', note:'Asters and monkshood — the blues arrive exactly when you need them. This is the month Zone 3 stops apologising.' },
  { key:'late season', label:'October',   note:'Seedheads, late aster, and the first frost on the rock garden. Foliage does the work now; the river gets loud again.' },
];

let PLANTS = [];
const state = { q:'', filters:new Set(), shown:24 };

const needsData = $('#catGrid') || $('#bloomGrid');
if (needsData) {
  fetch('data/plants.json')
    .then(r => r.json())
    .then(data => { PLANTS = data; boot(); })
    .catch(() => {
      if ($('#catGrid')) $('#catGrid').innerHTML =
        '<div class="cat__empty" style="grid-column:1/-1">The catalogue could not be loaded. Serve this folder over http rather than opening the file directly.</div>';
    });
}

function boot() {
  if ($('#catTotal')) $('#catTotal').textContent = PLANTS.length;
  if ($('#seasonTicks')) { buildTicks(); renderSeason(0); }
  if ($('#catFilters')) { buildFilters(); renderCat(); }
}

/* ---------- succession ---------- */
function buildTicks() {
  if (!$('#seasonTicks')) return;
  $('#seasonTicks').innerHTML = MONTHS
    .map((m, i) => `<span data-i="${i}" ${i === 0 ? 'aria-current="true"' : ''}>${m.label.slice(0,3)}</span>`).join('');
  $$('#seasonTicks span').forEach(s =>
    s.addEventListener('click', () => { $('#seasonRange').value = s.dataset.i; renderSeason(+s.dataset.i); }));
}
if ($('#seasonRange')) $('#seasonRange').addEventListener('input', e => renderSeason(+e.target.value));

function renderSeason(i) {
  if (!$('#seasonMonth')) return;
  const m = MONTHS[i];
  $('#seasonMonth').textContent = m.label;
  $('#seasonNote').textContent = m.note;
  $$('#seasonTicks span').forEach((s, j) => s.setAttribute('aria-current', j === i));

  const inSeason = PLANTS.filter(p => p.seasons.includes(m.key));
  $('#seasonCount').textContent = inSeason.length;

  const withPhoto = inSeason.filter(p => p.photo);
  const pool = (withPhoto.length >= 8 ? withPhoto : PLANTS.filter(p => p.photo)).slice(0, 12);
  $('#bloomGrid').innerHTML = pool.map(p => `
    <figure>
      <img src="${localPhoto(p)}" alt="${p.name}" loading="lazy" decoding="async">
      <figcaption>${p.name}</figcaption>
    </figure>`).join('');
}

const localPhoto = p => 'assets/plants/' + p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '.jpeg';

/* ---------- catalogue ---------- */
const FILTERS = [
  { id:'photo',   label:'With photograph', fn:p => !!p.photo },
  { id:'shade',   label:'For shade',       fn:p => p.light.includes('shade') },
  { id:'sun',     label:'For sun',         fn:p => p.light.includes('sun') },
  { id:'fragrant',label:'Fragrant',        fn:p => p.traits.includes('fragrant') },
  { id:'pollinator',label:'Pollinators',   fn:p => p.traits.includes('pollinator') },
  { id:'native',  label:'Native',          fn:p => p.traits.includes('native') },
  { id:'rock',    label:'Rock garden',     fn:p => p.traits.includes('rock garden') },
];

function buildFilters() {
  if (!$('#catFilters')) return;
  $('#catFilters').innerHTML = FILTERS
    .map(f => `<button class="chip" data-f="${f.id}" aria-pressed="false">${f.label}</button>`).join('');
  $$('#catFilters .chip').forEach(b => b.addEventListener('click', () => {
    const id = b.dataset.f;
    state.filters.has(id) ? state.filters.delete(id) : state.filters.add(id);
    b.setAttribute('aria-pressed', state.filters.has(id));
    state.shown = 24; renderCat();
  }));
}

if ($('#catSearch')) $('#catSearch').addEventListener('input', e => { state.q = e.target.value.toLowerCase().trim(); state.shown = 24; renderCat(); });
if ($('#catMore')) $('#catMore').addEventListener('click', () => { state.shown += 36; renderCat(); });

function matches(p) {
  if (state.q && !(p.name.toLowerCase().includes(state.q) || p.desc.toLowerCase().includes(state.q))) return false;
  for (const id of state.filters) {
    const f = FILTERS.find(x => x.id === id);
    if (f && !f.fn(p)) return false;
  }
  return true;
}

function renderCat() {
  if (!$('#catGrid')) return;
  const hits = PLANTS.filter(matches);
  const slice = hits.slice(0, state.shown);
  $('#catEmpty').hidden = hits.length !== 0;
  $('#catMore').style.display = state.shown >= hits.length ? 'none' : '';
  $('#catMore').textContent = `Show more — ${hits.length - state.shown} remaining`;

  $('#catGrid').innerHTML = slice.map(p => `
    <article class="plant">
      ${p.photo ? `<div class="plant__img"><img src="${localPhoto(p)}" alt="${p.name}" loading="lazy" decoding="async"></div>` : ''}
      <h3 class="plant__name">${p.name}</h3>
      <p class="plant__desc">${p.desc}</p>
      <div class="plant__tags">
        ${p.colors.slice(0,4).map(c => `<span class="tag"><span class="swatch" style="background:${COLOR_HEX[c] || '#ccc'}"></span> ${c}</span>`).join('')}
        ${p.traits.slice(0,2).map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
    </article>`).join('');
}


/* ============================================================
   HERO — entrance, drift, and a slow sway
   ============================================================ */
(() => {
  const art  = $('.hero__art');
  const copy = $('.hero__copy');
  if (!art && !copy) return;

  // Split the headline into per-word masks, leaving <em>, <br> and spans intact.
  const splitWords = (root) => {
    [...root.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        if (!n.textContent.trim()) return;
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(tok => {
          if (!tok) return;
          if (!tok.trim()) { frag.appendChild(document.createTextNode(tok)); return; }
          const outer = document.createElement('span'); outer.className = 'w';
          const inner = document.createElement('span'); inner.className = 'wi';
          inner.textContent = tok;
          outer.appendChild(inner); frag.appendChild(outer);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') {
        splitWords(n);
      }
    });
  };

  const title = $('.hero__title');
  if (title && !reduced) {
    splitWords(title);
    $$('.wi', title).forEach((el, i) => el.style.setProperty('--i', i));
  }

  // Fire the entrance once the plate is decoded, so nothing pops in half-drawn.
  const start = () => {
    title && title.classList.add('reveal-ready');
    copy  && copy.classList.add('reveal-ready');
    art   && art.classList.add('reveal-ready');
  };
  const img = $('.hero__art img');
  if (img && !img.complete) {
    img.addEventListener('load', start, { once: true });
    img.addEventListener('error', start, { once: true });
    setTimeout(start, 1800);              // never wait on a stalled image
  } else {
    requestAnimationFrame(() => requestAnimationFrame(start));
  }

  if (reduced) return;

  // Scroll parallax only. The pointer deliberately does not move the plate —
  // the wind shader owns its motion, and cursor-driven drift fought with it.
  const drift = $('.hero__drift');
  if (!drift) return;
  let sy = 0, ticking = false;

  const apply = () => {
    ticking = false;
    drift.style.transform = `translate3d(0, ${sy.toFixed(2)}px, 0)`;
  };

  addEventListener('scroll', () => {
    const r = art.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;   // offscreen: don't compute
    sy = -scrollY * 0.075;
    if (!ticking) { ticking = true; requestAnimationFrame(apply); }
  }, { passive: true });
})();
