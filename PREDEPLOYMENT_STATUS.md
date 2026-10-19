# Final release status — verified

The 31-method contested-certification contract is deployed on GenLayer Studionet `61999` at `0xacD37F7db1beC0d071B80D74994038A9563daE96`. The production frontend is https://strata-genlayer.vercel.app. Two 1 GEN lifecycles on this exact contract completed: ordinary and challenged certificates both settled `COMPLETE`, paid the implementer, and proved replay-safe zero-balance withdrawal.

## Frozen release identity

- Contract source checkpoint: `f947e67ed7c7124280aae25fbc6aece48ede8d60`.
- `contract/contracts/strata.py` SHA-256: `5d305dfe94247b857b83aa995b28ceb9274b9af24765db12febcf8beb36f88bd`.
- Contract address: `0xacD37F7db1beC0d071B80D74994038A9563daE96`.
- Deployment transaction: `0xcf886363e9dcf56e57f1b5831f30fd21ff5b76bb3e9d6e415844068bd168b1fd`; `FINALIZED`, `MAJORITY_AGREE`, successful leader and validator execution.
- Retrieved deployed source: exact byte match after removing only the CLI display separator and two trailing display newlines.
- Deployed schema: 31 public methods (10 view, 21 write).
- Vercel production deployment: `dpl_B8Yvdnh4BBh9s3iamhe1WdDxE9C7` (`READY`). The public alias and shipped browser bundle use this exact contract address.

## Verification gates

- Studionet network, architecture, repository-local CLI `0.39.1`, and source-integrity guards passed.
- GenVM lint passed; 25 Direct Mode tests passed; all 10 critical actual-source mutants were killed.
- Frontend lint, explicit TypeScript check, 29 tests, and production build passed. The Vercel production build also passed.
- GitHub Actions run [39234893894](https://github.com/lolaaa00/strata/actions/runs/39234893894) passed on Ubuntu, macOS, and Windows for the frozen contract source.
- The contract readback and both live lifecycles are recorded in `docs/DEPLOYMENT.md` and `docs/LIVE_VALIDATION.md`.

## Live result

Both transformations used `octocat/Hello-World`, baseline `553c2077f0edc3d5dc5d17262f6aa498e69d6f8e`, delivery checkpoint `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`, and scope `README`. Each discovered one changed file, processed one complete scoped evidence record, audited one shard, required zero junctions, and settled `COMPLETE` with a zeroed pool. Transformation `1` submitted and reviewed a committed-evidence challenge before settlement. Two withdrawals paid exactly `1 GEN` each; subsequent withdrawals returned `nothing_to_withdraw`; final internal balance is `0`.

The small public fixture proves the full single-shard and challenge workflow. It does not constitute a live multi-shard junction demonstration; those paths are covered in Direct Mode and adversarial tests.
