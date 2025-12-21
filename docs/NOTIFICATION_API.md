Notification API & Frontend Overview

Prisma (schema changes):
- Model: `Notifikasi` now has additional fields:
  - `id_from_user` (Int?) — FK to `User` (pengirim)
  - `id_resource` (Int?) — ID of related resource (klaim id or barang id)
  - `resource_type` (String?) — optional type string
- Enum: `TipeNotifikasi` includes `REQUEST` and `APPROVED`.

Endpoints (backend):
- GET /api/notifikasi
  - Headers: Authorization: Bearer <token_temucepat>
  - Returns: List of notifications for logged-in user (includes `from_user`, `klaim`, `laporan` relations).

- POST /api/notifikasi/mark-read
  - Body: { id_notifikasi }
  - Marks a notification as read (is_read = true).

- POST /api/notifikasi/mark-all-read
  - Marks all notifications of the user as read.

- PATCH /api/klaim/:id/status
  - Body: { action: 'approve'|'reject' }
  - Only the penemu (owner of the laporan) can call this to accept/reject a claim.
  - On approve: klaim.status set to `APPROVED`, and a notification of type `APPROVED` is created for the claimant with message `Klaim diterima! Silakan hubungi penemu di nomor: [No. HP]`.
  - On reject: klaim.status set to `REJECTED`, and a notification is created for the claimant.

Frontend (client-side JS - `frontend/pages/assets/js/notifikasi.js`):
- Functions:
  - `loadNotifications()` — fetches notifications from `/api/notifikasi` and renders them.
  - Polling: the script polls `loadNotifications()` every 10s while user is logged-in.
  - `openDetail(id)` — opens modal, marks notification read, shows related klaim photo and message.
  - Approve/Reject buttons in modal call `PATCH /api/klaim/:id/status` to approve/reject claims; after success the notification list is refreshed.

Implementation notes:
- Uses `localStorage.getItem('token_temucepat')` for Authorization header.
- All UI behavior added via external JS only (no HTML or CSS changes were made).

If you want, I can add unit/integration tests for the controller flows or a migration backfill script to populate `id_from_user` for historical notifs.