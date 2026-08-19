#!/usr/bin/env python3
"""Composes the static pages from shared chrome + per-page content."""
import os

def ver(path):
    """Cache-busting stamp so an updated asset is never served stale."""
    try: return "?v=%d" % int(os.path.getmtime(path))
    except OSError: return ""

NAV = [("index.html","Home"),("tour.html","The Grounds"),("plants.html","Plant Search"),
       ("services.html","Landscaping"),("stay.html","Stay"),("testimonials.html","Testimonials"),
       ("visit.html","Visit")]

def chrome(page, title, desc, body, cls="", extra=""):
    cur = ' aria-current="page"'
    nav  = "\n    ".join(
        '<a href="%s"%s>%s</a>' % (h, cur if h == page else "", t) for h, t in NAV)
    mnav = "\n  ".join(f'<a href="{h}">{t}</a>' for h,t in NAV)
    cssv, appv = ver("css/style.css"), ver("js/app.js")
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="icon" href="assets/photos/LabourOfLoveicon.jpg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Libre+Caslon+Text:ital,wght@0,400;0,700;1,400&family=Zilla+Slab:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap" rel="stylesheet">
<script>document.documentElement.classList.add("js")</script>
<link rel="stylesheet" href="css/style.css{cssv}">
</head>
<body class="{cls}">

<div class="rail" aria-hidden="true"><span>Glover, Vermont</span><span>·</span><span>Zone 3</span></div>

<header class="mast" id="mast">
  <button class="icirc mast__toggle" id="navToggle" aria-expanded="false" aria-controls="navPanel" aria-label="Open menu">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
  </button>
  <nav class="mast__nav" aria-label="Primary">
    {nav}
  </nav>
  <a class="btn btn--fill mast__cta" href="visit.html">Plan a visit</a>
  <a class="mast__logo" href="index.html" aria-label="Labour of Love Landscaping and Nursery — home">
    <img src="assets/generated/logo-mark.webp" alt="Labour of Love Landscaping and Nursery, Kate Butler, specializing in perennial flowers and bulbs, Route 16, Glover Village, Vermont" width="967" height="234">
  </a>
</header>

<nav class="navpanel" id="navPanel" data-open="false" aria-label="Mobile">
  {mnav}
  <a class="btn btn--fill" href="tel:+18025256695">Call (802) 525-6695</a>
</nav>

<main id="top">
{body}
</main>

<footer class="sitefoot">
  <div class="shell sitefoot__in">
    <div>
      <div class="sitefoot__brand">Labour of Love</div>
      <p class="sitefoot__blurb">Landscaping &amp; Nursery · Specializing in perennial flowers and bulbs, hardy to Zone 3.</p>
    </div>
    <div class="sitefoot__cols">
      <div><span class="sitefoot__h">Visit</span>
        <a href="https://maps.google.com/?q=9+Sargent+Lane+Glover+VT+05839" target="_blank" rel="noopener">9 Sargent Lane (Route 16)<br>Glover, Vermont 05839</a></div>
      <div><span class="sitefoot__h">Contact</span>
        <a href="tel:+18025256695">(802) 525-6695</a><br>
        <a href="mailto:kate@labouroflovelandscaping.com">kate@labouroflovelandscaping.com</a></div>
      <div><span class="sitefoot__h">Hours</span>
        Gardens open daily until dark<br>Shop evenings &amp; weekends</div>
    </div>
  </div>
  <div class="shell sitefoot__base"><span>© Labour of Love Landscaping &amp; Nursery</span><span>Glover, Vermont</span></div>
</footer>

