import { code, h2, p, type PostSource } from "@/data/posts/schema";

export const llmGuardrails: PostSource = {
  slug: "llm-proposes-human-commits",
  title: "The model proposes, a human commits: guardrails for an AI that takes actions",
  excerpt:
    "An assistant that can change data needs the same discipline as any other write path. Typed tools as the only surface, validation before anything reaches the database, and a confirmation step that makes every action reviewable and attributable.",
  topic: "AI",
  date: "2026-08-27",
  tint: "red",
  art: "proposal",
  body: [
    p(
      "An assistant that only answers questions can be wrong cheaply. One that creates, reassigns and closes tasks is a write path into your database, and it deserves the same care as the API. The difference is that this caller is persuasive, tireless and sometimes confidently mistaken.",
    ),
    h2("Typed tools are the only surface"),
    p(
      "The model never writes SQL and never calls an arbitrary endpoint. It picks from a small set of tools, each with a schema, and its arguments pass through the same validation as a request from the UI.",
    ),
    code(
      "python",
      `
class ReassignTask(BaseModel):
    task_id: UUID
    assignee_id: UUID
    reason: str = Field(max_length=280)
`,
    ),
    p(
      "A validation failure goes back to the model as an error it can correct. It does not go to the database as a best guess.",
    ),
    h2("Authorise as the user"),
    p(
      "Every tool runs with the permissions of the person in the conversation. The assistant cannot do anything that person could not do by hand. Instructions in a prompt are not a security boundary, so nothing about access is left to them.",
    ),
    h2("Propose, then commit"),
    p(
      "A tool call produces a proposal: what will change, shown as before and after. Nothing is written until the user confirms. The proposal itself is stored, so confirming executes exactly what was shown and not a second generation that might differ.",
    ),
    h2("Earning autonomy"),
    p(
      "Confirmation is friction, and it is also measurement. How often a tool’s proposals are accepted unchanged is the evidence for relaxing the rule, one tool at a time. Without that number, removing the step is a guess.",
    ),
    h2("Attribution"),
    p(
      "The audit record names the user who confirmed, the proposal they saw and the conversation that produced it. “The AI did it” is never an acceptable answer to “who changed this?”.",
    ),
  ],
};
