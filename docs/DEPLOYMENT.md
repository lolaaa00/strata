# Deployment evidence

## Current status

**CONTRACT DEPLOYED AND VERIFIED; FRONTEND PUBLICATION PENDING**

- Contract checkpoint commit: `be042a7e3d92d235c7554867e5443e967c29c5d0`
- Canonical `strata.py` SHA-256: `394da88e53fb8da50854ce2a2ed02bd9c68e97f7822767a1ed6fc82ff1e1d0e6`
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract address: `0x5Cac5E0E91316eEd4A3e89A3C6601AF3222E4469`
- Deployment transaction: `0xf63b466e3a6d19dac7d3be5b496e94dfbf4940796d4e6935cb637eb25617d64f`
- Deployment finality: `FINALIZED`, `MAJORITY_AGREE`, successful participating-validator execution
- Deployed-source retrieval/hash comparison: exact after removing the CLI transport separator; normalized SHA-256 equals the canonical source SHA-256 above
- Deployed schema: 19 public methods (7 view, 12 write)
- Production frontend URL: PENDING

## Required release sequence

1. Freeze final source and record Git commit + canonical contract SHA.
2. Run green CI on that exact commit.
3. Deploy that exact contract using repository-local GenLayer CLI `0.39.1` on Studionet 61999.
4. Wait for finalized successful deployment execution.
5. Retrieve deployed source and prove it matches the reviewed source.
6. Configure `NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS`.
7. Deploy the Next.js frontend.
8. Execute a complete funded lifecycle and negative/source-failure cases.
9. Record every transaction and resulting on-chain state in `LIVE_VALIDATION.md`.