<script src="js/app.js{appv}"></script>
{extra}
</body>
</html>"""

# ---------------------------------------------------------------- HOME
HOME = """
  <section class="hero shell">
    <div class="hero__grid">
      <div class="hero__copy">
        <span class="eyebrow">Perennial flowers &amp; bulbs · Glover, Vermont</span>
        <h1 class="display hero__title">Everything here has already survived a Glover winter.</h1>
        <p class="lede">A Zone-3 nursery in Vermont's Northeast Kingdom, where every plant is raised
        from seed or division by hand — and where the gardens, the river, the craft shop and three
        antique guest rooms are all open to you.</p>
        <div class="hero__meta">
          <a class="btn btn--fill" href="tour.html">Walk the grounds</a>
          <a class="btn" href="plants.html">Search 793 varieties</a>
        </div>
        <div class="hero__meta">
          <span class="hero__stat"><b>793</b> varieties catalogued</span>
          <span class="hero__stat"><b>Zone 3</b> hardy — Zone 2 is tundra</span>
          <span class="hero__stat"><b>Daily</b> until dark</span>
        </div>
      </div>
      <div class="hero__art">
        <div class="hero__drift"><div class="hero__sway">
          <img src="assets/generated/hero-plate.webp" alt="Botanical plate of Zone-3 perennials: monkshood, New England aster, butterfly weed, wild columbine, astilbe and hollyhock" fetchpriority="high">
        </div></div>
      </div>
    </div>
  </section>

  <section class="sec season" id="succession">
    <div class="shell">
      <div class="sec__head" data-rise>
        <div><span class="eyebrow">Interactive</span>
        <h2 class="sec__title" style="margin-top:1rem">A breathtaking succession of flowering.</h2></div>
        <p style="max-width:32ch;color:var(--ink-soft);font-size:.9375rem">The whole craft of a Zone-3
        garden is sequence — something coming into bloom as something else goes over. Drag through the
        season and see what is holding the garden up.</p>
      </div>
      <div class="season__stage" data-rise>
        <div>
          <div class="season__month" id="seasonMonth">May</div>
          <p class="season__note" id="seasonNote"></p>
          <div class="season__count"><b id="seasonCount">0</b> varieties carrying this month</div>
          <div class="scrub">
            <label for="seasonRange" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Month of the season</label>
            <input type="range" id="seasonRange" min="0" max="5" value="0" step="1" aria-describedby="seasonNote">
            <div class="scrub__ticks" id="seasonTicks"></div>
          </div>
        </div>
        <div class="bloomgrid" id="bloomGrid" aria-live="polite"></div>
      </div>
    </div>
  </section>

  <section class="sec">
    <div class="shell">
      <div class="sec__head" data-rise>
        <div><span class="eyebrow">What is here</span>
        <h2 class="sec__title" style="margin-top:1rem">Four reasons people drive up here.</h2></div>
      </div>
      <div class="svcs" data-rise>
        <a class="svc" href="tour.html"><span class="svc__n">01</span><h3>The grounds</h3><p>Display gardens, the river's edge, picnic tables among the flowers. Eight stops you can walk before you come.</p><span class="svc__go">Take the tour →</span></a>
        <a class="svc" href="plants.html"><span class="svc__n">02</span><h3>The catalogue</h3><p>793 varieties, field-grown or potted, each described in Kate's own words. Search it by colour, light or habit.</p><span class="svc__go">Search plants →</span></a>
        <a class="svc" href="services.html"><span class="svc__n">03</span><h3>Landscaping</h3><p>Design, installation and maintenance — site clearing, stone work, pruning, pond work.</p><span class="svc__go">See services →</span></a>
        <a class="svc" href="stay.html"><span class="svc__n">04</span><h3>The guest rooms</h3><p>Three themed rooms in a restored 1800s Greek Revival, open year-round.</p><span class="svc__go">Stay the night →</span></a>
      </div>
    </div>
  </section>

  <section class="sec" style="background:var(--paper-warm)">
    <div class="shell plate" data-rise>
      <figure class="plate__fig">
        <img src="assets/photos/LabourOfLoveHeader.jpg" alt="Hand-drawn, hand-coloured botanical engraving reading Labour of Love Landscaping and Nursery, Route 16, Glover Village, Vermont">
        <figcaption>Pl. I — The house plate, drawn and coloured by hand.</figcaption>
      </figure>
    </div>
  </section>
