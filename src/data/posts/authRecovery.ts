import { h2, p, ul, type PostSource } from "@/data/posts/schema";

export const authRecovery: PostSource = {
  slug: "recovery-is-the-auth-system",
  title: "Passkeys are the easy part. Recovery is the auth system",
  excerpt:
    "WebAuthn and TOTP take a sprint to ship. Deciding what happens when someone loses every factor takes longer, and it sets your real security level. The threat model, the fallback order and the recovery paths I would not build.",
  topic: "Security",
  date: "2026-08-05",
  tint: "soot",
  art: "factors",
  body: [
    p(
      "Adding passkeys and TOTP is mostly integration work, because the libraries carry the cryptography. The design work is everything around them: what happens when a phone is lost, a laptop is replaced, or the only admin leaves the company.",
    ),
    h2("Your security level is your weakest recovery path"),
    p(
      "If “I lost my device” ends in a link sent by email, the account is protected by that mailbox, whatever the sign-in screen shows. An attacker does not attack the strongest factor. They go to the reset flow.",
    ),
    h2("Decide the fallback order"),
    ul(
      "Passkeys first. They are bound to the site’s origin, so a phishing page cannot use them.",
      "TOTP second, for devices and browsers where a passkey is not available.",
      "Recovery codes last: generated at enrolment, shown once, single-use and stored hashed like passwords.",
    ),
    h2("Paths I would not build"),
    ul(
      "Codes by SMS. A phone number can be moved to another SIM by someone who is good on the phone.",
      "Security questions. The answers are guessable or already public.",
      "Support resetting MFA because an email asked nicely. That is social engineering with a ticket number.",
    ),
    p(
      "What replaces them: an organisation admin can reset a member’s factors, the reset is audited, and the member is told. For the last admin of an organisation, recovery runs on a delay with notices to every known contact, so a real owner has time to object.",
    ),
    h2("Enrolment details that prevent lockouts"),
    ul(
      "Verify a TOTP code before switching it on, so a mis-scanned QR code cannot lock the account.",
      "Do not allow the last remaining factor to be removed.",
      "Nudge towards a second passkey on another device at the moment the first one is added.",
      "Make people acknowledge their recovery codes before leaving the page.",
    ),
    h2("After a change"),
    p(
      "Adding or removing a factor signs out other sessions and sends a notice. Sensitive actions ask for a fresh check even inside a valid session. Both are cheap, and both shorten the time a stolen session stays useful.",
    ),
  ],
};
