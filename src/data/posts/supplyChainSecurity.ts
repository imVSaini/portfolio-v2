import { code, h2, p, quote, ul } from "@/data/article";
import { diagram, type PostSource } from "@/data/posts/schema";

export const supplyChainSecurity: PostSource = {
  slug: "software-supply-chain-security",
  title: "Software supply chain security after Shai-Hulud: lockfiles, provenance and signed builds",
  excerpt:
    "In September 2025 a self-replicating worm spread through npm by stealing publishing tokens from developer machines and CI, then publishing infected versions of its victims’ own packages. It made the point plainly: your dependencies and your build pipeline are part of your attack surface. The controls that matter at each stage, from cooldowns and pinned actions to keyless signing and admission checks.",
  metaTitle: "Supply chain security after Shai-Hulud",
  metaDescription:
    "A worm spread through npm by stealing CI tokens. Lockfiles, release cooldowns, pinned actions, OIDC, provenance and admission checks: what matters.",
  topic: "DevOps",
  date: "2026-10-28",
  tint: "red",
  art: "chain",
  body: [
    p(
      "Shai-Hulud did not exploit a bug in anyone’s application. It ran as an install script in a compromised package, searched the machine it landed on for npm and cloud credentials, and used any npm token it found to publish infected versions of that maintainer’s other packages. Developer laptops and CI runners did the spreading. Later waves came back faster.",
    ),
    p(
      "The response across the ecosystem was substantial. npm tightened publishing with mandatory two-factor authentication for local publishing, short-lived granular tokens, the retirement of classic tokens and generally available trusted publishing through OIDC. Package managers added defaults that would have blunted the attack. The work left is on our side: configuring them, and treating the build pipeline as production.",
    ),
    h2("Threats and controls"),
    p(
      "A software supply chain runs from source to running workload, and each stage has its own way to be attacked. No single control covers them all, which is why “we sign our images” is not a supply chain strategy.",
    ),
    diagram(
      "supplyChain",
      "Each stage has its own threat and needs its own control. Signing the final image does nothing for a poisoned dependency.",
      "Five stages in a row: source, dependencies, build, artifact and deploy. Above each, a red threat: a stolen token, a malicious update, a tampered workflow, a swapped image and an unsigned image that runs. Below each, an accent control: passkeys and short-lived tokens, a lockfile with a release cooldown, pinned actions with OIDC, provenance with a signature, and verification at admission.",
    ),
    h2("Lock down dependencies"),
    p(
      "Most malicious package versions are found and removed within days. A cooldown, refusing versions younger than a few days, quietly skips that window. Combined with a strict lockfile and no install scripts by default, it removes the main ways a bad version reaches a machine.",
    ),
    code(
      "yaml",
      `
# pnpm-workspace.yaml
minimumReleaseAge: 4320   # minutes: ignore versions published in the last three days
onlyBuiltDependencies:    # the only packages allowed to run install scripts
  - esbuild
  - sharp
`,
    ),
    ul(
      "Commit the lockfile and install with `--frozen-lockfile` or `npm ci` everywhere, so CI never resolves a version nobody reviewed.",
      "Disable dependency lifecycle scripts by default and allow-list the few packages that need a native build. pnpm 10 does this out of the box.",
      "Configure Renovate or Dependabot with a minimum release age and grouped updates, so upgrades arrive as reviewable batches rather than a daily trickle.",
      "Review every new direct dependency: who maintains it, how many transitive packages it pulls in, and whether twenty lines of your own code would do.",
      "Generate an SBOM for every release. When the next advisory lands, “are we affected?” should be a query, not an afternoon.",
    ),
    h2("CI is production"),
    p(
      "A CI runner holds deploy credentials, registry tokens and signing identity, and runs code from the internet on every push. In March 2025 a popular GitHub Action was compromised and its version tags repointed to a malicious commit, which then printed secrets into thousands of public build logs. Pinning to a tag would not have helped; pinning to a commit would.",
    ),
    code(
      "yaml",
      `
name: release
on:
  push:
    branches: [main]

permissions: {}            # nothing by default; each job asks for what it needs

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
      id-token: write      # OIDC identity, for keyless signing and cloud access
      attestations: write
    steps:
      - uses: actions/checkout@<full-commit-sha>  # v5, pinned by SHA
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
      - id: image
        run: ./scripts/build-and-push.sh           # writes digest to $GITHUB_OUTPUT
      - uses: actions/attest-build-provenance@<full-commit-sha>  # v3
        with:
          subject-name: ghcr.io/acme/api
          subject-digest: \${{ steps.image.outputs.digest }}
          push-to-registry: true
`,
    ),
    ul(
      "Pin third-party actions to full commit SHAs and let Renovate update the pins with the version in a comment.",
      "Start every workflow with `permissions: {}` and grant per job.",
      "Use OIDC federation to your cloud and registry instead of long-lived keys stored as secrets.",
      "Never run untrusted pull request code with secrets available. `pull_request_target` with a checkout of the PR head is the classic mistake.",
      "Publish packages through trusted publishing, so no npm token exists to steal.",
    ),
    quote(
      "Treat the build system as production. It has production’s credentials, so it has production’s threat model.",
    ),
    h2("Provenance and signatures"),
    p(
      "Provenance is a signed statement of how an artifact was built: from which repository and commit, by which workflow, on which builder. SLSA defines levels for how trustworthy that statement is. GitHub’s artifact attestations produce SLSA Build Level 2 provenance out of the box, and Level 3 when the signing runs in an isolated reusable workflow the build cannot tamper with.",
    ),
    p(
      "Sigstore makes the signing keyless. The CI job proves its identity with an OIDC token, receives a certificate valid for minutes, signs, and the signature is recorded in a public transparency log. There is no private key to leak or rotate.",
    ),
    diagram(
      "signedBuild",
      "The build signs with a short-lived certificate tied to its workflow identity. The cluster admits only images whose signature names the expected repository, workflow and branch.",
      "A CI job with an OIDC identity gets a ten-minute certificate from Fulcio, which is recorded in the Rekor public log. The job pushes the image and its attestation to a registry. An admission controller checks the signature against the log and the expected identity before letting a pod run, and rejects images with the wrong workflow or no signature.",
    ),
    p(
      "Signing only matters if something verifies. Add an admission policy, with Kyverno or the Sigstore policy controller, that requires a valid signature from your release workflow on your main branch. Start it in audit mode, fix what it reports, then enforce.",
    ),
    h2("Laptops and coding agents"),
    ul(
      "Use passkeys or hardware keys for registry and source control accounts. Phishing-resistant sign-in removes the most common first step.",
      "Keep no long-lived tokens in dotfiles. Short-lived, scoped credentials expire before a worm can use them.",
      "AI coding agents install packages on their own. Run them in sandboxes without your credentials, and watch for names they invent: attackers register plausible package names that models hallucinate.",
    ),
    h2("The trade-offs"),
    ul(
      "Cooldowns delay security patches too. Keep a documented way to bypass them for a specific advisory.",
      "Pinned SHAs and strict permissions make workflows noisier to maintain without automation.",
      "Admission enforcement can block a legitimate emergency deploy. Have a break-glass path that is logged and reviewed.",
      "Provenance proves where an artifact came from, not that its code is safe. It complements code review and scanning; it does not replace them.",
    ),
    h2("Lessons"),
    ul(
      "Apply a control at every stage; no single one covers the chain.",
      "Lock dependencies, add a release cooldown and turn off install scripts by default.",
      "Pin actions by SHA, grant least privilege per job and use OIDC instead of stored keys.",
      "Sign with keyless identity, and verify at admission, or the signature is decoration.",
      "Keep an SBOM per release so the next advisory is a query.",
    ),
  ],
};
