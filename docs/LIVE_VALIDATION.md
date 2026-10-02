# Live validation

## Release identity

- Chain: GenLayer Studionet `61999`
- Contract: `0x7f98A41507b2dC347B37C6423017c6FBb7979A84`
- Contract checkpoint: `9b9a761780cb9bc4a1b8d4696cdae745b70d4e29`
- Contract SHA-256: `fe8c839c11f18e51c7701a7e0bff09a202eac9665bd2bcd7468ce22931a7c2f0`
- Deployment transaction: `0xb68330aa196f62f491d71a153e445e0295460ccf35175aa2e4f514681592db74` (`FINALIZED`, `MAJORITY_AGREE`)

## Transformation 0

- Fixture: `octocat/Hello-World`, ref `master`, baseline `553c2077f0edc3d5dc5d17262f6aa498e69d6f8e`
- Launch transaction: `0xca174151c84010354b2be49d99c047b76884f536b1f505036619761201e08e17` (`FINALIZED`, `MAJORITY_AGREE`)
- Second-sponsor transaction: `0xa6ec751ea6c749417beb25bd171e4d7406873488810ab1bae1550b81f293f335` (`FINALIZED`, `MAJORITY_AGREE`)
- State readback: status `OPEN`, two sponsor wallets, total funded and pool both `2000000000000000000` wei
- Protocol close time: Unix `1790979048`
- Pre-close guard transaction: `0xeea8d5ae398f3a53ed750b098f288c6fef62674093efd1d99b4d045a98c4563f` finalized with the expected `transformation_still_open` execution error; immediate readback remained `OPEN` with the full `2 GEN` pool and unchanged lifecycle counters.
- Browser readback: a production-configured local build loaded transformation `0` directly from Studionet and rendered its `OPEN FOR FUNDING` status, `2.000 GEN` escrow, repository/ref, baseline, both acceptance criteria, and protocol controls.

Post-close discovery and settlement evidence will be appended after the enforced window elapses.

## Transformation 1

The public fixture diff was independently checked before settlement. Its only content is the canonical `Hello World!` greeting, so transformation `0` is retained as an honest FAILED/refund case. A separate positive case was launched with one criterion matching that public source exactly.

- Criterion: `The terminal README contains the exact greeting Hello World!`
- Launch transaction: `0x601cb25393f79136c076c5de3426a76928db9cb5dc04f30ab41c1efceeb88edf` (`FINALIZED`, `MAJORITY_AGREE`, successful participating-validator execution)
- State readback: transformation `1`, status `OPEN`, pool `1000000000000000000` wei
- Protocol close time: Unix `1790980298`

## Required coverage

After deployment, record at minimum:

- launch with escrow;
- second sponsor funding;
- post-close terminal snapshot;
- multiple discovery batches;
- frozen manifest root;
- shard construction;
- successful shard audit;
- at least one junction audit where applicable;
- COMPLETE settlement and implementer withdrawal;
- FAILED settlement and sponsor refund withdrawal;
- source-unavailable call proving no economic state moved;
- unresolved expiry after grace;
- wrong-network browser handling;
- wallet signature rejection;
- account switch;
- transaction accepted vs finalized distinction;
- finalized execution error presentation;
- refresh recovery for pending transaction monitoring.

Every entry should include commit SHA, contract address, transaction hash, finality, execution result and state readback.
