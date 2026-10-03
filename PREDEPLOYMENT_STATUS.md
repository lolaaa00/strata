# Replacement release status

The hardened replacement is deployed at `0x3f353ed233c471926E309a8D23517a8C80Cc1Bff` and published at `https://strata-genlayer.vercel.app`. Its funded live lifecycle is open until Unix `1791066597`; the release remains in progress until discovery, certification, settlement and withdrawal complete.

## Verified release gates

- repository network and architecture guards pass for Studionet `61999` with no application backend;
- repository-local GenLayer CLI `0.39.1` and immutable dependency pins pass integrity checks;
- GenVM lint and schema validation pass with 19 public methods;
- 39 Direct Mode tests pass;
- all 13 critical contract mutants are killed;
- frontend lint, TypeScript, 25 tests, and production build pass;
- malformed or identity-mismatched Git tree/blob responses fail closed;
- duplicate paths and mode-only changes are covered by Direct Mode and mutation regressions;
- a portable macOS CI job verifies guards and the frontend alongside Ubuntu and Windows.

## Remaining release evidence

- after close, execute and record discovery, manifest, shards, junction handling, COMPLETE settlement and implementer withdrawal;
- update final evidence and confirm the repository is clean.
