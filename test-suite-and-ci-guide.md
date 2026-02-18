# Test Suite & CI Pipeline — What Changed and How It Affects Your Workflow

## What We Built (In Plain English)

### 1. Automated Safety Net (Test Suite)
We added **179 automated checks** that verify every important part of the app works correctly. Think of it like a pre-flight checklist for an airplane — before any code change goes live, the computer runs through all 179 checks to make sure nothing is broken.

These checks cover:
- **Utility functions** — math, formatting, currency conversion, date handling
- **Data stores** — the flight finder's state (filters, selections, saved flights), currency settings, quiz answers, trip planner
- **API endpoints** — flight search, lead capture, email sending, trip plans, planner suggestions
- **User-facing components** — flight cards, search form, results display, share panel

The checks run in about 1.5 seconds. They catch bugs before they reach your users.

### 2. Automatic Gatekeeper (CI Pipeline)
We added a GitHub Actions workflow that automatically runs every time someone proposes code changes (creates a Pull Request). It runs:
1. Code quality checks (linting)
2. Type safety checks
3. A full app build
4. All 179 tests

**If any of these fail, the code cannot be merged into the live site.** This means broken code can never accidentally make it to production.

### 3. Deployment Clarification
Your Vercel deployment already works correctly:
- **Preview deploys** happen when a Pull Request is opened (this is expected — it lets you preview changes before they go live)
- **Production deploys** only happen when code is merged to the `main` branch

The "preview deploy on PR creation" that your partner noticed is normal and useful — it gives you a URL to review changes before approving them.

---

## How This Changes Your Workflow

### Before (Old Way)
1. Developer makes changes
2. Developer pushes code
3. Code goes live immediately
4. Hope nothing broke

### After (New Way)
1. Developer makes changes on a separate branch
2. Developer creates a Pull Request (PR) on GitHub
3. **Automated checks run automatically** — takes about 2 minutes
4. A preview deploy is created so you can see the changes
5. If all checks pass, the PR can be merged
6. **Only after merging** does the change go to the live production site
7. If checks fail, the developer fixes the issues before merging

### What You Need to Do

**For the team (non-developers):**
- Nothing changes in your day-to-day workflow
- When reviewing PRs on GitHub, you'll see a green checkmark (all checks passed) or a red X (something failed)
- Only approve PRs with green checkmarks

**One-time setup (for whoever manages the GitHub repo):**
1. Go to the repo on GitHub
2. Click **Settings** > **Branches** > **Add branch protection rule**
3. Branch name pattern: `main`
4. Check: **Require status checks to pass before merging**
5. Search for and add: **CI / ci**
6. Check: **Require a pull request before merging**
7. Click **Create**

This prevents anyone from pushing directly to `main` and bypassing the safety checks.

---

## Quick Reference

| Command | What it does | When to use |
|---------|-------------|-------------|
| `npm test` | Runs tests in watch mode (re-runs on file changes) | During development |
| `npm run test:ci` | Runs all tests once | To verify before pushing |
| `npm run build` | Builds the production app | CI runs this automatically |
| `npm run lint` | Checks code quality | CI runs this automatically |

---

## FAQ

**Q: Will this slow down development?**
A: No. The full CI pipeline takes about 2 minutes. Tests alone run in 1.5 seconds.

**Q: What if a test fails?**
A: The developer gets clear error messages showing exactly what broke and where. They fix it and push again.

**Q: Can we still do hotfixes quickly?**
A: Yes. The CI runs in 2 minutes. For true emergencies, the branch protection rule can be temporarily overridden by a repo admin.

**Q: Does this affect the live site at all?**
A: No. This only runs during development. Your live site on Vercel is unaffected — it only deploys when code is merged to `main`.

**Q: What about the preview deploys on PRs?**
A: These are separate test environments created by Vercel. They don't affect your live site. They're useful for reviewing changes visually before approving them.