"""

# ---------------------------------------------------------------- TOUR
TOUR = """
  <section class="pagehead shell">
    <span class="eyebrow">The tour</span>
    <h1 class="display pagehead__title">Eight stops between the road and the river.</h1>
    <p class="lede">Eight stops, from the hand-painted sign at the road to the picnic tables at the
    river's edge. Choose a marker — or let it walk itself.</p>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="shell">
      <div class="tour__wrap">
        <div class="tour__map" data-rise>
          <svg viewBox="0 0 800 520" role="img" aria-label="Hand-coloured plan of the Labour of Love grounds: Route 16 along the top, the farmhouse and gardens in the middle, the Barton River along the foot, with eight numbered stops">
            <defs>
              <pattern id="stipple" width="7" height="7" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r=".7" fill="currentColor" opacity=".45"/>
                <circle cx="5" cy="4.5" r=".55" fill="currentColor" opacity=".3"/>
              </pattern>
              <linearGradient id="water" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="#2B4E8C" stop-opacity=".16"/>
                <stop offset="100%" stop-color="#2B4E8C" stop-opacity=".05"/>
              </linearGradient>
              <clipPath id="riverClip">
                <path d="M-20 392 C 120 366, 250 424, 400 400 S 660 352, 820 382 L820 540 L-20 540 Z"/>
              </clipPath>
              <radialGradient id="vign" cx="50%" cy="45%" r="70%">
                <stop offset="60%" stop-color="#000" stop-opacity="0"/>
                <stop offset="100%" stop-color="#4A4633" stop-opacity=".07"/>
              </radialGradient>
            </defs>

            <rect width="800" height="520" fill="#FBFAF4"/>

            <!-- meadow wash -->
            <path d="M-10 120 C 180 100, 320 138, 500 118 S 760 96, 820 120 L820 410 L-10 410 Z"
                  fill="#4A6B3A" opacity=".055"/>

            <!-- ============ RIVER ============ -->
            <g clip-path="url(#riverClip)">
              <path d="M-20 392 C 120 366, 250 424, 400 400 S 660 352, 820 382 L820 540 L-20 540 Z" fill="url(#water)"/>
              <g class="current">
                <path d="M-260 412 C -120 398, 0 432, 140 414 S 400 386, 540 408" fill="none" stroke="#2B4E8C" stroke-width=".9" opacity=".33"/>
                <path d="M-260 430 C -110 418, 20 448, 160 432 S 410 404, 560 424" fill="none" stroke="#2B4E8C" stroke-width=".7" opacity=".22"/>
                <path d="M-260 452 C -130 442, 10 468, 150 452 S 420 428, 570 446" fill="none" stroke="#2B4E8C" stroke-width=".6" opacity=".16"/>
              </g>
              <g class="current current--slow">
                <path d="M-260 402 C -140 392, -10 418, 130 402 S 390 376, 530 396" fill="none" stroke="#2B4E8C" stroke-width=".6" opacity=".2"/>
                <path d="M-260 470 C -120 460, 30 486, 170 470 S 430 446, 580 464" fill="none" stroke="#2B4E8C" stroke-width=".5" opacity=".12"/>
              </g>
            </g>
            <path d="M-20 392 C 120 366, 250 424, 400 400 S 660 352, 820 382"
                  fill="none" stroke="#2B4E8C" stroke-width="1.5" opacity=".65" class="draw"/>
            <text x="52" y="486" class="map__hand" fill="#2B4E8C" opacity=".75">Barton River</text>

            <!-- ============ ROAD ============ -->
            <path d="M-10 98 L810 68" fill="none" stroke="#16180F" stroke-width="6" opacity=".07"/>
            <path d="M-10 98 L810 68" fill="none" stroke="#16180F" stroke-width="1" stroke-dasharray="10 8" opacity=".5" class="draw"/>
            <text x="700" y="52" class="map__label" fill="#6B6E5D">ROUTE 16</text>

            <!-- ============ HOUSE — Greek Revival, gable end to the road ============ -->
            <g class="bldg">
              <path d="M296 214 L296 148 L348 112 L400 148 L400 214 Z" fill="#F4F1E4" stroke="#16180F" stroke-width="1.4"/>
              <path d="M296 148 L348 112 L400 148 Z" fill="#A21D1B" opacity=".12"/>
              <path d="M296 148 L348 112 L400 148" fill="none" stroke="#16180F" stroke-width="1.2"/>
              <path d="M303 152 L393 152" stroke="#16180F" stroke-width=".8" opacity=".7"/>
              <rect x="338" y="180" width="16" height="34" fill="#16180F" opacity=".1" stroke="#16180F" stroke-width=".8"/>
              <rect x="311" y="168" width="13" height="15" fill="none" stroke="#16180F" stroke-width=".7"/>
              <rect x="368" y="168" width="13" height="15" fill="none" stroke="#16180F" stroke-width=".7"/>
              <path d="M304 214 L304 160 M392 214 L392 160" stroke="#16180F" stroke-width=".7" opacity=".6"/>
              <rect x="366" y="120" width="9" height="16" fill="#F4F1E4" stroke="#16180F" stroke-width=".9"/>
            </g>
            <!-- craft shop / barn -->
            <g class="bldg">
              <rect x="416" y="176" width="46" height="34" fill="#F4F1E4" stroke="#16180F" stroke-width="1.1"/>
              <path d="M416 176 L439 162 L462 176" fill="#B5860B" fill-opacity=".16" stroke="#16180F" stroke-width="1"/>
            </g>

            <!-- ============ BEDS ============ -->
            <g class="beds" color="#2E4A2E">
              <g data-bed="3" class="bed">
                <ellipse cx="170" cy="250" rx="80" ry="40" class="bed__fill" fill="#C77489"/>
                <ellipse cx="170" cy="250" rx="80" ry="40" fill="url(#stipple)" opacity=".5"/>
                <ellipse cx="170" cy="250" rx="80" ry="40" class="bed__edge" fill="none" stroke="#4A6B3A" stroke-width="1"/>
              </g>
              <g data-bed="4" class="bed">
                <ellipse cx="392" cy="302" rx="124" ry="36" class="bed__fill" fill="#B5860B"/>
                <ellipse cx="392" cy="302" rx="124" ry="36" fill="url(#stipple)" opacity=".45"/>
                <ellipse cx="392" cy="302" rx="124" ry="36" class="bed__edge" fill="none" stroke="#4A6B3A" stroke-width="1"/>
              </g>
              <g data-bed="6" class="bed">
                <ellipse cx="566" cy="240" rx="94" ry="44" class="bed__fill" fill="#2B4E8C"/>
                <ellipse cx="566" cy="240" rx="94" ry="44" fill="url(#stipple)" opacity=".4"/>
                <ellipse cx="566" cy="240" rx="94" ry="44" class="bed__edge" fill="none" stroke="#4A6B3A" stroke-width="1"/>
                <g fill="#6B6E5D" opacity=".5">
                  <ellipse cx="530" cy="248" rx="7" ry="5"/><ellipse cx="592" cy="232" rx="9" ry="6"/>
                  <ellipse cx="560" cy="258" rx="6" ry="4"/><ellipse cx="602" cy="252" rx="5" ry="3.5"/>
                </g>
              </g>
            </g>

            <!-- ============ NURSERY ROWS ============ -->
            <g data-bed="5" class="bed rows">
              <g stroke="#4A6B3A" stroke-width="1" opacity=".8">
                <line x1="612" y1="138" x2="726" y2="127"/><line x1="614" y1="150" x2="728" y2="139"/>
                <line x1="616" y1="162" x2="730" y2="151"/><line x1="618" y1="174" x2="732" y2="163"/>
              </g>
              <g fill="#A21D1B" opacity=".5">
                <circle cx="628" cy="136" r="2"/><circle cx="656" cy="134" r="2"/><circle cx="684" cy="131" r="2"/><circle cx="712" cy="129" r="2"/>
              </g>
              <g fill="#B5860B" opacity=".5">
                <circle cx="630" cy="148" r="2"/><circle cx="658" cy="146" r="2"/><circle cx="686" cy="143" r="2"/><circle cx="714" cy="141" r="2"/>
              </g>
              <g fill="#2B4E8C" opacity=".45">
                <circle cx="632" cy="160" r="2"/><circle cx="660" cy="158" r="2"/><circle cx="688" cy="155" r="2"/><circle cx="716" cy="153" r="2"/>
              </g>
              <g fill="#C77489" opacity=".5">
                <circle cx="634" cy="172" r="2"/><circle cx="662" cy="170" r="2"/><circle cx="690" cy="167" r="2"/><circle cx="718" cy="165" r="2"/>
              </g>
            </g>

            <!-- ============ TREES ============ -->
            <g class="trees" stroke="#2E4A2E" fill="none">
              <g class="tree"><circle cx="243" cy="176" r="15" stroke-width="1" fill="#2E4A2E" fill-opacity=".1"/>
                <path d="M243 176 l0 -11 M243 176 l-9 5 M243 176 l9 5" stroke-width=".7" opacity=".7"/></g>
              <g class="tree"><circle cx="492" cy="130" r="12" stroke-width="1" fill="#2E4A2E" fill-opacity=".1"/>
                <path d="M492 130 l0 -9 M492 130 l-7 4 M492 130 l7 4" stroke-width=".7" opacity=".7"/></g>
              <g class="tree"><circle cx="132" cy="336" r="13" stroke-width="1" fill="#2E4A2E" fill-opacity=".1"/>
                <path d="M132 336 l0 -9 M132 336 l-8 5 M132 336 l8 5" stroke-width=".7" opacity=".7"/></g>
              <g class="tree"><circle cx="690" cy="316" r="16" stroke-width="1" fill="#2E4A2E" fill-opacity=".1"/>
                <path d="M690 316 l0 -11 M690 316 l-9 5 M690 316 l9 5" stroke-width=".7" opacity=".7"/></g>
            </g>

            <!-- ============ PICNIC TABLES ============ -->
            <g data-bed="7" class="bed" stroke="#16180F" stroke-width=".9" opacity=".75">
              <g><rect x="238" y="360" width="26" height="9" fill="#B5860B" fill-opacity=".2"/>
                 <path d="M242 369 l-3 7 M260 369 l3 7"/></g>
              <g><rect x="276" y="378" width="26" height="9" fill="#B5860B" fill-opacity=".2"/>
                 <path d="M280 387 l-3 7 M298 387 l3 7"/></g>
            </g>

            <!-- sign at the road -->
            <g data-bed="1" class="bed" stroke="#16180F">
              <path d="M112 118 L112 100" stroke-width="1.2"/>
              <rect x="96" y="84" width="32" height="17" fill="#F4F1E4" stroke-width="1.1"/>
              <path d="M100 90 h24 M100 95 h17" stroke-width=".7" opacity=".55"/>
            </g>

            <!-- ============ COMPASS + SCALE ============ -->
            <g class="compass" transform="translate(742,452)">
              <circle r="19" fill="none" stroke="#16180F" stroke-width=".8" opacity=".35"/>
              <path d="M0 -19 L5 0 L0 19 L-5 0 Z" fill="#A21D1B" fill-opacity=".65" stroke="#16180F" stroke-width=".6"/>
              <path d="M-19 0 L19 0" stroke="#16180F" stroke-width=".6" opacity=".3"/>
              <text y="-23" class="map__label" text-anchor="middle" fill="#6B6E5D">N</text>
            </g>
            <g transform="translate(52,506)" opacity=".55">
              <path d="M0 0 h72" stroke="#16180F" stroke-width="1"/>
              <path d="M0 -4 v8 M36 -3 v6 M72 -4 v8" stroke="#16180F" stroke-width="1"/>
              <text x="78" y="4" class="map__label" fill="#6B6E5D">100 FT</text>
            </g>

            <!-- a bee, because the milkweed earns it -->
            <g class="bee" aria-hidden="true">
              <ellipse rx="2.6" ry="1.8" fill="#B5860B"/>
              <path d="M-1 0 h3.4" stroke="#16180F" stroke-width=".7" opacity=".6"/>
              <ellipse cx="-.4" cy="-2" rx="2.2" ry="1.1" fill="#FBFAF4" opacity=".75" stroke="#16180F" stroke-width=".3"/>
            </g>

            <rect width="800" height="520" fill="url(#vign)" pointer-events="none"/>
            <g id="hotspots"></g>
          </svg>
        </div>
        <article class="stopcard" data-rise>
          <div class="stopcard__img"><img id="stopImg" src="assets/photos/tourthegrounds.jpg" alt=""></div>
          <div class="stopcard__body">
            <span class="eyebrow" id="stopKicker">Stop 01</span>
            <h2 id="stopTitle" style="margin-top:.85rem;font-size:1.75rem">The sign at the road</h2>
            <p id="stopText"></p>
            <div class="stopnav">
              <button class="icirc" id="stopPrev" aria-label="Previous stop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M15 18l-6-6 6-6"/></svg></button>
              <button class="icirc" id="stopNext" aria-label="Next stop"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M9 18l6-6-6-6"/></svg></button>
              <button class="icirc" id="stopPlay" aria-label="Play the tour" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 4l14 8-14 8z"/></svg></button>
              <span class="stopnav__count"><span id="stopNum">01</span> / 08</span>
            </div>
          </div>
        </article>
      </div>
      <div class="nextup" data-rise>
        <a class="nextup__a" href="plants.html"><span>Next</span><b>Search the catalogue</b></a>
        <a class="nextup__a" href="stay.html"><span>Or</span><b>Stay the night</b></a>
      </div>
    </div>
  </section>
