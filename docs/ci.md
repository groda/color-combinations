# CI Pipelines

This repository uses GitHub Actions to automate code quality checks.

## Table of Contents
 
  * [HTML Validation](#html-validation)
  * [ESLint](#eslint)
  * [Link Checker](#link-checker)
  * [Lighthouse CI](#lighthouse-ci)


## HTML Validation

The **HTML Validation** workflow automatically checks HTML files in the repository for compliance with HTML5 standards. It helps catch structural errors, invalid markup, and common mistakes early in the development process.


### Workflow File [`html-validate.yml`](../.github/workflows/html-validate.yml)
```
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

### Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures that HTML validity is checked both during development and before code is merged.

### Job: `validate`

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

### Purpose

This workflow helps to:

* Ensure HTML files are standards-compliant
* Catch broken or invalid markup early
* Improve browser compatibility and accessibility
* Maintain consistent code quality for frontend assets

### Scope

* Validates all HTML files under the repository root (`.`)
* Uses the W3C HTML5 validation rules via the GitHub Action

### Limitations

* Does not validate CSS or JavaScript
* Does not enforce accessibility (ARIA) rules
* Does not auto-fix issues
* Validation results are informational unless enforced by branch protection rules


### Possible Enhancements

* Restrict validation to specific directories
* Add accessibility validation (e.g. WCAG checks)
* Combine with CSS and JS linters
* Cache dependencies for faster runs



## ESLint

The **ESLint** workflow runs automated linting checks to ensure JavaScript code follows consistent style rules and avoids common errors.

### Workflow File [`eslint.yml`](../.github/workflows/eslint.yml)

```
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

### Triggers

The workflow runs automatically on:

* **pushes to the `main` branch**
* **every pull request**

This ensures linting feedback is available both during development and before merging changes.

### Job: `eslint`

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

### Design Decisions

#### Non-blocking Linting

Lint commands are executed with error suppression, allowing:

* Early visibility into lint issues
* CI feedback without blocking merges
* Gradual adoption of stricter lint rules

This is useful for legacy codebases or early-stage projects.

### Limitations

* Uses ESLint default configuration
* Does not lint TypeScript files
* Does not enforce lint errors as failures
* Does not cache dependencies

### Future Improvements

Possible enhancements include:

* Adding a custom ESLint configuration file
* Enabling lint failures to block merges
* Supporting TypeScript (`.ts`) files
* Adding dependency caching for faster runs



## Link Checker

The **Links** workflow automatically scans the repository for broken or unreachable links.
When issues are found, it generates a report and opens a GitHub issue with the results, ensuring broken links are tracked and addressed.

This workflow is designed to run **on a schedule** as well as **on demand**, making it suitable for ongoing documentation maintenance.


### Workflow File [`links.yml`](../.github/workflows/links.yml)

```
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

### Triggers

The workflow runs under the following conditions:

* **Scheduled run:** Every Monday at 17:00 UTC
* **Manual trigger:** Via GitHub’s *Run workflow* button
* **External trigger:** `repository_dispatch` events

This allows both automated monitoring and manual or external invocation.


### Job: `linkChecker`

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

### Design Decisions

#### Non-blocking Validation

The workflow is intentionally configured to **not fail the pipeline**.
This prevents broken links from blocking development while still surfacing problems through automated issue creation.

#### Issue-Based Reporting

Rather than relying solely on CI logs, results are persisted as GitHub issues, making them:

* Easy to track
* Assignable
* Auditable over time


### Use Cases

* Documentation repositories
* Static websites
* Markdown-heavy projects
* Periodic quality checks for external links

### Possible Enhancements

* Restrict link checking to specific directories or file types
* Automatically close issues when links are fixed
* Add notifications (Slack, email, etc.)
* Fail the workflow for critical documentation paths


## Lighthouse CI

The **Lighthouse CI** workflow runs automated Lighthouse audits against the project’s **GitHub Pages deployment**.
It evaluates performance, accessibility, best practices, and SEO, and produces detailed reports for each run.

The workflow generates both **HTML and JSON reports**, which are stored as downloadable artifacts.


### Workflow File [`lighthouse.yml`](../.github/workflows/lighthouse.yml)

```
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


### Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures Lighthouse metrics are continuously monitored as changes are introduced.

### Job: `lighthouse`

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

### Purpose

This workflow helps:

* Monitor frontend performance over time
* Detect accessibility regressions early
* Enforce web best practices
* Provide objective metrics for UI changes

### Design Notes

* The workflow assumes the site is published via **GitHub Pages**
* Reports are informational and **do not fail the CI pipeline**
* Metrics are captured at build time, not during local development

### Limitations

* Requires GitHub Pages to be enabled and publicly accessible
* Does not set score thresholds or fail on regressions
* Does not post results as comments or issues
* Audits a single URL (homepage only)

### Possible Enhancements

* Enforce minimum Lighthouse score thresholds
* Audit additional routes or pages
* Upload reports to Lighthouse CI Server
* Comment results directly on pull requests
* Track historical performance trends
