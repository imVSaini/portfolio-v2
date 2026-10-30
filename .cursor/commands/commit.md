# Commit

Write a commit message for the staged changes that passes this repo's commitlint config
(`.commitlintrc`), then commit.

## Steps

1. Run `git diff --cached`. If nothing is staged, stop and say so.
2. Write the message using the format and rules below.
3. Validate it: `echo "<message>" | npx --no -- commitlint`. Fix and re-validate until it passes.
4. Commit with `git commit -F <file>` so the body keeps its line breaks.

## Format

```
<type>(<scope>): <subject>

- <what changed and why>
- <what changed and why>
```

## Rules

- **type** (required, lower-case), one of:
  - `feat`: a new feature
  - `fix`: a bug fix
  - `refactor`: a code change that neither fixes a bug nor adds a feature
  - `perf`: a performance improvement
  - `style`: formatting only, no behaviour change
  - `docs`: documentation or comments only
  - `test`: adding or fixing tests
  - `build`: build system or dependencies
  - `ci`: CI configuration
  - `chore`: tooling or maintenance
  - `revert`: reverts an earlier commit
- **scope** (optional, lower-case): the area touched, such as `header`, `footer`, `hero`, `work`,
  `contact`, `scroll`, `ui` or `deps`.
- **subject** (required): imperative mood ("add", not "added"), starts lower-case, no full stop.
- Keep the header and every body or footer line at 100 characters or fewer.
- Leave one blank line between the header and the body.
- The body is optional. When included, list each meaningful change as a short bullet.
- Pick the type that describes the main change. If the staged changes are unrelated to each
  other, suggest splitting them into separate commits instead of one mixed commit.

## Examples

```
feat(footer): add overscroll colour band reveal
fix(header): stop site name wrapping on small screens
refactor(scroll): move wheel handling to GSAP Observer
chore: add commitlint, husky, and lint-staged setup
```
