# Deployment evidence

## Current status

**CONTRACT DEPLOYED AND VERIFIED; FRONTEND PUBLICATION PENDING**

- Contract checkpoint commit: `9b9a761780cb9bc4a1b8d4696cdae745b70d4e29`
- Release-tree commit: `9e88f3054b9bc8af3a5755f172de996eeb91f418`
- Canonical `strata.py` SHA-256: `fe8c839c11f18e51c7701a7e0bff09a202eac9665bd2bcd7468ce22931a7c2f0`
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract address: `0x7f98A41507b2dC347B37C6423017c6FBb7979A84`
- Deployment transaction: `0xb68330aa196f62f491d71a153e445e0295460ccf35175aa2e4f514681592db74`
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
