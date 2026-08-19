/* Admin app. Talks only to Store, so the Supabase swap touches nothing here. */
import { Store } from './store.js';

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

const ICON = {
  edit:'<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  del :'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  up  :'<path d="M12 19V5M6 11l6-6 6 6"/>',
  down:'<path d="M12 5v14M6 13l6 6 6-6"/>',
};
const icon = (k, cls = 'iconbtn', label = '') =>
  `<button class="${cls}" data-act="${k}" aria-label="${label}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">${ICON[k]}</svg></button>`;

let toastTimer;
const toast = msg => {
  const t = $('#toast');
  t.textContent = msg; t.dataset.show = 'true';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.dataset.show = 'false'), 2400);
};

/* ---------------- field definitions per collection ---------------- */
const COLOURS = ['white','yellow','blue','pink','red','purple','orange'];
const TRAITS  = ['fragrant','native','rock garden','pollinator','edible','naturalizes','groundcover','moisture-loving','drought-tolerant'];
const LIGHT   = ['sun','shade'];
const SEASONS = ['spring','summer','late season'];

const VIEWS = {
  overview: { label:'Overview', title:'Overview',
    hint:'Everything Kate can change lives here. Edits save to this browser as you go — use Publish to hand the updated files to the site.' },

  plants: { label:'Plants', title:'The catalogue', singular:'plant',
    hint:'Every variety in the plant search. Descriptions appear on the site exactly as written here.',
    cols:[
      {k:'photo', h:'', render:r => r.photo ? `<img class="thumb" src="${esc(localPhoto(r))}" alt="" loading="lazy">` : '<span class="muted">—</span>'},
      {k:'name',  h:'Name', render:r => `<span class="nm">${esc(r.name)}</span>`},
      {k:'desc',  h:'Description', render:r => `<span class="muted">${esc((r.desc||'').slice(0,110))}${(r.desc||'').length>110?'…':''}</span>`},
      {k:'traits',h:'Tags', render:r => `<span class="muted">${esc([...(r.colors||[]),...(r.traits||[])].slice(0,3).join(', ')||'—')}</span>`},
    ],
    search:(r,q) => (r.name+' '+r.desc).toLowerCase().includes(q),
    fields:[
      {k:'name', label:'Botanical name', type:'text', required:true, note:'Shown in italic, as botanical convention wants.'},
      {k:'desc', label:'Description', type:'textarea'},
      {k:'colors', label:'Flower colour', type:'chips', options:COLOURS},
      {k:'light',  label:'Light',        type:'chips', options:LIGHT},
      {k:'seasons',label:'Season',       type:'chips', options:SEASONS},
      {k:'traits', label:'Traits',       type:'chips', options:TRAITS},
      {k:'photo',  label:'Photo path', type:'text', note:'e.g. assets/plants/aster-novi-angliae.jpeg — leave blank if there is no photograph yet.'},
    ],
    blank:() => ({name:'', desc:'', colors:[], light:[], seasons:[], traits:[], photo:''}),
  },

  stops: { label:'Tour stops', title:'The grounds tour', singular:'stop', ordered:true,
    hint:'The eight numbered markers on the illustrated plan. X and Y place the marker on the map (0–800 across, 0–520 down).',
    cols:[
      {k:'img', h:'', render:r => `<img class="thumb" src="${esc(r.img)}" alt="" loading="lazy">`},
      {k:'n', h:'Stop', render:r => `<b>${esc(r.n)}</b>`},
      {k:'t', h:'Text', render:r => `<span class="muted">${esc((r.t||'').slice(0,90))}…</span>`},
      {k:'xy', h:'Position', render:r => `<span class="muted">${r.x}, ${r.y}</span>`},
    ],
    search:(r,q) => (r.n+' '+r.t).toLowerCase().includes(q),
    fields:[
      {k:'n', label:'Stop name', type:'text', required:true},
      {k:'t', label:'What to say about it', type:'textarea'},
      {k:'img', label:'Photograph', type:'text'},
      {k:'x', label:'Map X (0–800)', type:'number', half:true},
      {k:'y', label:'Map Y (0–520)', type:'number', half:true},
      {k:'bed', label:'Highlights bed number', type:'number', note:'Which shape on the plan lights up. Leave blank for none.'},
    ],
    blank:() => ({n:'', t:'', img:'assets/photos/tourthegrounds.jpg', x:400, y:260, bed:''}),
  },

  rooms: { label:'Guest rooms', title:'Guest rooms', singular:'room', ordered:true,
    hint:'The three themed rooms on the Stay page.',
    cols:[
      {k:'numeral', h:'№', render:r => `<b>${esc(r.numeral)}</b>`},
      {k:'name', h:'Room', render:r => esc(r.name)},
      {k:'desc', h:'Description', render:r => `<span class="muted">${esc((r.desc||'').slice(0,90))}…</span>`},
      {k:'sleeps', h:'Sleeps', render:r => `<span class="muted">${esc(r.sleeps)} · ${esc(r.beds)}</span>`},
    ],
    search:(r,q) => (r.name+' '+r.desc).toLowerCase().includes(q),
    fields:[
      {k:'numeral', label:'Numeral', type:'text', half:true},
      {k:'name', label:'Room name', type:'text', required:true, half:true},
      {k:'desc', label:'Description', type:'textarea'},
      {k:'sleeps', label:'Sleeps', type:'text', half:true},
      {k:'beds', label:'Beds', type:'text', half:true},
    ],
    blank:() => ({numeral:'', name:'', desc:'', sleeps:'', beds:''}),
  },

  testimonials: { label:'Testimonials', title:'Testimonials', singular:'testimonial', ordered:true,
    hint:'Quotes on the Testimonials page. The emphasised line is pulled out in lighter type — it must appear word-for-word inside the quote.',
    cols:[
      {k:'who', h:'Who', render:r => `<b>${esc(r.who)}</b>`},
      {k:'role', h:'Role', render:r => `<span class="muted">${esc(String(r.role||'').replace(/<br>/g,' · '))}</span>`},
      {k:'quote', h:'Quote', render:r => `<span class="muted">${esc((r.quote||'').slice(0,80))}…</span>`},
    ],
    search:(r,q) => (r.who+' '+r.quote).toLowerCase().includes(q),
    fields:[
      {k:'quote', label:'Quote', type:'textarea', required:true},
      {k:'emphasis', label:'Emphasised line', type:'textarea', note:'Must match text inside the quote exactly, or nothing is emphasised.'},
      {k:'who', label:'Name', type:'text', half:true},
      {k:'role', label:'Role', type:'text', half:true},
    ],
    blank:() => ({quote:'', emphasis:'', who:'', role:''}),
  },

  services: { label:'Services', title:'Landscaping services', singular:'service', ordered:true,
    hint:'The numbered list on the Landscaping page.',
    cols:[
      {k:'n', h:'№', render:r => `<b>${esc(r.n)}</b>`},
      {k:'name', h:'Service', render:r => esc(r.name)},
      {k:'desc', h:'Description', render:r => `<span class="muted">${esc((r.desc||'').slice(0,100))}…</span>`},
    ],
    search:(r,q) => (r.name+' '+r.desc).toLowerCase().includes(q),
    fields:[
      {k:'n', label:'Number', type:'text', half:true},
      {k:'name', label:'Service', type:'text', required:true, half:true},
      {k:'desc', label:'Description', type:'textarea'},
    ],
    blank:() => ({n:'', name:'', desc:''}),
  },

  settings: { label:'Hours & contact', title:'Hours, contact and rates', singleton:true,
    hint:'Appears in the footer of every page and on the Visit page.',
    fields:[
      {k:'phone', label:'Telephone', type:'text', half:true},
      {k:'phone_href', label:'Telephone link', type:'text', half:true, note:'Digits only, e.g. +18025256695'},
      {k:'email', label:'Email', type:'text'},
      {k:'street', label:'Street', type:'text', half:true},
      {k:'town', label:'Town', type:'text', half:true},
      {k:'hours_gardens', label:'Gardens', type:'text'},
      {k:'hours_shop', label:'Shop & house', type:'text', half:true},
      {k:'hours_shop_note', label:'Shop note', type:'text', half:true},
      {k:'hours_rooms', label:'Guest rooms', type:'text'},
      {k:'rate_single', label:'Nightly rate', type:'text', half:true},
      {k:'rate_family', label:'Family rate', type:'text', half:true},
      {k:'also_here', label:'Also here', type:'textarea', note:'One item per line.'},
      {k:'hero_title', label:'Home headline', type:'textarea'},
      {k:'hero_lede', label:'Home intro', type:'textarea'},
    ],
  },

  publish: { label:'Publish', title:'Publish changes', hint:'' },
};