"""

# ---------------------------------------------------------------- PLANTS
PLANTS = """
  <section class="pagehead shell">
    <span class="eyebrow">The living catalogue</span>
    <h1 class="display pagehead__title">Every variety she grows.</h1>
    <p class="lede"><b id="catTotal">793</b> perennials, bulbs, shrubs and oddities — each described in
    Kate's own words, most raised here from seed or by division.</p>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="shell">
      <div class="cat__controls" data-rise>
        <div class="searchbox">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
          <input type="search" id="catSearch" placeholder="Search by name, colour, habit…" aria-label="Search the plant catalogue">
        </div>
        <div id="catFilters" style="display:flex;gap:.5rem;flex-wrap:wrap"></div>
      </div>
      <div class="cat__grid" id="catGrid" aria-live="polite"></div>
      <div class="cat__empty" id="catEmpty" hidden>Nothing by that name — try a colour, or a genus.</div>
      <div class="cat__more"><button class="btn" id="catMore">Show more</button></div>
    </div>
  </section>
"""

# ---------------------------------------------------------------- SERVICES
SERVICES = """
  <section class="pagehead shell">
    <span class="eyebrow">The other half of the trade</span>
    <h1 class="display pagehead__title">Design, planting, stone and pond work.</h1>
    <p class="lede">Full-service design, installation and maintenance for commercial and residential
    properties — from a single border to clearing and replanting a whole site.</p>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="shell">
      <div class="svcs" data-rise>
        <article class="svc"><span class="svc__n">01</span><h2>Garden design</h2><p>A succession of flowering worked out for your ground, your light, and your winter — alpine miniatures through to background giants.</p></article>
        <article class="svc"><span class="svc__n">02</span><h2>Installation</h2><p>Field-grown or potted stock, planted by the people who raised it. Cottage-style or formal, whichever argument you found more persuasive.</p></article>
        <article class="svc"><span class="svc__n">03</span><h2>Maintenance</h2><p>Ongoing care through the season, so the border in year three looks like the drawing from year one.</p></article>
        <article class="svc"><span class="svc__n">04</span><h2>Site clearing</h2><p>Brambles, weed trees, and old foundations. Kate has coaxed gardens out of worse — ask about the barn foundation full of broken glass.</p></article>
        <article class="svc"><span class="svc__n">05</span><h2>Stone work</h2><p>Walls, steps and edges built to sit right in a Vermont landscape and survive the frost heave.</p></article>
        <article class="svc"><span class="svc__n">06</span><h2>Trees &amp; shrubs</h2><p>Planting, pruning, and removals — including the specimens that are not supposed to do well up here.</p></article>
        <article class="svc"><span class="svc__n">07</span><h2>Pond work</h2><p>Water in the landscape, and the moisture-lovers that belong at its edge.</p></article>
        <article class="svc"><span class="svc__n">08</span><h2>And more</h2><p>If it belongs in a Northeast Kingdom garden, it is worth a telephone call.</p></article>
      </div>
      <div class="quote quote--light" data-rise style="margin-top:clamp(2.5rem,6vw,4rem)">
        <blockquote>“When I first saw the much neglected garden at the old farmhouse, my first thought was
        what can be saved. <em>Kate Butler changed all that.</em> Not immediately but over several years,
        coaxing us and the land.”</blockquote>
        <cite>Marian Burros<br>Writer &amp; client</cite>
      </div>
      <div style="margin-top:2rem" data-rise>
        <a class="btn btn--fill" href="mailto:kate@labouroflovelandscaping.com?subject=Landscaping%20enquiry">Discuss a project</a>
      </div>
    </div>
  </section>
