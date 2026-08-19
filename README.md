# Labour of Love Landscaping — new site

Seven-page static site. Serve the folder:

```bash
python3 -m http.server 4173
```

## Pages

| File | Page |
|---|---|
| `index.html` | Home — hero plate, season scrubber, what's here |
| `tour.html` | The Grounds — interactive eight-stop tour |
| `plants.html` | Plant Search — all 793 varieties, live filtering |
| `services.html` | Landscaping — design, installation, stone, pond work |
| `stay.html` | Stay — the three guest rooms |
| `testimonials.html` | Testimonials |
| `visit.html` | Visit — hours, address, contact |

Pages are composed by `build.py` from shared chrome (masthead, mobile nav,
footer) plus per-page content. Edit the content blocks in `build.py` and re-run
`python3 build.py` — do not hand-edit the generated HTML, it will be overwritten.

`js/app.js` is shared; each module (season scrubber, grounds tour, catalogue)
guards on its own DOM hooks, so only the relevant code runs per page.

## Art direction

**Hand-coloured botanical engraving, 1800s plate.**

This wasn't invented — it was recovered. Her existing site header (`assets/photos/LabourOfLoveHeader.jpg`)
is a hand-drawn, hand-coloured botanical engraving with a hand-lettered banner. That is the
same visual world as the reference video (Yohji Yamamoto floral editorial): a cut-out botanical
on white, huge display serif, gray de-emphasis, thin circular controls, vertical rail text.
The brand already owned this language; it was trapped in a 2017 WordPress theme.

- **Ground** — warm paper `#F4F1E4`, never white
- **Ink** — `#16180F`, a green-black. No pure black anywhere.
- **Colour** — only from the plate's hand-colouring: crimson, scilla blue, ochre, moss, rose
- **Type** — Bodoni Moda (display, engraving-era high contrast) + Archivo (text). Deliberately not Inter.

## Content

Everything on the current site, plus what was buried in it.

| Source | Result |
|---|---|
| WooCommerce REST API | **793 plants** with Kate's own descriptions → `data/plants.json` |
| Shop listing crawl (50 pages) | 32 unique plant photographs → `assets/plants/` |
| Site pages | services, hours, tours, shop, testimonials |
| Farmstay listing | 3 named guest rooms, rates, amenities |
| Web research | full address, email, Zone-3 detail |

## The interactive pieces

1. **The Succession** — a season scrubber (May→October). Her actual specialty is
   *sequence of bloom*, so the scrubber filters the real catalogue by season and
   swaps the plate grid. Counts are live from the data.
2. **The Grounds** — an eight-stop illustrated plan with keyboard-accessible
   hotspots, prev/next, and an auto-play walkthrough.
3. **The Catalogue** — live search across all 793 varieties plus filters
   (shade, sun, fragrant, pollinators, native, rock garden, has photograph),
   all derived from her descriptions.

## Verified

- No horizontal overflow at 1280px or 375px
- All text ≥4.5:1 contrast (lowest 4.62)
- 30 images, 0 broken, 0 missing alt text
- All 32 plant photo paths resolve
- One `h1`; clean heading order
- Touch targets ≥44px; hotspots keyboard-focusable
- Content is visible without JS — reveal animation is enhancement only, with a
  2.5s safety net so a stalled observer can never leave the page blank

## Generated assets

`assets/generated/hero-plate.png` — the home hero. An antique hand-coloured
botanical engraving of six perennials she actually grows: monkshood, New England
aster, butterfly weed, wild columbine, astilbe, hollyhock. Made with Higgsfield
(GPT Image 2, 3:4, 2k). It sits on the paper via `mix-blend-mode: multiply`,
which dissolves the white ground — so any replacement plate should also be
generated on plain white.

## Still open

- **Facebook** is login-walled; only "Glover, VT" is public. LinkedIn returns
  HTTP 999 to automated fetches. Anything from those needs a manual pass.
- Only 32 of 793 plants have photographs. That gap is the single biggest
  content opportunity — either a shoot, or a generated plate per genus using
  the same prompt recipe as the hero.
- No gallery page yet (her old site had one, driven by a NextGEN plugin whose
  images are not in the WordPress media library).
