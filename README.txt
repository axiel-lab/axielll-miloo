Ishrak Khan (Axiel): personal site
====================

Plain HTML, CSS and a little JavaScript. No build step.

Files
  index.html      home
  about.html      about
  work.html       projects, plus the blackjack helper demo
  stack.html      tools and what each is used for
  contact.html    WhatsApp, email, Discord, Instagram (the phone number was removed)
  404.html        not-found page (uses root-relative links, so it works at any URL depth)
  style.css       all styles: colors, hand-drawn look, dark mode
  milo.css        styles for Milo the cat
  milo.js         Milo: follows the cursor, suggests pages, guides each page
  site.js         footer year, Bangladesh clock, and the typing animation on the home page
  blackjack.js    the blackjack helper on work.html
  favicon.svg     tab icon
  _headers        security headers for Netlify or Cloudflare Pages

Run it
  Open index.html in a browser, or upload the whole folder to Netlify,
  Cloudflare Pages, GitHub Pages or any static host. (The 404 page's styling
  only loads once the site is served from a domain root, not from a local file.)

PLACEHOLDERS: READ BEFORE PUBLISHING
  The five bots under "More Discord bots" on work.html are invented names and
  descriptions: Vesper, Kestrel, Tidewater, Copperwood and Cinder. Each one has
  an HTML comment above it that starts with PLACEHOLDER. Rename them to your
  real projects or delete the entries. A visitor will read them as real work.

  Everything else on the site comes from the Axiel-Website-Final files:
  AsTral GG, Campalyze, the blackjack helper, the stack list and the contact
  details. The "What it does" bullets under AsTral GG and Campalyze only
  restate what was already on that site.

Security
  The old script that blocked right-click, copy and dev tools is gone. It
  protected nothing and made the site harder to use. Real protection is the
  _headers file (clickjacking, content sniffing, a strict content-security
  policy). Netlify and Cloudflare Pages read it automatically. On GitHub Pages
  it is ignored, so use Cloudflare in front or accept the defaults.

Fonts
  Familjen Grotesk and Source Serif 4 load from Google Fonts. If they are
  blocked, the page falls back to system fonts. To remove the external
  request, download the fonts, host them in this folder, and drop the Google
  Fonts <link> tags plus the two font origins in _headers.

Editing
  WhatsApp, email, Discord and Instagram appear on index.html and
  contact.html. Search for 4xiel95@gmail.com, xief1e and whos.1shrak to
  change them. The WhatsApp button still opens a chat through wa.me, so the
  number is in that link but is no longer shown on the page.
  Colors are the variables at the top of style.css (--c-red, --c-sun, ...).

Milo the cat
  Move the cursor and Milo walks to it, then suggests a page ("See our work",
  "Contact us" ...). Click the suggestion text to go there. Click Milo for the
  menu and the "Guide me" tour. Each page has its own greeting, and sections
  carry hints in data-milo="..." attributes (optional data-milo-go="page|label").
  Visitors can turn him off with the button in the footer. He holds still if
  the visitor prefers reduced motion.
