# Release status

The source-complete package has been hardened, tested, checkpointed, deployed to GenLayer Studionet, exercised through a complete live lifecycle, and published at `https://strata-genlayer.vercel.app`. Exact evidence is recorded in `docs/DEPLOYMENT.md` and `docs/LIVE_VALIDATION.md`.

## Verified release gates

- repository network and architecture guards pass for Studionet `61999` with no application backend;
- repository-local GenLayer CLI `0.39.1` and immutable dependency pins pass integrity checks;
- GenVM lint and schema validation pass with 19 public methods;
- 34 Direct Mode tests pass;
- all 8 critical contract mutants are killed;
- frontend lint, TypeScript, 25 tests, and production build pass;
- deployed source retrieval matches canonical SHA-256 `394da88e53fb8da50854ce2a2ed02bd9c68e97f7822767a1ed6fc82ff1e1d0e6`;
- live launch, discovery, manifest, shard audit, COMPLETE settlement, native withdrawal, and replay-safe withdrawal finalized successfully;
- production Vercel deployment `dpl_7pPQ8ZAu9zTmLYeSmeYBhnGa3omj` is `READY` and publicly reads the final Studionet contract.

## Remaining release evidence

None. Known limitations are documented in the protocol and live-validation documents.
