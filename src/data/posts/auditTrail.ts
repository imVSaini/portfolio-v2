import { code, h2, p, ul, type PostSource } from "@/data/posts/schema";

export const auditTrail: PostSource = {
  slug: "audit-trail-is-a-feature",
  title: "An audit trail is a product feature, not a log table",
  excerpt:
    "“Who changed this, and what was it before?” is a question customers ask, so the answer cannot live in application logs. Capturing changes at the write path, tying each one to an actor and a permission, and keeping the history useful once custom fields change shape.",
  topic: "Architecture",
  date: "2026-06-03",
  tint: "soot",
  art: "timeline",
  body: [
    p(
      "Application logs answer an engineer’s questions. An audit trail answers a customer’s: who moved this deal, when, and what did it say before? Those need different retention, different access rules and a schema someone designed on purpose.",
    ),
    h2("Capture at the write path"),
    p(
      "The entry is written in the service layer, in the same transaction as the change. Database triggers know what changed but not who or why. Request logging knows what was attempted but not what was committed. Only the code performing the change knows all three.",
    ),
    code(
      "python",
      `
class AuditEntry(Base):
    __tablename__ = "audit_entries"

    id: Mapped[UUID] = mapped_column(primary_key=True)
    actor_id: Mapped[UUID | None]
    actor_kind: Mapped[str]
    action: Mapped[str]
    entity_type: Mapped[str]
    entity_id: Mapped[UUID]
    changes: Mapped[dict] = mapped_column(JSONB)
    created_at: Mapped[datetime]
`,
    ),
    h2("Record who, and through what"),
    p(
      "“Who” is not always a person at a keyboard. `actor_kind` separates a user from an API key, an automation, or an assistant acting for a user. If an admin can act as someone else, both identities are recorded.",
    ),
    h2("History has to survive custom fields"),
    p(
      "In a CRM, tenants rename and delete their own fields and pipeline stages. An entry that stores only IDs turns into “field 4f2a changed from 7 to 9” the day a field is removed. So each entry keeps the label and the displayed values as they were at the time, next to the IDs.",
    ),
    h2("Append-only, enforced by the database"),
    ul(
      "The application’s database role cannot `UPDATE` or `DELETE` audit rows.",
      "A correction is a new entry that refers to the old one.",
      "Retention is a documented policy per tenant, not a cleanup script.",
    ),
    h2("Give it a screen"),
    p(
      "A history tab on every record, with filters by person and date, lets customers answer the question themselves. That is the point where the audit trail stops being infrastructure and becomes something people would miss.",
    ),
  ],
};
