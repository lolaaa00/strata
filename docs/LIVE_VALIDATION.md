# Live validation

## Release identity

- Chain: GenLayer Studionet `61999`
- Contract: `0x5Cac5E0E91316eEd4A3e89A3C6601AF3222E4469`
- Contract checkpoint: `be042a7e3d92d235c7554867e5443e967c29c5d0`
- Contract SHA-256: `394da88e53fb8da50854ce2a2ed02bd9c68e97f7822767a1ed6fc82ff1e1d0e6`
- Deployment transaction: `0xf63b466e3a6d19dac7d3be5b496e94dfbf4940796d4e6935cb637eb25617d64f` (`FINALIZED`, `MAJORITY_AGREE`)

The preceding deployment at `0x7f98A41507b2dC347B37C6423017c6FBb7979A84` proved launch, multi-sponsor funding, terminal snapshot, discovery, manifest, shard audit, FAILED settlement, and accounting. Its live withdrawal exposed that Studionet's supported SDK requires `get_contract_at(...).emit_transfer(...)`; the release contract above contains that correction plus a positive withdrawal regression.

## Superseded-contract transformation 0

- Fixture: `octocat/Hello-World`, ref `master`, baseline `553c2077f0edc3d5dc5d17262f6aa498e69d6f8e`
- Launch transaction: `0xca174151c84010354b2be49d99c047b76884f536b1f505036619761201e08e17` (`FINALIZED`, `MAJORITY_AGREE`)
- Second-sponsor transaction: `0xa6ec751ea6c749417beb25bd171e4d7406873488810ab1bae1550b81f293f335` (`FINALIZED`, `MAJORITY_AGREE`)
- State readback: status `OPEN`, two sponsor wallets, total funded and pool both `2000000000000000000` wei
- Per-sponsor readback: both sponsor-total keys return exactly `1000000000000000000` wei; the implementer withdrawal balance remains `0` before settlement.
- Protocol close time: Unix `1790979048`
- Pre-close guard transaction: `0xeea8d5ae398f3a53ed750b098f288c6fef62674093efd1d99b4d045a98c4563f` finalized with the expected `transformation_still_open` execution error; immediate readback remained `OPEN` with the full `2 GEN` pool and unchanged lifecycle counters.
- Browser readback: a production-configured local build loaded transformation `0` directly from Studionet and rendered its `OPEN FOR FUNDING` status, `2.000 GEN` escrow, repository/ref, baseline, both acceptance criteria, and protocol controls.

- Terminal snapshot: `0x4315de52492ea90248850b1274857fe94c70a45169e4a2286c2d91401dafd251`; tip `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`, tree `b4eecafa9be2f2006ce1b709d6857b07069b4608`
- Discovery batch: `0xaae610e14914d18331dba836b1de77297cbba780895d2246f1dcb921a6da8e71`; frontier `1/1`, one modified `README` record
- Manifest: `0x11cea8bbc57f076c7b824dea88c74fc057a6befb6d6262c3207a1242ceb9f2af`; root `7fa05a6831fcc8ca8d67310a8156f23d8044681b2dba600cc9f4ca90c52821e3`
- Shards: `0xe4b864cf49ee84bbb5472825ab5227461329310e4ecb42055a43c96ffc66ad12`; one bounded shard
- Shard audit: `0xe35d361a6d119bc4fa342f9b3842863adcabfabe27d1025385e4f71dab0de478`; criterion `0` SATISFIED, criterion `1` VIOLATED, source digest `20db2a123d94c61f4121b404c9e6ed0066da37335930391a4ca32e736cb74d19`
- Junction build: `0x97f382ef11076cc3b0c623aacb8e5d477dfdd4f482851e18912f7a8ebc8cd1f1`; zero junctions because the single shard reported no cross-shard interfaces
- FAILED settlement: `0xcd2a99b3c8277a6b84c7fe3436cb2c7c4992f0817e733a4a94f49a3963956f04`; certificate root `f88f8c6e32b4175105326f9ce0c1600d33899d6bba5039b327ec0c4a3b2d1678`, pool zeroed, each sponsor credited `1 GEN`
- Withdrawal compatibility discovery: `0xeed5f15fb8122d2002fb47798482ef3b99c901e5c61b4a9b3c7e636fec00b9cc` finalized with an execution error because the old SDK has no `gl.transfer`; this directly triggered the corrected release deployment.

## Superseded-contract transformation 1

The public fixture diff was independently checked before settlement. Its only content is the canonical `Hello World!` greeting, so transformation `0` is retained as an honest FAILED/refund case. A separate positive case was launched with one criterion matching that public source exactly.

- Criterion: `The terminal README contains the exact greeting Hello World!`
- Launch transaction: `0x601cb25393f79136c076c5de3426a76928db9cb5dc04f30ab41c1efceeb88edf` (`FINALIZED`, `MAJORITY_AGREE`, successful participating-validator execution)
- State readback: transformation `1`, status `OPEN`, pool `1000000000000000000` wei
- Protocol close time: Unix `1790980298`
- Browser readback: the frontend refreshed its direct Studionet listing and displayed both transformation `1` with `1.000 GEN` and transformation `0` with `2.000 GEN`, ordered newest first.
- Superseded-contract readback after both launches: next transformation ID `2`; deployed schema remained 19 public methods and retrieved source matched its then-canonical SHA-256.

