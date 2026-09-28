# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Confirmed by the owner as the audiences the site must win over:

- **People with reduced mobility** looking for a vehicle to drive themselves (adapted controls, driving from their own wheelchair) or to travel in their own wheelchair.
- **Families and carers** looking for a vehicle to transport a relative who uses a wheelchair.
- **Taxi drivers and companies** looking for accessible taxis, vans and minibuses that carry several wheelchair users.

Their job: make a costly, life-changing purchase with confidence. They need to know which vehicle and which adaptation fit their situation (driver, front passenger, centre or rear position), see the real stock with photos and details, trust the seller, learn about grants and tax exemptions, and get in touch (call, email, or visit by appointment), usually from far away.

## Product Purpose

Adapta Auto (legal name ADAPTA MOVIL, S.L.) buys and sells new and used vehicles adapted for wheelchair users and people with any kind of disability, and adapts vehicles in its own workshops. The website exists to show the stock and the adaptations, earn trust, and turn visits into calls, appointments and enquiries. Success means a visitor finds a vehicle or adaptation that fits and contacts the company.

## Positioning

All four differentiators were confirmed by the owner:

- Staff with disabilities who know the customer's needs first-hand.
- Own workshops and an in-house team of engineers who design, process and homologate any vehicle conversion.
- Door-to-door service across Spain: vehicles are bought and delivered at the customer's home.
- Vehicles are inspected, transferred and homologated, with a 12-month mechanical warranty on parts and labour valid across Spain.

Supporting facts from the existing site: more than 20 years in the sector; 700 m² of premises in Molina de Segura (Murcia).

## Operating Context

- No-obligation advice by phone or email; visits to the premises by appointment only, Monday to Friday 9:30–14:00 and 16:30–20:00 (afternoon hours confirmed by the owner; the old contact page's 16:00–19:00 is wrong).
- Delivery and collection at the customer's home anywhere in Spain; after-sales support in every region.
- Many vehicles are sold with 4% VAT for buyers who qualify; the company advises on grants and tax exemptions.
- Stock categories: Quiero conducir, Turismos, Furgonetas, Taxi, Alquiler (currently no stock) and Adaptaciones (cajeados, plataformas, tablas de transferencia, asientos adaptados, aceleradores, telecomandos, inversores de pedales, grúas, butacas).
- Contact: Pol. Ind. La Estrella, C/ Neptuno 122, 30500 Molina de Segura (Murcia) · Tel. 968 603 322 · Móvil 699 934 166 and 626 108 770 · info@adapta-auto.com · Facebook page.

## Capabilities and Constraints

- Static website: HTML, CSS and JavaScript with no runtime dependencies; pages are generated from `src/` by `tools/build.py`; the catalogue lives in `assets/vehiculos.js`.
- No backend: the contact form opens the visitor's email client.
- Catalogue: 39 vehicles (27 available, 12 sold). Sold vehicles stay visible as "Vendido · consultar similares". Many prices are "consultar".
- Only one real photo per vehicle is available. Six vehicles and one adaptation use generated images labelled "Imagen orientativa".
- Language: Spanish (Spain).
- Undecided: whether the rental service (Alquiler) is still offered; the form of address (the original copy uses "usted", the rebuilt copy uses "tú").

## Brand Commitments

- Name "Adapta Auto"; legal entity ADAPTA MOVIL, S.L. (CIF B-73227639). "Adapta Móvil" appears on the building facade and in older texts.
- Original logo: a wheelchair user under a red swoosh (#cb313a) with black "Adapta-auto" lettering (`assets/img/logo.png`, white version `assets/img/logo-blanco.png`); the favicon is derived from it.
- Requested by the owner for the home page: clearly visible hero animations and vehicles that break out of the background photo, as in the original slider.

## Evidence on Hand

- Real photos: one per vehicle in `assets/fotos/*A.jpg`; showroom `assets/img/exposicion.jpg`; a delivery to a customer `assets/img/entrega.jpg`; facade `assets/img/instalaciones.jpg` and team `assets/img/equipo.jpg` (both only 400 px wide); category photos `assets/img/cat-*.jpg`; transparent vehicle cut-outs from the original slider `assets/img/hero-rampa.webp` and `assets/img/hero-adaptacion.webp`.
- Real copy: about us, why us, values, warranty and its conditions, the e-2Drive R&D project (partners NATOELEC and CETEM), the buyer's guide, privacy policy.
- Absent, and must not be fabricated: testimonials, reviews, customer counts, press mentions, extra vehicle photos, prices the company has not published.

## Product Principles

1. **Accessibility is the promise.** The audience includes people with disabilities; a site they cannot use comfortably contradicts the offer.
2. **Show, don't claim.** Real stock, real photos and real adaptations prove the offer better than adjectives.
3. **Trust is tangible.** Experience, warranty, workshop and homologation appear where the decision is made.
4. **A human conversation is the goal.** Every path ends in a call, an appointment or an enquiry.
5. **Distance is not a barrier.** Door-to-door delivery across Spain is part of the offer, not a footnote.

## Accessibility & Inclusion

- Target WCAG 2.2 AA as a minimum.
- Visitors may have limited dexterity or use assistive technology: generous touch targets, full keyboard support, no hover-only or precision interactions, visible focus.
- Readable type sizes and strong contrast; information never carried by colour alone.
- Motion is purposeful, pausable, and honours reduced-motion preferences.