const localPhoto = p => p.photo
  ? 'assets/plants/' + p.name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '.jpeg'
  : '';

/* ---------------- state ---------------- */
let current = 'overview';
let query = '';
let shown = 40;
let editing = null;

/* ---------------- nav ---------------- */
async function buildNav() {
  const counts = {};
  for (const c of Store.collections) {
    if (c === 'settings') continue;
    counts[c] = (await Store.all(c)).length;
  }
  $('#nav').innerHTML = Object.entries(VIEWS).map(([k, v]) =>
    `<button data-view="${k}" aria-current="${k === current}">
       <span>${v.label}</span>${counts[k] != null ? `<span class="adm__count">${counts[k]}</span>` : ''}
     </button>`).join('');
  $$('#nav button').forEach(b => b.addEventListener('click', () => go(b.dataset.view)));
  $('#driverName').textContent = Store.driverName;
}

function go(view) {
  current = view; query = ''; shown = 40;
  $$('#nav button').forEach(b => b.setAttribute('aria-current', b.dataset.view === view));
  render();
}

/* ---------------- render ---------------- */
async function render() {
  const v = VIEWS[current];
  $('#viewTitle').textContent = v.title;
  $('#viewHint').textContent = v.hint || '';
  $('#viewActions').innerHTML = '';

  if (current === 'overview')  return renderOverview();
  if (current === 'publish')   return renderPublish();
  if (v.singleton)             return renderSingleton();
  return renderList();
}

