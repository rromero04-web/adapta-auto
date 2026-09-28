---
version: 1
slug: "src-pages-index-html"
primary_target: "src/pages/index.html"
related_targets: ["src/pages","assets/styles.css","assets/main.js","src/partials"]
---

# Surface brief: Adapta Auto website (home first)

## Scope and mode

- Home (`src/pages/index.html`): Persuade. The rest of the site inherits the world: catalogue and vehicle sheet are Operate, the guide and legal pages are Read.
- Visitors: people with reduced mobility, families and carers, taxi drivers and companies (PRODUCT.md).
- First action the owner wants: trust the company. Then browse stock or call.
- Proof on hand: real photos (showroom, delivery to a customer, stock, adaptations), the two vehicle cut-outs from the original slider, 39 real vehicle records, confirmed facts (20+ years, staff with disabilities, own workshop and engineers, door-to-door across Spain, 12-month warranty).
- Must keep: original logo, vehicles breaking out of the hero photo with clearly visible animation, real photos.
- Must avoid: looking like a generic template or an ordinary car dealer.
- Constraints: static HTML/CSS/JS, built by `tools/build.py`; WCAG 2.2 AA; motion pausable and reduced-motion safe; no invented numbers on drawings (dimensions only where the catalogue records them).

## Direction contract

THESIS: A conversion project, not a car lot. Every page is a drawing sheet from Adapta Auto's own workshop: real vehicles annotated, dimensioned and signed off. It refuses the dealer template of a search bar over a car photo, a card grid and trust badges.

OWN-WORLD: Cool plotter paper with a faint drafting grid, graphite ink, and the logo's red as the revision layer for callouts, dimension lines and the primary action. Sheet frames with zone markers, title blocks, numbered callout balloons, dimension lines, circular detail views, square corners, hairline and thick ink weights, no shadows except the vehicle's own cast shadow. Wide engineered grotesque lettering for titles and labels; a hyperlegible face for reading.

STORY: The visitor sees their situation solved on a real vehicle, reads the four proofs in the title block, then browses the stock or calls.

FIRST VIEWPORT: Sheet 01. Left five columns: label, headline, red primary action "Ver vehículos disponibles" and an outlined phone action. Right seven columns: the framed showroom photo; the vehicle cut-out overflows the frame's lower edge onto the paper; red callouts draw to three labelled features; views switch as VISTA 1 to 3. Bottom: a full-width title block carrying the four proofs.

FORM: Plano de reforma, position 1 of the ordered list, chosen by the owner over the roll's assignment (index 3). Seed key 294e1837 (degraded roll, no challengers). Signature interaction "el trazado": frames, dimension lines and callouts draw themselves in ink as they enter, the vehicle drives into the sheet and brakes, and catalogue filters behave as drawing layers.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions

- Form of address: original copy uses "usted", rebuilt copy uses "tú".
- Whether the rental service is still offered.