## Final-contract transformation 0

- Criterion: `The terminal README contains the exact greeting Hello World!`
- Launch transaction: `0x7841fbed5b202dd6d7e7f12a6c1656af4b5267eb43abbd6bb2b42343c13272ab` (`FINALIZED`, `MAJORITY_AGREE`, successful execution)
- Pool: `1000000000000000000` wei
- Protocol close time: Unix `1790983718`
- Terminal snapshot transaction: `0x7dca52781068caf78ce1f1a3de9cb9852507290a52201ea50bfb86fe86902ae4`
- Discovery transaction: `0xa4d3934cc63ae02e18673160d102029611ec2ce0889559675edc8a599cf0adb4`; terminal commit `7fd1a60b01f91b314f59955a4e4d4e80d8edf11d`, tree `b4eecafa9be2f2006ce1b709d6857b07069b4608`, snapshot digest `ce878c7f881f10af455d5d6baf5f9ca6d29f783a3a64bcfb80a51de546d7116e`, frontier `1/1`
- Changed-file record: `README`, old SHA `c57eff55`, old size `12`, new SHA `980a0d5f`, new size `13`, record digest `574529d186072605c501609fa5c4afe295d5cd3c368385a545556f678054bcb8`
- Manifest transaction: `0x126f42df6e0fcc834e24fa9cae84c35053e870d5cd6ff71c88bfbee9517dce86`; frozen root `7fa05a6831fcc8ca8d67310a8156f23d8044681b2dba600cc9f4ca90c52821e3`
- Shard construction transaction: `0x4d6d35a9e0eb1fe3f85316606454b5f5d115a1e635dbbab0be01a365a1b2618b`; one bounded shard
- Shard audit transaction: `0x800e3fc9fe636956a6af4f9e72eb95c65142e9da9bc9ed754283979d60b59cd7`; status `AUDITED`, criterion `0` SATISFIED, source digest `20db2a123d94c61f4121b404c9e6ed0066da37335930391a4ca32e736cb74d19`, certificate digest `1aeced8d1e2991120aaf5959c4355a3ff2d1142c6591ad8e31570ebe659b03e4`
- Junction construction transaction: `0x0e16cb30ed094b81ffef0215783890f23e658f4ced58ab43746a2b155da7142d`; zero junctions, as expected for one shard with no reported cross-shard interface
- COMPLETE settlement transaction: `0x2b825c46735d9d3d6fb39a6d004f20b1ab51b2abc14aa78ea5d80daa6e4beeab`; finalized at `1791018268`, pool zeroed, implementer credited `1 GEN`, certificate root `c73532154031613455a4980166fbba95dd1d1d0deeedc398d28131510df53e01`, settlement digest `1a69efb46dd53688be0e008bcd110817ea6fafeefa6a26e88c17cd0227476bc4`
- Implementer withdrawal transaction: `0xc31b8034032faaf9decb413fe3a1f75942373ad4972f34214cf8bbd02f4bbc7f`; internal balance changed from `1 GEN` to `0`
- Replay-safe no-op withdrawal transaction: `0xca8d4cbe0ddcb83761eab4b3271d7ee2679a2195e978b8adc94462ec4ca7eefb`; finalized successfully with internal balance remaining `0`

Every final-contract transaction above reached `FINALIZED`, `MAJORITY_AGREE`, with successful execution. The release contract therefore has a complete live path from funded launch through immutable discovery, manifest, shard audit, the applicable zero-junction branch, COMPLETE settlement, native transfer, and replay-safe withdrawal.

## Coverage status

| Scenario | Evidence |
| --- | --- |
| Launch and escrow | Live on both deployments; final release transaction above |
| Multiple sponsors | Live on superseded transformation `0`, with exact per-sponsor readback |
| Terminal snapshot and bounded discovery | Live on the final release; the one-record fixture completed in one bounded batch |
| Frozen manifest, shards, and substantive audit | Live on the final release with roots and digests above |
| Junction handling | Live zero-junction branch on both deployments; no junction audit existed for the single-shard fixture |
| COMPLETE settlement and implementer withdrawal | Live on the final release, including replay-safe no-op withdrawal |
| FAILED settlement and sponsor accounting | Live on the superseded deployment; the corrected final source proves sponsor withdrawal in Direct Mode |
| Source unavailable with no economic movement | Direct Mode regression |
| Unresolved expiry after grace | Direct Mode regression; live execution would require the protocol's 30-day grace period |
| Wrong network, signature rejection, account switch, accepted/finalized distinction, execution errors, and refresh recovery | Frontend regression suite; finalized live execution-error presentation also exercised by the pre-close guard |
