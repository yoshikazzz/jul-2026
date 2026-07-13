# Domain migration: jul-2026.josh-nish.com → travels.kinako.dog

## Strategy

- **Primary domain**: `travels.kinako.dog` (Route 53 zone `kinako.dog`, hosted in AWS account
  `015370912082`, profile `comps-j`). This is the canonical host for the app going forward.
- **Path-based trip routing**: the app is a single deployment that serves multiple trips. The
  first path segment is a trip code (e.g. `/202607-hkg-kul-bkk`) that is resolved client-side
  against `src/data/trips.json` (`trips.code`) to pick which trip's data to render.
  - `https://travels.kinako.dog/` (bare root, no code) → renders a "404. Blame Josh!" placeholder.
    Note: GitHub Pages is a static host, so this is a *visual* 404 only — the actual HTTP status
    is still 200, since `/` is the same file the `/:code` deep-link redirect trick lands on.
  - `https://travels.kinako.dog/202607-hkg-kul-bkk` → resolves `trips.code === "202607-hkg-kul-bkk"`
    and renders that trip.
  - `https://travels.kinako.dog/{unknown-code}` → renders the same "404. Blame Josh!" placeholder
    (no matching trip found).
- **Legacy redirect**: `travels.josh-nish.com/{tripCode}` (a *new* subdomain on the
  `josh-nish.com` zone, distinct from the old `jul-2026.josh-nish.com`) should redirect to
  `travels.kinako.dog/{tripCode}`, preserving the trip code path segment. This gives anyone who
  still has/uses a `josh-nish.com`-based link a working path forward without hosting a second
  copy of the app.
  - GitHub Pages only serves one custom domain per site, so `travels.josh-nish.com` can't just be
    CNAME'd at `yoshikazzz.github.io` alongside `travels.kinako.dog` — it needs its own redirect
    infrastructure (e.g. an S3 bucket configured for website-redirect-all-requests-to-another-host,
    or a CloudFront function/Lambda@Edge redirect, fronted by a Route 53 record in the
    `josh-nish.com` zone). Implementation TBD when this piece is actually built. Certificate for
    this domain would come from AWS Certificate Manager (ACM), DNS-validated via Route 53.
- **Old domain teardown**: `jul-2026.josh-nish.com` (the original custom domain used during
  initial GitHub Pages setup) has been retired — its Route 53 CNAME record is removed and
  GitHub Pages' custom domain config is switched to `travels.kinako.dog`. It is superseded by
  `travels.kinako.dog/202607-hkg-kul-bkk` as the canonical URL, and by
  `travels.josh-nish.com/202607-hkg-kul-bkk` as the (not-yet-built) redirect-only legacy URL.

## Status

- [x] `src/data/trips.json` created (`id`, `code`, `title`, `titleEn`, `startDate`, `endDate`);
      `code` is `"202607-hkg-kul-bkk"`
- [x] `src/app/TripView.tsx` created (trip lookup by `code` via `useParams()`, not-found state)
- [x] `src/app/Reserved.tsx` ("404. Blame Josh!" placeholder for root / unmatched codes, HTTP 200)
- [x] `src/app/App.tsx` refactored into a router shell (`/` → `Reserved`, `/:code` → `TripView`)
- [x] `src/main.tsx` wrapped in `BrowserRouter`
- [x] `public/404.html` + `index.html` restore script (GitHub Pages SPA deep-link workaround)
- [x] `vite.config.ts` `base` reviewed for the new domain (stays `'/'`)
- [x] `public/CNAME` updated to `travels.kinako.dog`
- [x] Route 53: added `travels.kinako.dog` CNAME → `yoshikazzz.github.io` (`kinako.dog` zone,
      `Z00842709APMT1F806FC`)
- [x] Route 53: removed `jul-2026.josh-nish.com` CNAME (`josh-nish.com` zone, `Z04879112XAZQ0F5Z152X`)
- [x] GitHub Pages custom domain switched to `travels.kinako.dog`; cert issued & approved by
      GitHub, HTTPS re-enforced
- [ ] Commit and push the code changes (site currently still serves the pre-migration build)
- [ ] `travels.josh-nish.com` → `travels.kinako.dog` redirect infrastructure (not started)
