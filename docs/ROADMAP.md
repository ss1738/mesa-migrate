# Roadmap

## Current scope: 0.1

Version 0.1 scans seven source-backed o1js 3.0 migration conditions and offers
one opt-in, reviewable replacement. It intentionally avoids automatic changes
where the o1js migration guide requires design or cryptographic review.

## Next milestones

1. Audit each rule against the upstream migration documentation and add minimal
   fixtures for supported syntax.
2. Add machine-readable SARIF output so applications can surface warnings in
   their existing code-review tooling.
3. Publish a small GitHub Action wrapper once the command-line report format is
   stable.
4. Add rules only when an upstream o1js release note or migration document
   supports the diagnostic and its remediation guidance.

No milestone claims that a clean scan proves Mesa compatibility. Users must
still regenerate verification keys and validate their applications with the
relevant o1js and Mina network tooling.
