# Deployment evidence

## Current status

**PENDING REAL DEPLOYMENT**

This package was intentionally stopped before a wallet-authorized Studionet deployment. Do not replace these fields with guesses.

- Candidate commit: PENDING
- Canonical `strata.py` SHA-256: PENDING
- Chain ID: `61999`
- RPC: `https://studio.genlayer.com/api`
- Contract address: PENDING
- Deployment transaction: PENDING
- Deployment finality: PENDING
- Deployed-source retrieval/hash comparison: PENDING
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
