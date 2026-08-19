/* Data layer for the admin.

   One interface, two drivers. Today everything runs through `localDriver`, which
   seeds from the JSON files in /data and keeps edits in localStorage. When the
   Supabase project exists, fill in `supabaseDriver` and flip DRIVER — nothing in
   admin.js changes, because it only ever talks to `Store`.

   Collections: plants, stops, rooms, testimonials, services, settings
*/

const SEEDS = {
  plants:       'data/plants.json',
  stops:        'data/stops.json',
  rooms:        'data/rooms.json',
  testimonials: 'data/testimonials.json',
  services:     'data/services.json',
  settings:     'data/settings.json',
};

const KEY = c => `lol.${c}`;
const isSingleton = c => c === 'settings';

const uid = () =>
  'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/* ---------- driver: browser storage (current) ---------- */
const localDriver = {
  async load(collection) {
    const cached = localStorage.getItem(KEY(collection));
    if (cached) {
      try { return JSON.parse(cached); } catch { /* fall through to seed */ }
    }
    const res = await fetch(SEEDS[collection]);
    if (!res.ok) throw new Error(`Could not load ${SEEDS[collection]}`);
    const seed = await res.json();
    localStorage.setItem(KEY(collection), JSON.stringify(seed));
    return seed;
  },
  async persist(collection, value) {
    localStorage.setItem(KEY(collection), JSON.stringify(value));
    return value;
  },
  async reset(collection) {
    localStorage.removeItem(KEY(collection));
    return this.load(collection);
  },
};

/* ---------- driver: Supabase (when the project is ready) ----------
   Create one table per collection with a jsonb `data` column, or real columns
   per field — either works. Then:

     import { createClient } from '@supabase/supabase-js';
     const sb = createClient(URL, ANON_KEY);

     const supabaseDriver = {
       async load(c)          { const {data,error} = await sb.from(c).select('*');
                                if (error) throw error; return data; },
       async persist(c, rows) { const {error} = await sb.from(c).upsert(rows);
                                if (error) throw error; return rows; },
       async reset(c)         { return this.load(c); },
     };

   Set DRIVER = supabaseDriver. Nothing else in the admin needs to change.
   Writes must be behind row-level security + an authenticated role — see the
   note at the top of admin.html.
------------------------------------------------------------------ */

const DRIVER = localDriver;

const cache = new Map();

export const Store = {
  driverName: DRIVER === localDriver ? 'Browser storage' : 'Supabase',

  async all(collection) {
    if (!cache.has(collection)) cache.set(collection, await DRIVER.load(collection));
    return cache.get(collection);
  },

  async save(collection, record) {
    const rows = await this.all(collection);
    if (isSingleton(collection)) {
      const merged = { ...rows, ...record };
      cache.set(collection, merged);
      return DRIVER.persist(collection, merged);
    }
    if (!record.id) {
      record.id = uid();
      rows.unshift(record);
    } else {
      const i = rows.findIndex(r => r.id === record.id);
      i === -1 ? rows.unshift(record) : (rows[i] = { ...rows[i], ...record });
    }
    return DRIVER.persist(collection, rows);
  },

  async remove(collection, id) {
    const rows = await this.all(collection);
    const next = rows.filter(r => r.id !== id);
    cache.set(collection, next);
    return DRIVER.persist(collection, next);
  },

  async move(collection, id, delta) {
    const rows = await this.all(collection);
    const i = rows.findIndex(r => r.id === id);
    const j = i + delta;
    if (i === -1 || j < 0 || j >= rows.length) return rows;
    [rows[i], rows[j]] = [rows[j], rows[i]];
    return DRIVER.persist(collection, rows);
  },

  async reset(collection) {
    cache.delete(collection);
    const fresh = await DRIVER.reset(collection);
    cache.set(collection, fresh);
    return fresh;
  },

  /** Everything, as one object — used by the Publish panel. */
  async snapshot() {
    const out = {};
    for (const c of Object.keys(SEEDS)) out[c] = await this.all(c);
    return out;
  },

  /** Replace a collection wholesale (used by Import). */
  async replace(collection, rows) {
    cache.set(collection, rows);
    return DRIVER.persist(collection, rows);
  },

  collections: Object.keys(SEEDS),
  newId: uid,
};