async function renderOverview() {
  const counts = {};
  for (const c of Store.collections) {
    if (c === 'settings') continue;
    counts[c] = (await Store.all(c)).length;
  }
  const withPhoto = (await Store.all('plants')).filter(p => p.photo).length;
  $('#view').innerHTML = `
    <div class="cards">
      <div class="card"><b>${counts.plants}</b><span>Plants in the catalogue</span></div>
      <div class="card"><b>${withPhoto}</b><span>With a photograph</span></div>
      <div class="card"><b>${counts.stops}</b><span>Tour stops</span></div>
      <div class="card"><b>${counts.rooms}</b><span>Guest rooms</span></div>
      <div class="card"><b>${counts.testimonials}</b><span>Testimonials</span></div>
      <div class="card"><b>${counts.services}</b><span>Services</span></div>
    </div>

    <div class="panel">
      <h2>Where to start</h2>
      <p><b>Plants</b> is the big one — add a variety, write its description in your own words,
      tick its colour and habit, and it appears in the plant search straight away.
      <b>Tour stops</b> moves the markers on the illustrated plan.
      <b>Hours &amp; contact</b> changes the footer on every page at once.</p>
    </div>

    <div class="panel panel--warn">
      <h2>About saving</h2>
      <p>Right now edits are kept in this browser only — they are not on the live site
      and nobody else can see them. Open <b>Publish</b> to download the updated files.
      Once the Supabase database is connected, saving here will change the live site directly,
      and this note goes away.</p>
    </div>`;
}