"""

# ---------------------------------------------------------------- STAY
STAY = """
  <section class="pagehead shell">
    <span class="eyebrow">Stay the night</span>
    <h1 class="display pagehead__title">Three rooms in an 1800s Greek Revival.</h1>
    <p class="lede">Filled with genuine antiques and botanical-garden-sized tropical plants. Open
    year-round, with a full kitchen, a woodstove, a piano and a library.</p>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="shell">
      <div class="rooms" data-rise>
        <article class="room"><span class="room__n">I</span><h2>The Natural History Room</h2>
          <p>One double bed among antiques and cabinets of nature collections — the room for the person who reads the labels.</p>
          <div class="room__meta"><span>Sleeps 4</span><span>1 double</span></div></article>
        <article class="room"><span class="room__n">II</span><h2>The Rose Room</h2>
          <p>Two twin beds, a complete Art Deco furniture set, and roses worked through every detail of the décor.</p>
          <div class="room__meta"><span>Sleeps 2</span><span>2 twins</span></div></article>
        <article class="room"><span class="room__n">III</span><h2>The Chinese Wedding Room</h2>
          <p>A 1940s waterfall double, a child's bed, and an Oriental rug — the warmest room in the house in October.</p>
          <div class="room__meta"><span>Sleeps 3</span><span>1 double + child's</span></div></article>
      </div>

      <div class="amen" data-rise>
        <div><span class="sitefoot__h">Rates</span><p>$75 per night, single or double occupancy.<br>$95 family rate. Year-round.</p></div>
        <div><span class="sitefoot__h">In the house</span><p>Full kitchen · woodstove · fireplace pit · piano · library · TV/DVD · laundry · free WiFi · linens provided</p></div>
        <div><span class="sitefoot__h">On the land</span><p>Gardening · farm tours · fishing · leaf peeping · the gift &amp; craft shop · picnic tables at the river</p></div>
      </div>

      <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap" data-rise>
        <a class="btn btn--fill" href="mailto:kate@labouroflovelandscaping.com?subject=Guest%20room%20enquiry">Enquire about a room</a>
        <a class="btn" href="tel:+18025256695">Call (802) 525-6695</a>
      </div>
    </div>
  </section>
