# Replacement release status

The hardened replacement is a release candidate. The previous fully verified release remains available at `https://strata-genlayer.vercel.app`, backed by contract `0x5Cac5E0E91316eEd4A3e89A3C6601AF3222E4469`. Because the contract source changed during the hostile audit, that address is historical and cannot be claimed as the deployment of this candidate.

## Verified release gates

- repository network and architecture guards pass for Studionet `61999` with no application backend;
- repository-local GenLayer CLI `0.39.1` and immutable dependency pins pass integrity checks;
- GenVM lint and schema validation pass with 19 public methods;
- 38 Direct Mode tests pass;
- all 12 critical contract mutants are killed;
- frontend lint, TypeScript, 25 tests, and production build pass;
- malformed or identity-mismatched Git tree/blob responses fail closed;
- duplicate paths and mode-only changes are covered by Direct Mode and mutation regressions;
- a portable macOS CI job verifies guards and the frontend alongside Ubuntu and Windows.

## Remaining release evidence

- commit the exact candidate and run the full release gate from that clean commit;
- deploy and retrieve-verify the exact new contract source on Studionet `61999`;
- repoint, rebuild, and publish the frontend;
- execute and record a complete funded lifecycle against the new address.
