# CI Pipelines

This repository uses GitHub Actions to automate code quality checks.

The CI setup covers frontend correctness, styling consistency, broken links, accessibility audits, and secret scanning — providing confidence that changes are safe, maintainable, and production-ready.

![JS/CSS Lint and HTML validate](https://github.com/groda/color-combinations/actions/workflows/code-quality.yml/badge.svg)
![Link Check](https://github.com/groda/color-combinations/actions/workflows/link-check.yml/badge.svg)
![Lighthouse CI](https://github.com/groda/color-combinations/actions/workflows/lighthouse.yml/badge.svg)
![Gitleaks Secret Scan](https://github.com/groda/color-combinations/actions/workflows/gitleaks.yml/badge.svg)

## Table of Contents
 
  * [Why CI & Automation Matter](#why-ci--automation-matter)
  * [CI/CD Architecture](#cicd-architecture)
  * [Code Quality (HTML, Javascript, CSS)](#code-quality)
  * [Links (links checker)](#link-check)
  * [Lighthouse CI (accessibility & quality)](#lighthouse-ci)
  * [Secrets Scanning (Gitleaks)](#secrets-scanning-gitleaks)


# Why CI & Automation Matter

Continuous Integration (CI) and automation are essential for maintaining code quality, reliability, and long-term maintainability—even for small or static projects. By automating repetitive checks such as validation, linting, accessibility audits, and security scans, potential issues are detected early and consistently, without relying on manual review. This not only reduces human error, but also provides immediate feedback on every change, ensuring that the codebase remains clean, standards-compliant, and trustworthy over time. Well-designed CI pipelines act as living documentation of quality expectations and demonstrate a professional, disciplined approach to software development.

# CI/CD Architecture

This repository follows a **modular CI approach**. Rather than defining CI logic locally, we treat our central **[`gha-workflows`](https://github.com/groda/gha-workflows)** repository as a library of standardized building blocks.

* **Logic:** Maintained centrally in `gha-workflows` to ensure consistency across the organization.
* **Orchestration:** Handled locally in this repo to define which checks are relevant to this specific codebase.

# Code Quality

Because this project involves a frontend stack, we have assembled a project-specific quality gate. The `code-quality.yml` workflow acts as an **orchestrator**, combining multiple independent workflows from the central library into a single, unified pipeline.

This allows us to validate our HTML, JS, and CSS in parallel while ensuring we are using the exact same linting standards as our other projects.

## Workflow File [`code-quality.yml`](../.github/workflows/code-quality.yml)


```yaml
name: HTML validate, JS/CSS Linting

on:
  push:
    branches: [ main ]
  pull_request:

jobs:
  html-validate:
    uses: groda/gha-workflows/.github/workflows/html-validate.yml@main

  eslint:
    uses: groda/gha-workflows/.github/workflows/eslint.yml@main

  stylelint:
    uses: groda/gha-workflows/.github/workflows/stylelint.yml@main
  ```

## **Current Assembly**

| Task | Reusable Job (Remote) | Purpose |
| --- | --- | --- |
| **HTML** | 🌐 [`html-validate.yml`](https://github.com/groda/gha-workflows/blob/main/.github/workflows/html-validate.yml) | Ensures standard-compliant and accessible markup. |
| **JavaScript** | 🌐 [`eslint.yml`](https://github.com/groda/gha-workflows/blob/main/.github/workflows/eslint.yml) | Enforces logic standards and catches syntax errors. |
| **CSS** | 🌐 [`stylelint.yml`](https://github.com/groda/gha-workflows/blob/main/.github/workflowsstylelint.yml)) | Maintains styling consistency and prevents CSS bugs. |

> [!TIP]
> By using this modular setup, if we were to add a different language (like Python) to another repo, we would simply create a new orchestrator there and pull the relevant `.yml` files from the central library without changing this project's setup.

## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures that HTML validity, linting, and CSS quality are checked both during development and before code is merged.


# Link Check

The **Links** workflow automatically scans the repository for broken or unreachable links.
When issues are found, it generates a report and opens a GitHub issue with the results, ensuring broken links are tracked and addressed.

This workflow is designed to run **on a schedule** as well as **on demand**, making it suitable for ongoing documentation maintenance.


## Workflow File [`link-check.yml`](../.github/workflows/link-check.yml)

```yaml
name: Links CI

on:
  schedule:
    - cron: "00 22 * * 0"
  workflow_dispatch:

permissions:
  issues: write
  
jobs:
  linkChecker:
    uses: groda/gha-workflows/.github/workflows/link-check.yml@main
    with:
      issue-labels: "report, automated issue"
```

## Triggers

The workflow runs under the following conditions:

* **Scheduled run:** Every Sunday at 10:00 UTC
* **Manual trigger:** Via GitHub’s *Run workflow* button
* **External trigger:** `repository_dispatch` events

This allows both automated monitoring and manual or external invocation.


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
  workflow_dispatch:


jobs:
  lighthouse:
    uses: groda/gha-workflows/.github/workflows/lighthouse.yml@main
```

## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures Lighthouse metrics are continuously monitored as changes are introduced.


# Secrets Scanning (Gitleaks)

The **Secrets Scan** workflow uses **Gitleaks** to automatically detect hard-coded secrets in the repository.
It helps prevent accidental commits of sensitive information such as API keys, tokens, passwords, and private credentials.

## Workflow File [`gitleaks.yml`](../.github/workflows/gitleaks.yml)

```yaml
name: Links CI

on:
  schedule:
    - cron: "00 22 * * 1"
  workflow_dispatch:

permissions:
  issues: write
  
jobs:
  linkChecker:
    uses: groda/gha-workflows/.github/workflows/link-check.yml@main
    with:
      issue-labels: "report, automated issue"
```

## Triggers

The workflow runs automatically on:

* **Pushes to the `main` branch**
* **All pull requests**

This ensures secrets are detected both during development and before changes are merged.

