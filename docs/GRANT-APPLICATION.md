# Mina Builder Grant application draft

This is a preparation draft, not a submitted application. It is written for a
small Builder Grant request and must be edited to include the applicant's real
identity, contact details, jurisdiction, payment/KYC information, and relevant
work history before submission.

## Project

Mesa Migrate is an open-source command-line scanner for teams moving o1js
applications from pre-Mesa releases to o1js 3.x. It identifies migration risks
documented by the upstream o1js 3.0.0 changelog and produces file, line, and
column diagnostics. It is intentionally conservative: it does not connect to a
Mina node, access keys, send transactions, or claim that a clean scan proves
compatibility.

Repository: https://github.com/ss1738/mesa-migrate

## Evidence available today

- Seven checks are implemented, with source links to the o1js 3.0.0 changelog.
- The package includes a test suite and GitHub Actions checks for supported Node
  versions.
- A read-only public demonstration is recorded in
  [`DEMONSTRATION.md`](./DEMONSTRATION.md).
- The o1js project has an open Mesa migration discussion where a maintainer
  acknowledged that upgrade documentation is being prepared:
  https://github.com/o1-labs/o1js/issues/2909

## Requested grant and milestones

Requested amount: **US$5,000**.

1. **Rule audit and coverage expansion — US$2,000.** Reconcile every existing
   rule with upstream migration material, add focused fixtures, and implement
   additional diagnostics only where the public o1js documentation supports
   them.
2. **CI-ready reporting — US$1,500.** Add stable JSON and SARIF reporting with
   documentation and tests, so teams can make Mesa migration risks visible in
   review workflows.
3. **Reusable integration and release — US$1,500.** Publish a documented
   GitHub Action wrapper and a versioned open-source release, with example
   configurations for a typical o1js application.

Each milestone produces public code, tests, and documentation in this
repository. The proposal does not promise adoption, grant approval, or protocol
compatibility outcomes outside the scanner's stated scope.

## Applicant section to complete honestly

- Legal name and preferred contact email: `[fill in]`
- Country/jurisdiction and required payment/KYC details: `[fill in]`
- A factual two- to four-sentence summary of relevant TypeScript, developer
  tooling, or Mina experience: `[fill in]`
- Relevant public links (GitHub, prior projects, or technical writing):
  `[fill in]`
- Requested amount: `$5,000` or a revised amount with a matching milestone
  budget: `[confirm]`

## Submission notes

The Mina Builder Grants program describes applications as rolling and says it
aims to respond within 30 days. That is a program target, not a commitment of
funding. Use the official application path linked from
https://minaprotocol.com/builder-grants-program, and submit only after every
placeholder above has been replaced with accurate information.