async function renderList() {
  const v = VIEWS[current];
  const rows = await Store.all(current);
  const q = query.toLowerCase().trim();
  const hits = q ? rows.filter(r => v.search(r, q)) : rows;
  const page = hits.slice(0, shown);

  $('#viewActions').innerHTML =
    `<button class="btn btn--sm btn--fill" id="addNew">Add ${v.singular}</button>`;
  $('#addNew').addEventListener('click', () => openDrawer(null));

  $('#view').innerHTML = `
    <div class="adm__bar">
      <div class="searchbox">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
        <input type="search" id="q" placeholder="Search ${v.label.toLowerCase()}…" value="${esc(query)}" aria-label="Search">
      </div>
    </div>
    <div class="adm__wrap">
      <table class="tbl">
        <thead><tr>${v.cols.map(c => `<th>${c.h}</th>`).join('')}<th></th></tr></thead>
        <tbody>${page.map((r, i) => `
          <tr data-id="${r.id}">
            ${v.cols.map(c => `<td>${c.render(r)}</td>`).join('')}
            <td><div class="tbl__acts">
              ${v.ordered ? icon('up','iconbtn','Move up') + icon('down','iconbtn','Move down') : ''}
              ${icon('edit','iconbtn','Edit')}
              ${icon('del','iconbtn iconbtn--bad','Delete')}
            </div></td>
          </tr>`).join('') || `<tr><td colspan="${v.cols.length+1}"><div class="empty">Nothing here yet.</div></td></tr>`}
        </tbody>
      </table>
    </div>
    <div class="adm__foot">
      <span>Showing ${page.length} of ${hits.length}${q ? ` matching “${esc(query)}”` : ''}</span>
      ${shown < hits.length ? '<button class="btn btn--sm" id="more">Show more</button>' : ''}
    </div>`;

  $('#q').addEventListener('input', e => { query = e.target.value; shown = 40; renderList(); });
  $('#more')?.addEventListener('click', () => { shown += 60; renderList(); });

  $$('#view tbody tr').forEach(tr => {
    const id = tr.dataset.id;
    tr.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', async () => {
      const act = b.dataset.act;
      if (act === 'edit') return openDrawer(id);
      if (act === 'del') {
        const rec = (await Store.all(current)).find(r => r.id === id);
        if (!confirm(`Delete “${rec.name || rec.n || rec.who}”? This cannot be undone.`)) return;
        await Store.remove(current, id); toast('Deleted'); buildNav(); renderList();
      }
      if (act === 'up' || act === 'down') {
        await Store.move(current, id, act === 'up' ? -1 : 1); renderList();
      }
    }));
  });
}

async function renderSingleton() {
  const v = VIEWS[current];
  const data = await Store.all(current);
  $('#view').innerHTML = `<div class="panel"><form id="setForm" style="display:grid;gap:1rem">
      ${v.fields.map(f => field(f, data[f.k])).join('')}
      <div><button class="btn btn--sm btn--fill" type="button" id="saveSet">Save</button></div>
    </form></div>`;
  $('#saveSet').addEventListener('click', async () => {
    const out = {};
    v.fields.forEach(f => out[f.k] = $(`#f_${f.k}`).value);
    await Store.save(current, out);
    toast('Saved');
  });
}

/* ---------------- fields ---------------- */
function field(f, value) {
  const id = `f_${f.k}`;
  const wrap = s => `<div class="f"${f.half ? ' data-half="1"' : ''}>${s}${f.note ? `<span class="f__note">${esc(f.note)}</span>` : ''}</div>`;
  if (f.type === 'textarea')
    return wrap(`<label for="${id}">${esc(f.label)}</label><textarea id="${id}">${esc(value ?? '')}</textarea>`);
  if (f.type === 'chips')
    return wrap(`<label>${esc(f.label)}</label><div class="chips" id="${id}">${
      f.options.map(o => `<label><input type="checkbox" value="${esc(o)}"${(value||[]).includes(o)?' checked':''}>${esc(o)}</label>`).join('')}</div>`);
  return wrap(`<label for="${id}">${esc(f.label)}</label><input id="${id}" type="${f.type}" value="${esc(value ?? '')}"${f.required?' required':''}>`);
}

function readField(f) {
  const el = $(`#f_${f.k}`);
  if (f.type === 'chips') return $$('input:checked', el).map(i => i.value);
  if (f.type === 'number') return el.value === '' ? '' : Number(el.value);
  return el.value;
}

