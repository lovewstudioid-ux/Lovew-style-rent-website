# Partner onboarding — LOVEW Style

LOVEW Style is a **marketplace**: we don't hold stock. We onboard existing
dress-rental businesses (Jakarta first) and ingest their catalog + pickup
details. This folder is the toolkit for collecting that.

## The pieces

| File / asset | What it's for |
|---|---|
| `LOVEW_Style_Partner_Catalog_Template.xlsx` | The master catalog template (3 tabs: Start Here · Your Business · Catalog) with dropdowns + an example row. Hand to partners, or upload to Google Sheets. |
| **"Partner Catalog (Jakarta)" Google Sheet** | Native, shareable catalog Sheet (in your Drive → *LOVEW — Partner Onboarding*). One row per dress. Partners fill their own copy online. |
| `create-partner-form.gs` | Google Apps Script that builds the **business-info Google Form** (pickup address, WhatsApp, payout details). Paste into script.google.com → Run. |
| `../scripts/import-partner-catalog.mjs` | Bulk importer: a finished catalog CSV + partner JSON → `partners` + `dresses` rows in Supabase (as `draft`). |

## The flow

1. **Collect business info** → send the partner the Google Form link (from the
   Apps Script). Responses land in a linked Google Sheet.
2. **Collect the catalog** → share a copy of the Catalog Sheet (or the .xlsx).
   One row per dress; dropdowns keep it clean.
3. **Collect photos** → give the partner a Drive folder; they name files
   `<ItemID>_1.jpg`, `<ItemID>_2.jpg`… (`_1` = cover). 3–5 per dress.
4. **Import** (once the Supabase backend is live):
   ```bash
   # dry run (prints what it would insert — safe)
   npm run import:catalog -- --partner partner.json --catalog "Atelier Mawar - Catalog.csv"

   # for real (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
   npm run import:catalog -- --partner partner.json --catalog catalog.csv --commit
   ```
   Dresses import as **`draft`** — nothing goes live until you upload photos to
   Cloudinary, set `cover_image_url`, review, and flip status to `active`.

## Notes / TODO before the first real import
- Confirm enums against the live schema (`category`: dress|gown|kebaya|suit;
  `city`: jakarta|surabaya|bali|bandung).
- Wire up **size variants** (separate table) — see the TODO in the import script.
- A partner needs an **account** (`owner_user_id`) before import; have them sign
  up, or create the user via the Supabase admin API, then put the id in
  `partner.json`.
- Eventually partners self-serve via the in-app dashboard (`/partner/catalog/new`),
  and this spreadsheet path becomes the bulk-load option for large catalogs.
