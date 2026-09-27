# Fresco Hairvolution — Mobile Barber (Home Service)

## Goal
A single-page site for Fresco Hairvolution, a barber who cuts at the client's home. It shows the services and prices, how the home visits work, the areas covered, the call-out fee and the booking steps, and turns a visitor into a booked home appointment in under a minute. Bookings are captured and viewable by the owner. No shop, no walk-ins, no customer accounts.

## Users
- **Customer** (mainly mobile, in or near the covered areas): wants to know the price of a cut at home, whether his area is covered and what the call-out fee is, and to lock a time slot today or this week.
- **Owner/barber (Fresco)**: wants to add or change services and prices, set which areas he covers and the fee per area, see new booking requests with the customer's address, and block off days he isn't working — all from his phone.

## Pages
Single scrolling landing page, plus two small utility pages and the owner area:
- **Home (one scrolling page)**
  - Header: logo (`/uploads/img-6576.jpeg`) + "Fresco Hairvolution" wordmark, WhatsApp button, "Book a home visit" button, mobile menu.
  - Hero: logo mark, headline ("Sharp cuts. At your door."), one-line promise on home service, two buttons — Book a home visit / WhatsApp us — plus a trust strip: *Home service only · Cuts, fades & beards · Serving [areas], 7 days a week*. No walk-in messaging anywhere.
  - How it works: 4 short steps — Book a slot → Send your address → Fresco arrives with the kit → Pay after the cut. Includes a line on what's provided (clippers, cape, sterilised tools) and what the customer needs (a chair, water, a socket).
  - Services & prices: cards grouped as Cuts, Beards, Hair + Beard (Combo), Kids, and Home extras (treatment, hair dye/black-up). Each card: name, short line, duration, price (₦). Prices and call-out fee editable by the owner; placeholder naira prices loaded at first build.
  - Call-out fee & coverage: what areas are covered, the call-out fee per zone (e.g. within-area / outer-area), free-visit threshold if any, and a note that the fee is confirmed on WhatsApp before the visit. Editable by the owner.
  - Gallery: grid of cut photos (placeholders generated at first build; real photos swapped in later).
  - Why Fresco: 3–4 short points — same barber every time, salon results at home, sterilised tools, punctual, kids and families welcome.
  - Reviews: 4–6 short customer quotes with first name, area and star rating.
  - Booking: form with name, phone, service (dropdown from the price list), add-ons, date, preferred time slot, **home address**, area/zone, landmark, number of heads (if more than one), notes. On submit it saves the request and shows a confirmation with the summary, the shop's WhatsApp link pre-filled with the request details, and the payment note.
  - FAQ: 4–5 questions — how the visit works, what happens if I'm outside your area, the call-out fee, rescheduling and lateness, what I should have ready, payment methods.
  - Contact & socials: WhatsApp number, phone, Instagram, TikTok, service days and hours, coverage areas. No street address, no map, no "visit us".
  - Footer: logo, quick links, socials, copyright.
- **Booking confirmed**: summary of the request (service, date, time slot, address), travel-fee note, "Save these details" text, WhatsApp button.
- **Owner area** (behind a PIN): booking requests list (new / confirmed / done) with customer address and landmark and a one-tap WhatsApp reply, edit services and prices, edit call-out fees and coverage zones, set service days/hours and block off dates. Kept in the browser for this first version.

## Data model
- **Service**: id, name, category (Cuts/Beards/Combos/Kids/Extras), description, duration (minutes), price (₦), active.
- **Booking**: id, customer name, phone, service ids, add-ons, date, time slot, home address, area, landmark, number of clients, notes, status (new/confirmed/done), created_at.
- **CoverageArea**: id, area name, zone (inner/outer), call-out fee (₦), active.
- **BlackoutDate**: date, reason. Blocks the booking form on days Fresco isn't working.
- **Review**: id, customer first name, area, quote, rating, date.
- **Site settings**: business name, phone, WhatsApp number, Instagram, TikTok, service days and hours, hero headline, hero subline, free-visit threshold note, what's-included line, owner PIN.

## Integrations
- none (booking requests are stored and shown to the owner in the owner area; the WhatsApp button opens a pre-filled chat, and there is no payment or email service in this version)

## Out of scope
- Any physical shop, address, map or walk-in messaging — this is home service only.
- Online payment, deposits or card checkout; the customer pays after the cut.
- Customer accounts, login or booking history.
- Real-time availability, calendar sync (Google Calendar/ICS), SMS or email confirmations and reminders.
- Multi-barber rota or booking a specific barber other than Fresco; no staff management.
- Selling products online (pomade, oils), gift cards, memberships or subscriptions.
- Route optimisation or distance-based automatic fee calculation — the fee comes from the coverage area the customer picks.
- Real photos of cuts and the kit — the first version uses generated placeholders and the uploaded logo (`/uploads/img-6576.jpeg`); real photos are swapped in later. No other brand assets were supplied.