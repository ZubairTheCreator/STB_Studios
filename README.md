# STB Studios — stbstudio.co.za

The official STB Studios website. Static HTML, CSS and one script. No build step, no framework,
no npm. Deploys to Cloudflare Pages as-is.

## Deploy to Cloudflare Pages

Cloudflare Pages → **Create a project** → connect the repo, then:

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | *(leave empty)* |
| Build output directory | `/` |

`_headers` is picked up automatically — it sets a one-year immutable cache on `/assets/*`,
`must-revalidate` on the HTML, and the usual security headers (HSTS, nosniff, frame options,
referrer policy).

To preview locally:

```bash
python -m http.server 8931
```

## Before you go live — four things

1. **Web3Forms key.** `index.html` has `value="REPLACE_WITH_WEB3FORMS_ACCESS_KEY"` in the enquiry
   form. Get a free key at web3forms.com, paste it in. **Until you do, the form deliberately does
   not pretend to send** — it shows "Form not connected yet" and hands the person to WhatsApp with
   their details pre-filled. It will not silently swallow a lead.
2. **Domain.** Every absolute URL uses `https://stbstudio.co.za` — the singular, the one that's
   live now. The brand name stays "STB Studios" everywhere; only the hostname is singular.

   **When `stbstudios.co.za` finishes processing**, don't just repoint DNS — that would leave two
   hosts serving identical content and split the ranking signal. Do this instead:
   ```bash
   grep -rl 'stbstudio\.co\.za' index.html robots.txt sitemap.xml README.md \
     | xargs sed -i 's|stbstudio\.co\.za|stbstudios.co.za|g'
   ```
   Then in Cloudflare add a **301 redirect rule** from `stbstudio.co.za/*` to
   `https://stbstudios.co.za/$1`, keep the old domain pointed at Cloudflare so the redirect
   resolves, and add the new property in Search Console using the Change of Address tool. The 301
   passes the accumulated ranking over; a plain DNS switch throws it away.
3. **GA4.** There's a clearly-marked commented block just above `</head>`. Paste the gtag.js
   snippet there.
4. **Search Console.** Once the domain resolves, verify the property and submit
   `https://stbstudio.co.za/sitemap.xml`.

## Layout

```
index.html                    the whole page
_headers                      Cloudflare cache + security headers
robots.txt  sitemap.xml       crawl + index
assets/styles.css             all styling (lifted out of the design's inline styles)
assets/site.js                menu, scroll reveals, contact video, form
assets/hero-art.webp          hero artwork (transparent, from Hero_Section.png)
assets/contact.mp4            contact section background video
assets/website-background.webp  page background + video poster
assets/logo.webp  whatsapp.png  og-image.jpg
assets/portfolio-stb.webp  demo-small-business.webp  demo-starter.webp
```

## SEO baked in

Applied per `on-page-seo-basics`:

- Title `Web Design in Stellenbosch | STB Studios` (40 chars), unique meta description (150 chars,
  benefit + CTA), canonical, `lang="en-ZA"`, geo meta.
- One `<h1>`, five `<h2>`, no skipped heading levels.
- Descriptive alt text on every image; decorative art is `alt="" aria-hidden`.
- Descriptive, compressed filenames. Every image is WebP; all nine total ~290 KB, down from
  ~4.1 MB of source PNG/JPG. Source originals are deliberately not in this folder — regenerate
  from `../` if an asset ever needs re-encoding.
- `ProfessionalService` JSON-LD — the specific type, not generic `LocalBusiness` — with phone,
  email, locality, `areaServed`, and an `OfferCatalog` carrying all five package prices in ZAR.
  Plus a `WebSite` node.
- Open Graph + Twitter card with a real 1200×630 image.
- `robots.txt` explicitly allows GPTBot, OAI-SearchBot, PerplexityBot, ClaudeBot and
  Google-Extended — being cited in AI answers is a lead source worth having.
- `sitemap.xml`, and a commented GA4 slot.
- Mobile verified at 390 px, not assumed.

## Known gaps

- **No opening hours in the schema.** `ProfessionalService` supports
  `openingHoursSpecification` and local search uses it. Not added, because inventing trading hours
  is worse than omitting them. Send them through and it's a two-minute edit.
- **NAP / Google Business Profile.** Name and phone are now identical in the contact section, the
  footer and the schema. There is no street address anywhere, which is correct for a service-area
  business — but whatever you enter in GBP must match this character for character. Start GBP
  verification now and pick phone or email over postcard; it's much faster.
- **The `<h1>` has no location in it.** `on-page-seo-basics` wants "what you do in where". The
  design's headline is "A professional website, live this week." — a stronger hook than an SEO
  string, so the design won. Stellenbosch still appears in the title, description, schema, about
  copy, contact block and footer. Say the word and I'll change it.

## Recommended next

An FAQ section — "how much does a website cost in South Africa", "how long does it take", "do I own
it" — is the highest-value thing you could add. It answers the real objections, and it's what AI
search engines quote. I did not add one because it isn't in the approved design, and FAQ schema
without matching visible content on the page is a Google guidelines violation.
