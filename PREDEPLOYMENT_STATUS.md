# Release status

The source-complete package has been hardened, tested, checkpointed, and deployed to GenLayer Studionet. The exact deployed contract is recorded in `docs/DEPLOYMENT.md`.

## Verified release gates

- repository network and architecture guards pass for Studionet `61999` with no application backend;
- repository-local GenLayer CLI `0.39.1` and immutable dependency pins pass integrity checks;
- GenVM lint and schema validation pass with 19 public methods;
- 33 Direct Mode tests pass;
- all 8 critical contract mutants are killed;
- frontend lint, TypeScript, 25 tests, and production build pass;
- deployed source retrieval matches canonical SHA-256 `394da88e53fb8da50854ce2a2ed02bd9c68e97f7822767a1ed6fc82ff1e1d0e6`;
- live launch and independent second-sponsor funding finalized successfully with `2 GEN` escrowed.

## Remaining release evidence

- complete transformation `0` after its protocol-enforced close time;
- publish and verify the production frontend.
