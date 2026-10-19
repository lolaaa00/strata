# Deployment evidence

## Current status

**CONTESTED-CERTIFICATION RELEASE VERIFIED ON STUDIONET 61999**

- Frozen contract source checkpoint: `f947e67ed7c7124280aae25fbc6aece48ede8d60`.
- Canonical `strata.py` SHA-256: `5d305dfe94247b857b83aa995b28ceb9274b9af24765db12febcf8beb36f88bd`.
- Chain ID: `61999` (`0xF22F`); RPC: `https://studio.genlayer.com/api`.
- Contract address: `0xacD37F7db1beC0d071B80D74994038A9563daE96`.
- Deployment transaction: `0xcf886363e9dcf56e57f1b5831f30fd21ff5b76bb3e9d6e415844068bd168b1fd`.
- Deployment finality: `FINALIZED`, `MAJORITY_AGREE`, successful leader and validator execution.
- Deployed-source retrieval: exact source byte match after removing the CLI display separator and two trailing display newlines; normalized SHA-256 equals the frozen source SHA-256.
- Deployed schema: 31 public methods (10 view, 21 write).
- Explorer: https://explorer-studio.genlayer.com/address/0xacD37F7db1beC0d071B80D74994038A9563daE96
- Production frontend: https://strata-genlayer.vercel.app
- Dedicated Vercel project: `strata-genlayer`; production deployment `dpl_B8Yvdnh4BBh9s3iamhe1WdDxE9C7` (`READY`). The established public alias points to this deployment.
- Vercel production environment: `NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS=0xacD37F7db1beC0d071B80D74994038A9563daE96`. The shipped browser JavaScript contains this address and no obsolete release address.
- The public `/transform/1` route returned HTTP 200 with CSP and HSTS headers. Its browser bundle is configured for direct Studionet reads; the exact settled state was separately read from the contract with pinned `genlayer-js 1.1.8`.
- GitHub Actions source checkpoint run: https://github.com/lolaaa00/strata/actions/runs/39234893894 (Ubuntu, macOS, Windows passed).
- Live transformation `0`: ordinary provisional certificate settled `COMPLETE`, credited and paid `1 GEN`, replay returned `nothing_to_withdraw`.
- Live transformation `1`: committed-evidence challenge reviewed and settled `COMPLETE`, credited and paid `1 GEN`, replay returned `nothing_to_withdraw`.
- Final internal implementer balance: `0`. Exact transaction and state evidence is in `LIVE_VALIDATION.md`.

## Previous verified release (historical)

- Contract checkpoint commit: `be042a7e3d92d235c7554867e5443e967c29c5d0`
- Canonical `strata.py` SHA-256: `394da88e53fb8da50854ce2a2ed02bd9c68e97f7822767a1ed6fc82ff1e1d0e6`
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract address: `0x5Cac5E0E91316eEd4A3e89A3C6601AF3222E4469`
- Deployment transaction: `0xf63b466e3a6d19dac7d3be5b496e94dfbf4940796d4e6935cb637eb25617d64f`
- Deployment finality: `FINALIZED`, `MAJORITY_AGREE`, successful participating-validator execution
- Deployed-source retrieval/hash comparison: exact after removing the CLI transport separator; normalized SHA-256 equals the canonical source SHA-256 above
- Deployed schema: 19 public methods (7 view, 12 write)
- Production frontend URL: `https://strata-genlayer.vercel.app`
- Vercel production deployment: `dpl_7pPQ8ZAu9zTmLYeSmeYBhnGa3omj` (`READY`)
- Public readback: transformation `0` rendered `COMPLETE`, shard `0` `AUDITED`, criterion `0` `SATISFIED`, and the exact certificate and settlement roots below
- Final lifecycle: transformation `0` settled `COMPLETE`; `1 GEN` implementer credit withdrawn successfully; replay-safe withdrawal verified

## Release sequence completed

The frozen source passed CI, was deployed with repository-local CLI `0.39.1`, finalized successfully, and matched source readback. The production frontend was rebuilt with the exact new address and published. Both funded lifecycles, including the challenge branch, settled and withdrew. Historical deployments above remain evidence for earlier versions only.
