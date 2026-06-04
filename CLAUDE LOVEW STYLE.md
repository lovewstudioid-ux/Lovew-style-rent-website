# CLAUDE.md — LOVEW Style

Project memory for Claude Code. Read this before doing any work in this repo.

## What we're building

**LOVEW Style** — a dress & fashion rental marketplace for Indonesia (Jakarta, Surabaya, Bali, Bandung). It aggregates independent dress-rental providers into one searchable platform with filters (city, date, color, size, occasion, price), saved sizing profiles, online booking, and a platform-held refundable deposit.

LOVEW Style is one product of the parent brand **LOVEW Studio**. A second product, **LOVEW Spaces** (studio/space booking), will be added later as a sibling — so keep product-specific logic modular, never hardcode "this is the only product."

- This app deploys to: `https://style.lovewstudio.com`  
- Parent brand site: `https://lovewstudio.com`  
- Future sibling: `https://studio.lovewstudio.com` (LOVEW Spaces)

## Brand

- Parent brand: **LOVEW Studio** (always two words, "Studio" capitalised).  
- This product: **LOVEW Style**. Use this exact name in UI, page titles, metadata, and emails.  
- Parent tagline: "Style & Spaces for the moments that matter."  
- Style tagline: "Rent the look. Own the moment."  
- Footer logo links to `https://lovewstudio.com`. Tone: editorial, aspirational, warm. Bahasa Indonesia primary, English secondary.

### Palette (use CSS variables / Tailwind theme tokens, never hardcode hex inline)

| Token | Hex | Use |
| :---- | :---- | :---- |
| Rose Gold (accent) | `#C68F6B` | Buttons, links, highlights |
| Charcoal (text) | `#1F1B16` | Primary text |
| Cream (background) | `#FAF6F1` | Page background, cards |
| Soft Blush | `#F1E7DD` | Section backgrounds |
| Sage (secondary) | `#7A8B6F` | Tags, success states |

### Fonts

- Display / headings: **Cormorant Garamond** (serif).  
- Body / UI: **Inter** (sans).

## Tech stack

- Next.js 14 (App Router, TypeScript strict) · Tailwind · shadcn/ui · lucide-react  
- Supabase (Postgres \+ Auth \+ Storage), Singapore region · RLS on every table  
- Images: Cloudinary · Email: Resend \+ React Email · WhatsApp: Fonnte  
- Payments: pluggable provider. **Start with ManualTransferProvider** (bank transfer / personal QRIS); add MidtransProvider later (M3 milestone). Never assume a live gateway exists yet.  
- Hosting: Vercel · Monitoring: Sentry \+ Posthog

## Conventions

- **Money:** store IDR as integer rupiah (no decimals). Display via `formatIDR()` → "Rp 250.000" (dot thousands separator).  
- **Dates:** display `dd MMM yyyy` (e.g. "21 May 2026"). Store as ISO / `date` columns.  
- **Deposits are escrow, not revenue.** LOVEW holds the deposit; never route it to the partner directly. Every deposit movement writes a `deposit_ledger` row. Refund auto-releases 3 days after `returned` unless a `damage_claims` row is open. See the schema \+ blueprint for the full lifecycle.  
- **Commission** is 15% of rental subtotal (exclude shipping & deposit), stored per partner.  
- **RLS:** customers see only their own data; partners see only their own catalog/bookings; the deposit ledger is read-only to clients (service role writes only).  
- Keep a `lib/brand.ts` constants file (name, taglines, colors, social URLs, parent URL) and import from it — don't duplicate brand strings.  
- Server-side: verify all payment/webhook signatures; never trust client totals — recompute pricing in `lib/pricing.ts`.

## Working agreement

- One feature per change; show me the diff before large edits.  
- Add Vitest unit tests for `lib/pricing.ts`, `lib/availability.ts`, and `lib/deposit.ts`.  
- Never commit `.env.local`; use Vercel env vars in production.  
- Commit after each accepted task with a conventional-commit message (`feat:`, `fix:`).  
- Indonesian-language UI strings live in a single dictionary so we can toggle EN/ID.

## Roadmap context (so you don't over-build)

We launch lean (Tier 0): manual payments \+ manual-but-logged deposit escrow, no CV/PT yet. Automated gateway, auto-refunds, and the mobile app come after we hit \~50–100 bookings/month. Don't build the automated payment integration until asked.  
