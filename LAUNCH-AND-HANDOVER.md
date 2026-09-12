# Launch day + handover runbook

The order matters. Doing these out of sequence is how a business loses
enquiries or drops out of Google.

---

## Stage 1 — Demo (now)

- Build, drag the `build` folder to app.netlify.com/drop
- Throwaway URL, no account
- `noindex` + robots block ON so it can't be found in search
- Show the client. Say plainly: work in progress, prices are placeholders

**Do not create accounts in the client's name yet.** Wait for approval.

---

## Stage 2 — Accounts (after he approves)

Create in this order, all on the same new business email:

1. **Gmail** in the business's name
2. **GitHub** with that email → push the code up (this is also the backup)
3. **Netlify** with that email → connect the GitHub repo

Netlify now rebuilds automatically on every change. The site lives at a
`something.netlify.app` address. Still `noindex` at this point.

---

## Stage 3 — Before the domain switch

Everything here must be done BEFORE pointing the domain over:

- [ ] Contact form working, tested with a real submission, arriving at
      `info@hynsonroofingservices.co.nz`
- [ ] Every claim verified by the client — no invented prices, warranties,
      certifications, ratings or service areas
- [ ] Real photos in place, confirmed as genuine Hynson jobs
- [ ] 301 redirects mapped from every old Wix URL to its new equivalent
- [ ] `sitemap.xml` generated, linked from `robots.txt`
- [ ] Checked on a phone
- [ ] Ask the client whether he uses the Wix **booking page** — if yes, it
      must be replaced before switching

---

## Stage 4 — Go live (the domain switch)

**Do this on a weekday morning, not a Friday afternoon.** If something
breaks, you want the whole day to fix it.

1. Find where `hynsonroofingservices.co.nz` is registered — likely Wix.
   The client needs the login.
2. Point the domain's DNS at Netlify (or move the domain to a registrar in
   the business's name — cleaner long term, and it's what he chose).
3. Wait for SSL/HTTPS to finish provisioning. The site will briefly show
   "Not secure" — normal, wait it out.
4. **REMOVE the `noindex` tag and the robots.txt block.** If this is
   missed, the site vanishes from Google. It is the single most common
   relaunch mistake.
5. Test the live site: every page, the contact form, on a phone.

---

## Stage 5 — After it's live

- [ ] Set up **Google Search Console**, submit the sitemap
- [ ] Check the **Google Business Profile** points at the new site
- [ ] Watch for 404s in Search Console for the first fortnight
- [ ] Expect a short ranking wobble while Google re-crawls. Don't react to it.
- [ ] **Only now** cancel the Wix subscription — never before the new site is
      confirmed working, or the old site dies before the new one is up

---

## Stage 6 — Hand it over

**Accounts** — every one in the business's name:

| | Check |
|---|---|
| Gmail | Recovery phone + backup email changed to HIS, verified working |
| Gmail | Two-factor on his phone, not the developer's |
| Gmail | Developer's own devices/sessions removed |
| GitHub | Owned by the business email |
| Netlify | Owned by the business email |
| Domain | In the business's name, on the business's card |
| CMS/admin | Password changed by him on handover |

The two that quietly keep a developer on the hook forever are **the recovery
phone** and **the domain renewal**. Get both onto him.

**Documents to give him:**

1. **Handover one-pager** — live address, what the site does, where enquiries
   arrive, ongoing costs (hosting free, domain renews annually — state the
   date and amount), what is and isn't included going forward
2. **How to edit your site** — plain-language guide with screenshots
3. **Credentials sheet** — delivered separately, not in the handover doc,
   with instructions to change every password immediately

**Say honestly** what ongoing support is and isn't being offered. Don't
promise availability that won't be there in six months.

---

## The one-line summary

Demo on a throwaway link → accounts in his name → fix the blockers →
switch the domain on a quiet weekday morning → remove noindex →
confirm it works → cancel Wix → hand over the keys.