"""

# ---------------------------------------------------------------- TESTIMONIALS
TESTI = """
  <section class="pagehead shell">
    <span class="eyebrow">In other words</span>
    <h1 class="display pagehead__title">What people write about Kate.</h1>
  </section>
  <section class="sec voices" style="margin-top:0">
    <div class="shell">
      <div class="quote" data-rise>
        <blockquote>“I swear you can see the fairies dance upon the petals of Kate's flowers.
        <em>It's as if representatives of the entire plant kingdom have converged for a grand party.</em>
        All the flora shimmers, and vibrates and compels us to live in ephemeral beauty of life.”</blockquote>
        <cite>Dana Robinson<br>Singer &amp; songwriter</cite>
      </div>
      <div class="quote" data-rise>
        <blockquote>“Kate Butler changed all that. Not immediately but over several years, coaxing us and
        the land with a new garden. <em>Our visitors, who have their own gardens, always make a stop at
        Labour of Love to take a few things home.</em> They are convinced that Kate's plants are better
        than anything they can buy.”</blockquote>
        <cite>Marian Burros<br>Writer &amp; client</cite>
      </div>
      <div class="quote" data-rise>
        <blockquote>“Kate Butler, the cheerful proprietor, is one of those relentlessly creative people who
        are full of surprises. She grows all her own plants from seed or division; she has a taste for the
        unusual and oddball stuff — <em>she finds amusement in growing survivors that are ‘not supposed to
        do well up here.'</em>”</blockquote>
        <cite>Ruah Donnelly<br>The Adventurous Gardener:<br>Where to buy the best plants in New England</cite>
      </div>
      <div class="quote" data-rise style="border-bottom:1px solid #33362A">
        <blockquote>“From what I've gathered on this site <em>you are the poster child for women being
        successful in the landscaping world.</em>”</blockquote>
        <cite>Nicholas White<br>Proprietor, White Gardens</cite>
      </div>
    </div>
  </section>
