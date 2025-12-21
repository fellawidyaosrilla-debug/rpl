Prisma Migration Notes — Notifikasi & Klaim Relations

What's changed:
- prisma/schema.prisma:
  - Added fields to `Klaim` (id_pengklaim, id_penemu, id_barang).
  - Extended `Notifikasi` model with `id_from_user`, `from_user` relation, `id_resource`, and `resource_type`.
  - Extended `TipeNotifikasi` enum with `REQUEST` and `APPROVED` values.

Important:
- The codebase has been updated to:
  - Create a `REQUEST` notification when a user submits a claim (to the penemu).
  - When penemu approves, klaim.status is set to `APPROVED` and a notification with message `Klaim diterima! Silakan hubungi penemu di nomor: [No. HP]` is created for the claimant.
  - Notifications record `id_from_user` and `id_resource` (klaim id).

How to apply the migration locally:
1. Backup your database.
2. From project root, run:
   npx prisma migrate dev --name add-notif-relations
3. Regenerate prisma client:
   npx prisma generate
4. Restart your server (e.g., npm run dev).

Notes on data compatibility:
- Existing `Notifikasi` rows won't have `id_from_user` or `id_resource` populated. You can backfill these fields using a SQL script if needed.
- If you cannot run migrations yet (production), we can keep backward-compatible code paths — ask if you prefer this approach.

If you run into migration errors, attach the migration output and I will help craft fix scripts.