/* ---------------- drawer ---------------- */
async function openDrawer(id) {
  const v = VIEWS[current];
  const rows = await Store.all(current);
  editing = id ? rows.find(r => r.id === id) : v.blank();
  $('#drawerTitle').textContent = id ? `Edit ${v.singular}` : `New ${v.singular}`;
  $('#drawerBody').innerHTML = v.fields.map(f => field(f, editing[f.k])).join('');
  // pair up half-width fields
  $$('#drawerBody .f[data-half]').forEach((el, i, arr) => {
    if (i % 2 === 0 && arr[i+1]) {
      const row = document.createElement('div'); row.className = 'f__row';
      el.replaceWith(row); row.append(el, arr[i+1]);
    }
  });
  setDrawer(true);
  $('#drawerBody').querySelector('input,textarea')?.focus();
}

function setDrawer(open) {
  $('#drawer').dataset.open = open;
  $('#scrim').dataset.open = open;
  if (!open) editing = null;
}

$('#drawerSave').addEventListener('click', async () => {
  const v = VIEWS[current];
  const rec = { ...editing };
  for (const f of v.fields) {
    rec[f.k] = readField(f);
    if (f.required && !String(rec[f.k]).trim()) { toast(`${f.label} is required`); return; }
  }
  await Store.save(current, rec);
  setDrawer(false); toast('Saved'); buildNav(); renderList();
});
$('#drawerCancel').addEventListener('click', () => setDrawer(false));
$('#drawerClose').addEventListener('click', () => setDrawer(false));
$('#scrim').addEventListener('click', () => setDrawer(false));
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#drawer').dataset.open === 'true') setDrawer(false); });

/* ---------------- publish ---------------- */
async function renderPublish() {
  const snap = await Store.snapshot();
  $('#view').innerHTML = `
    <div class="panel">
      <h2>Download the updated files</h2>
      <p>Each file below replaces the one of the same name in the site's <code>data</code> folder.
      Download the ones you changed and send them on, or drop them straight into the repository.</p>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:1rem">
        ${Store.collections.map(c => `<button class="btn btn--sm" data-dl="${c}">${c}.json</button>`).join('')}
        <button class="btn btn--sm btn--fill" data-dl="__all">Everything (backup)</button>
      </div>
    </div>

    <div class="panel">
      <h2>Restore from a file</h2>
      <p>Load a previously downloaded backup. This replaces what is currently in this browser.</p>
      <input type="file" id="importFile" accept="application/json" style="margin-top:.75rem">
    </div>

    <div class="panel panel--warn">
      <h2>Start over</h2>
      <p>Throws away every change made in this browser and reloads the files the site shipped with.</p>
      <button class="btn btn--sm btn--danger" id="resetAll" style="margin-top:.75rem">Discard my changes</button>
    </div>`;

  $$('[data-dl]').forEach(b => b.addEventListener('click', () => {
    const c = b.dataset.dl;
    const payload = c === '__all' ? snap : snap[c];
    download(c === '__all' ? 'labour-of-love-backup.json' : `${c}.json`, JSON.stringify(payload, null, 1));
  }));

  $('#importFile').addEventListener('change', async e => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const keys = Object.keys(data).filter(k => Store.collections.includes(k));
      if (!keys.length) return toast('That file has nothing recognisable in it');
      for (const k of keys) await Store.replace(k, data[k]);
      toast(`Restored ${keys.length} section${keys.length>1?'s':''}`); buildNav(); render();
    } catch { toast('Could not read that file'); }
  });

  $('#resetAll').addEventListener('click', async () => {
    if (!confirm('Discard every change made in this browser?')) return;
    for (const c of Store.collections) await Store.reset(c);
    toast('Back to the shipped files'); buildNav(); render();
  });
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type:'application/json' }));
  const a = document.createElement('a');
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  a.remove(); URL.revokeObjectURL(url);
}

/* ---------------- boot ---------------- */
buildNav().then(render).catch(err => {
  $('#view').innerHTML = `<div class="panel panel--warn"><h2>Could not load the data</h2>
    <p>${esc(err.message)}. This page needs to be served over http — opening the file directly will not work.</p></div>`;
});