"""

# ---------------------------------------------------------------- VISIT
VISIT = """
  <section class="pagehead shell">
    <span class="eyebrow">Visit</span>
    <h1 class="display pagehead__title">Open daily until dark.</h1>
    <p class="lede">Call ahead for group or guided tours, guest rooms, or weddings. The gift and craft
    shop keeps its own hours — evenings and weekends, or by chance.</p>
  </section>

  <section class="sec" style="padding-top:0">
    <div class="shell">
      <div class="visit__grid" data-rise>
        <dl class="fact"><dt>Where</dt>
          <dd><a href="https://maps.google.com/?q=9+Sargent+Lane+Glover+VT+05839" target="_blank" rel="noopener">9 Sargent Lane (Route&nbsp;16)<br>Glover, Vermont 05839</a></dd>
          <dt>Telephone</dt><dd><a href="tel:+18025256695">(802) 525-6695</a></dd></dl>
        <dl class="fact"><dt>Email</dt>
          <dd><a href="mailto:kate@labouroflovelandscaping.com">kate@labouroflovelandscaping.com</a></dd>
          <dt>Gardens</dt><dd>Open daily until dark</dd></dl>
        <dl class="fact"><dt>Shop &amp; house</dt>
          <dd>Evenings and weekends<br><span style="color:var(--ink-faint)">other times by chance or appointment</span></dd>
          <dt>Guest rooms</dt><dd>Year-round, by arrangement</dd></dl>
        <dl class="fact"><dt>Also here</dt>
          <dd>40 varieties of homemade jam<br>Handwoven woollens by Kate<br>Picnic tables at the river</dd></dl>
      </div>

      <div class="visitcta" data-rise>
        <a class="btn btn--fill" href="tel:+18025256695">Call the nursery</a>
        <a class="btn" href="mailto:kate@labouroflovelandscaping.com?subject=Guided%20tour%20enquiry">Book a guided tour</a>
        <a class="btn" href="mailto:kate@labouroflovelandscaping.com?subject=Wedding%20enquiry">Weddings</a>
      </div>

      <figure class="plate__fig" data-rise style="margin-top:clamp(2.5rem,6vw,4rem)">
        <img src="assets/photos/tourthegrounds.jpg" alt="The hand-painted Labour of Love sign at the roadside, surrounded by perennial plantings">
        <figcaption>The sign at the road, Route 16.</figcaption>
      </figure>
    </div>
  </section>
