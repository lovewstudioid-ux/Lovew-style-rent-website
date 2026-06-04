# Partner onboarding — LOVEW Style

LOVEW Style is a **marketplace**: we don't hold stock. We onboard existing
dress-rental businesses (Jakarta first) and ingest their catalog + pickup
details. This folder is the toolkit for collecting that.

## The pieces

| File / asset | What it's for |
|---|---|
| `LOVEW_Style_Partner_Catalog_Template.xlsx` | The master template (4 tabs: Start Here · Your Business · Catalog · **Sizes & Measurements**) with dropdowns + example rows. Hand to partners, or upload to Google Sheets. |
| **"Partner Catalog (Jakarta)" Google Sheet** | Native, shareable Sheet — the *style* level, one row per dress. |
| **"Sizes & Measurements (Jakarta)" Google Sheet** | The *variant* level — **one row per size** (per colour only when it differs), each with its own Bust/Waist/Hip/Length. Linked to a dress by Item ID. This is what powers "fits my size". |
| `create-partner-form.gs` | Google Apps Script that builds the **business-info Google Form** (pickup address, WhatsApp, payout details). Paste into script.google.com → Run. |
| `../scripts/import-partner-catalog.mjs` | Bulk importer: a finished catalog CSV + partner JSON → `partners` + `dresses` rows in Supabase (as `draft`). |

## The flow

1. **Collect business info** → send the partner the Google Form link (from the
   Apps Script). Responses land in a linked Google Sheet.
2. **Collect the catalog** → share a copy of the Catalog Sheet (or the .xlsx).
   One row per dress (style-level). Then the **Sizes & Measurements** sheet:
   one row per size, each with its own measurements, linked by Item ID. Add a
   row per colour only when a colour's sizes/measurements differ — otherwise list
   colours at the dress level and keep one row per size.
3. **Collect photos** → give the partner a Drive folder; they name files
   `<ItemID>_1.jpg`, `<ItemID>_2.jpg`… (`_1` = cover). 3–5 per dress.
4. **Import** (once the Supabase backend is live):
   ```bash
   # dry run (prints what it would insert — safe)
   npm run import:catalog -- --partner partner.json --catalog catalog.csv --variants sizes.csv

   # for real (needs NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
   npm run import:catalog -- --partner partner.json --catalog catalog.csv --variants sizes.csv --commit
   ```
   (Export each Google Sheet via File → Download → CSV.)
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
