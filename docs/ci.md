# CI Pipelines

This repository uses GitHub Actions to automate code quality checks.

The CI setup covers frontend correctness, styling consistency, broken links, accessibility audits, and secret scanning — providing confidence that changes are safe, maintainable, and production-ready.

![HTML Validation](https://github.com/groda/color-combinations/actions/workflows/html-validate.yml/badge.svg)
![Link Check](https://github.com/groda/color-combinations/actions/workflows/link-check.yml/badge.svg)
![ESLint](https://github.com/groda/color-combinations/actions/workflows/eslint.yml/badge.svg)
![CSS Stylelint](https://github.com/groda/color-combinations/actions/workflows/stylelint.yml/badge.svg)
![Lighthouse CI](https://github.com/groda/color-combinations/actions/workflows/lighthouse.yml/badge.svg)
![Gitleaks Secret Scan](https://github.com/groda/color-combinations/actions/workflows/gitleaks.yml/badge.svg)

## Table of Contents
 
  * [Why CI & Automation Matter](#why-ci-and-automation-matter)
  * [HTML Validation](#html-validation)
  * [ESLint (JS linting)](#eslint)
  * [Stylelint (CSS linting)](#stylelint)
  * [Links (links checker)](#link-check)
  * [Lighthouse CI (accessibility & quality)](#lighthouse-ci)
  * [Secrets Scanning (Gitleaks)](#secrets-scanning-gitleaks)


# Why CI & Automation Matter

Continuous Integration (CI) and automation are essential for maintaining code quality, reliability, and long-term maintainability—even for small or static projects. By automating repetitive checks such as validation, linting, accessibility audits, and security scans, potential issues are detected early and consistently, without relying on manual review. This not only reduces human error, but also provides immediate feedback on every change, ensuring that the codebase remains clean, standards-compliant, and trustworthy over time. Well-designed CI pipelines act as living documentation of quality expectations and demonstrate a professional, disciplined approach to software development.



# HTML Validation

The **HTML Validation** workflow automatically checks HTML files in the repository for compliance with HTML5 standards. It helps catch structural errors, invalid markup, and common mistakes early in the development process.


## Workflow File [`html-validate.yml`](../.github/workflows/html-validate.yml)

```yaml
name: HTML Validation

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate HTML
        uses: Cyb3r-Jak3/html5validator-action@v7.2.0
        with:
          root: .
```

## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures that HTML validity is checked both during development and before code is merged.

## Job: `validate`

#### Environment

* **Runner:** `ubuntu-latest`

#### Steps Breakdown

1. **Checkout Repository**
  Fetches the repository content so the workflow can access and validate HTML files.

2. **Validate HTML**
  Runs an automated HTML5 validation tool against the repository root.
  * Scans all HTML files under the specified root directory
  * Checks markup against HTML5 standards
  * Reports validation errors and warnings in the workflow logs

## Purpose

This workflow helps to:

* Ensure HTML files are standards-compliant
* Catch broken or invalid markup early
* Improve browser compatibility and accessibility
* Maintain consistent code quality for frontend assets

## Scope

* Validates all HTML files under the repository root (`.`)
* Uses the W3C HTML5 validation rules via the GitHub Action

## Limitations

* Does not validate CSS or JavaScript
* Does not enforce accessibility (ARIA) rules
* Does not auto-fix issues
* Validation results are informational unless enforced by branch protection rules


## Possible Enhancements

* Restrict validation to specific directories
* Add accessibility validation (e.g. WCAG checks)
* Combine with CSS and JS linters
* Cache dependencies for faster runs



# ESLint

The **ESLint** workflow runs automated linting checks to ensure JavaScript code follows consistent style rules and avoids common errors.

## Workflow File [`eslint.yml`](../.github/workflows/eslint.yml)

```yaml
name: ESLint

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  eslint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - name: Install ESLint
        run: |
          npm init -y
          npm install eslint --save-dev
          npx eslint --init || true    # skip wizard, uses defaults

      - name: Run ESLint
        run: |
          npx eslint "**/*.js" || true
```

## Triggers

The workflow runs automatically on:

* **pushes to the `main` branch**
* **every pull request**

This ensures linting feedback is available both during development and before merging changes.

## Job: `eslint`

#### Environment

* **Runner:** `ubuntu-latest`
* **Package manager:** `npm`

#### Steps Breakdown

1. **Checkout Repository**
   Checks out the repository so the workflow can access the source code.

2. **Install ESLint**
   Initializes a minimal Node.js project and installs ESLint as a development dependency.
   * A default `package.json` is generated
   * ESLint is installed locally
   * The interactive ESLint setup wizard is skipped and default settings are used
This allows ESLint to run even if the repository does not already contain a Node.js setup.

3. **Run ESLint**
   Runs ESLint against all JavaScript files in the repository:
    ```
    **/*.js
    ```

    Lint errors are reported in the workflow logs but **do not cause the job to fail**.

## Design Decisions

#### Non-blocking Linting

Lint commands are executed with error suppression, allowing:

* Early visibility into lint issues
* CI feedback without blocking merges
* Gradual adoption of stricter lint rules

This is useful for legacy codebases or early-stage projects.

## Limitations

* Uses ESLint default configuration
* Does not lint TypeScript files
* Does not enforce lint errors as failures
* Does not cache dependencies

## Future Improvements

Possible enhancements include:

* Adding a custom ESLint configuration file
* Enabling lint failures to block merges
  - change `npx eslint "**/*.js" || true` to `npx eslint "**/*.js"` to fail on errors but tolerate warnings
  - change `npx eslint "**/*.js" || true` to `npx eslint "**/*.js" --max-warnings=0` for strict check (not even warnings allowed)
* Supporting TypeScript (`.ts`) files
* Adding dependency caching for faster runs



# Stylelint

The **CSS Stylelint** workflow automatically checks CSS files in the repository
for stylistic consistency, common mistakes, and best-practice violations.
It helps maintain clean, readable, and consistent CSS code.


## Workflow File [`stylelint.yml`](../.github/workflows/stylelint.yml)

```yaml
name: CSS Stylelint

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  stylelint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Stylelint
        run: |
          npm install --global stylelint stylelint-config-standard

      - name: Run Stylelint
        run: |
          stylelint "**/*.css"


## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures CSS quality is checked during development and before merging.


## Job: `stylelint`

#### Environment

* **Runner:** `ubuntu-latest`


### Steps Breakdown

1. **Checkout Repository**
   Fetches the repository content so CSS files can be analyzed.

2. **Install Stylelint**
   Installs Stylelint along with the standard configuration ruleset.

3. **Run Stylelint**
   Scans all CSS files in the repository and reports:

   * Syntax errors
   * Invalid or unknown properties
   * Inconsistent formatting
   * Common CSS mistakes


## Purpose

This workflow helps to:

* Enforce consistent CSS styling
* Catch errors and invalid CSS early
* Improve maintainability and readability
* Prevent regressions in frontend styling


## Scope

* Lints all `.css` files in the repository
* Requires a configuration file (`.stylelintrc.json`, currently implementing the `stylelint-config-standard` ruleset)


## Limitations

* Does not auto-fix issues
* Does not validate HTML or JavaScript
* Does not check accessibility or performance
* Requires Node.js tooling


## Possible Enhancements

* Customize `.stylelintrc` 
* Enable auto-fixing in local development
* Restrict linting to specific directories
* Integrate with Prettier (optional)




# Link Check

The **Links** workflow automatically scans the repository for broken or unreachable links.
When issues are found, it generates a report and opens a GitHub issue with the results, ensuring broken links are tracked and addressed.

This workflow is designed to run **on a schedule** as well as **on demand**, making it suitable for ongoing documentation maintenance.


## Workflow File [`link-check.yml`](../.github/workflows/link-check.yml)

```yaml
name: Links

on:
  repository_dispatch:
  workflow_dispatch:
  schedule:
    - cron: "00 17 * * 1"

jobs:
  linkChecker:
    runs-on: ubuntu-latest
    permissions:
      issues: write # required for peter-evans/create-issue-from-file
    steps:
      - uses: actions/checkout@v5

      - name: Link Checker
        id: lychee
        uses: lycheeverse/lychee-action@v2
        with:
          fail: false

      - name: Create Issue From File
        if: steps.lychee.outputs.exit_code != 0
        uses: peter-evans/create-issue-from-file@v5
        with:
          title: Link Checker Report
          content-filepath: ./lychee/out.md
          labels: report, automated issue
```

## Triggers

The workflow runs under the following conditions:

* **Scheduled run:** Every Monday at 17:00 UTC
* **Manual trigger:** Via GitHub’s *Run workflow* button
* **External trigger:** `repository_dispatch` events

This allows both automated monitoring and manual or external invocation.


## Job: `linkChecker`

#### Environment

* **Runner:** `ubuntu-latest`

#### Permissions

* **Issues:** write
  Required to automatically create GitHub issues when broken links are detected.

#### Steps Breakdown

1. **Checkout Repository**
   Checks out the repository so all files can be scanned for links.

2. **Link Checker**
   Runs the Lychee link checker against the repository.
    * Scans files for HTTP, HTTPS, and relative links
    * Detects broken, unreachable, or invalid links
    * Produces a markdown report (`lychee/out.md`)
    * Does **not fail the workflow** even if broken links are found

3. **Create Issue From File**
   If broken links are detected, a GitHub issue is automatically created.
    * Uses the generated Lychee report as the issue body
    * Applies the labels:
     * `report`
     * `automated issue`
    * Ensures broken links are visible and actionable without blocking CI

## Design Decisions

#### Non-blocking Validation

The workflow is intentionally configured to **not fail the pipeline**.
This prevents broken links from blocking development while still surfacing problems through automated issue creation.

#### Issue-Based Reporting

Rather than relying solely on CI logs, results are persisted as GitHub issues, making them:

* Easy to track
* Assignable
* Auditable over time


## Use Cases

* Documentation repositories
* Static websites
* Markdown-heavy projects
* Periodic quality checks for external links

## Possible Enhancements

* Restrict link checking to specific directories or file types
* Automatically close issues when links are fixed
* Add notifications (Slack, email, etc.)
* Fail the workflow for critical documentation paths


# Lighthouse CI

The **Lighthouse CI** workflow runs automated Lighthouse audits against the project’s **GitHub Pages deployment**.
It evaluates performance, accessibility, best practices, and SEO, and produces detailed reports for each run.

The workflow generates both **HTML and JSON reports**, which are stored as downloadable artifacts.


## Workflow File [`lighthouse.yml`](../.github/workflows/lighthouse.yml)

```yaml
name: Lighthouse CI

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  lighthouse:
    runs-on: ubuntu-latest

    steps:
      # 1️⃣ Check out the repo
      - uses: actions/checkout@v5

      # 2️⃣ Set up Node.js
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      # 3️⃣ Install Lighthouse CLI
      - name: Install Lighthouse
        run: npm install -g lighthouse

      # 4️⃣ Build GitHub Pages URL dynamically
      - name: Set GitHub Pages URL
        run: |
          USER="${GITHUB_REPOSITORY%/*}"
          REPO="${GITHUB_REPOSITORY#*/}"
          echo "URL=https://$USER.github.io/$REPO/" >> $GITHUB_ENV

      # 5️⃣ Run Lighthouse on the dynamic URL
      - name: Run Lighthouse
        run: | 
          echo "Testing $URL"
          lighthouse "$URL" \
            --output=json \
            --output=html \
            --output-path=./lighthouse-report.html \
            --chrome-flags="--headless"

      # 6️⃣ Upload report as artifact
      - name: Upload Lighthouse Report
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports
          path: |
            lighthouse-report.report.html
            lighthouse-report.report.json
```


## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures Lighthouse metrics are continuously monitored as changes are introduced.

## Job: `lighthouse`

#### Environment

* **Runner:** `ubuntu-latest`
* **Node.js:** v20

#### Steps Breakdown

1. **Checkout Repository** Checks out the repository so the workflow can access project metadata.

2. **Set up Node.js** Installs Node.js version 20, which is required to run the Lighthouse CLI.

3. **Install Lighthouse** Installs the Lighthouse CLI globally using npm.

4. **Set GitHub Pages URL** Dynamically constructs the GitHub Pages URL based on the repository name:

  ```
  https://<username>.github.io/<repository>/
  ```

 This allows the workflow to run without hardcoding environment-specific URLs.

5. **Run Lighthouse** Runs Lighthouse in headless Chrome mode against the generated GitHub Pages URL.

  * Audits performance, accessibility, best practices, and SEO
  * Generates both HTML and JSON outputs
  * Saves the reports locally for later inspection

6. **Upload Lighthouse Report** Uploads the Lighthouse reports as workflow artifacts.

  * Artifacts are available for download from the workflow run
  * Useful for comparing results across commits and pull requests

## Purpose

This workflow helps:

* Monitor frontend performance over time
* Detect accessibility regressions early
* Enforce web best practices
* Provide objective metrics for UI changes

## Design Notes

* The workflow assumes the site is published via **GitHub Pages**
* Reports are informational and **do not fail the CI pipeline**
* Metrics are captured at build time, not during local development

## Limitations

* Requires GitHub Pages to be enabled and publicly accessible
* Does not set score thresholds or fail on regressions
* Does not post results as comments or issues
* Audits a single URL (homepage only)

## Possible Enhancements

* Enforce minimum Lighthouse score thresholds
* Audit additional routes or pages
* Upload reports to Lighthouse CI Server
* Comment results directly on pull requests
* Track historical performance trends



# Secrets Scanning (Gitleaks)

The **Secrets Scan** workflow uses **Gitleaks** to automatically detect hard-coded secrets in the repository.
It helps prevent accidental commits of sensitive information such as API keys, tokens, passwords, and private credentials.

## Workflow File [`gitleaks.yml`](../.github/workflows/gitleaks.yml)

```yaml
name: Secrets Scan (Gitleaks)

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
```

## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures secrets are detected both during development and before changes are merged.

## Job: `gitleaks`

#### Environment

* **Runner:** `ubuntu-latest`

### Steps Breakdown

1. **Checkout Repository**
   Fetches the repository content so Gitleaks can scan the full codebase and commit history.

2. **Run Gitleaks**
   Executes the Gitleaks scanner with default rules.

   * Scans source files and commit diffs
   * Detects common secret patterns (API keys, tokens, credentials)
   * Fails the workflow if a potential secret is found

## Purpose

This workflow helps to:

* Prevent accidental leakage of secrets
* Improve repository security hygiene
* Catch sensitive data before it reaches production or public repositories
* Support secure development practices

## Scope

* Scans all tracked files in the repository
* Uses Gitleaks’ default rule set
* Analyzes changes introduced in commits and pull requests

## Limitations

* May report **false positives** for test data or dummy values
* Does not automatically redact or remove secrets
* Does not rotate or invalidate leaked credentials
* Custom rules require additional configuration


## Possible Enhancements

* Add a custom `.gitleaks.toml` configuration file
* Allowlist known false positives
* Scan full git history explicitly if needed
* Combine with branch protection rules to block merges on findings
* Integrate secret rotation or alerting workflows