"""

PAGES = [
 ("index.html","Labour of Love Landscaping &amp; Nursery — Glover, Vermont",
  "Over 700 varieties of Zone-3-hardy perennials grown from seed and division in Vermont's Northeast Kingdom. Display gardens, guided tours, a craft shop and three antique guest rooms.",HOME,"home"),
 ("tour.html","The Grounds — Labour of Love Landscaping",
  "An eight-stop tour of the Labour of Love grounds in Glover, Vermont: display gardens, the nursery rows, the 1800s farmhouse and the river's edge.",TOUR,""),
 ("plants.html","Plant Search — Labour of Love Landscaping",
  "Search 793 Zone-3-hardy perennials, bulbs and shrubs grown at Labour of Love Nursery in Glover, Vermont.",PLANTS,""),
 ("services.html","Landscaping — Labour of Love Landscaping",
  "Garden design, installation and maintenance in Vermont's Northeast Kingdom: site clearing, stone work, tree and shrub planting, pruning and pond work.",SERVICES,""),
 ("stay.html","Stay — Labour of Love Landscaping",
  "Three themed guest rooms in a restored 1800s Greek Revival farmhouse in Glover, Vermont. Open year-round from $75 a night.",STAY,""),
 ("testimonials.html","Testimonials — Labour of Love Landscaping",
  "What writers, gardeners and clients say about Kate Butler and Labour of Love Landscaping & Nursery.",TESTI,""),
 ("visit.html","Visit — Labour of Love Landscaping",
  "Visit Labour of Love Landscaping & Nursery at 9 Sargent Lane, Route 16, Glover, Vermont. Open daily until dark.",VISIT,""),
]

for fn,title,desc,body,cls in PAGES:
    open(fn,"w").write(chrome(fn,title,desc,body,cls,
        ('<script src="js/hero-wind.js%s"></script>' % ver('js/hero-wind.js')) if fn=="index.html" else ""))
    print("wrote",fn)
