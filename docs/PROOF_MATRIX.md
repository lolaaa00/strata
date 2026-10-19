# Proof matrix

| Claim | Repository evidence | Final deployed-contract evidence |
| --- | --- | --- |
| No application backend | Architecture guard and frontend tree | Public browser bundle uses direct Studionet RPC; no authoritative application service |
| Studionet 61999 | Network guard | Finalized deployment and lifecycle transactions at `0xacD37F7db1beC0d071B80D74994038A9563daE96` |
| Frozen baseline and delivery checkpoint | Direct Mode identity and ancestry tests | Both launches and pre-close checkpoints bound baseline `553c2077…` to delivery `7fd1a60…` |
| Bounded complete discovery | Contract tests and mutation kills | Both frontiers completed `1/1`, each with exactly one changed `README`; pre-close discovery rolled back |
| Scoped evidence and source identity | Git blob hash, size, mode and scope regressions | Both readbacks show one `COMPLETE` scoped evidence record and exact old/new blob IDs |
| Deterministic dependency graph | Syntax and unresolved-import tests | Both fixtures had zero material dependency edges and a committed graph root |
| Semantic shard agreement | Validator-adversarial Direct Mode tests | Both sole shards `AUDITED`, criterion `0` `SATISFIED`, with source and certificate digests |
| Cross-shard junction agreement | Direct Mode adversarial and mutation tests | Zero-junction branch exercised; this one-file fixture does not demonstrate a live junction audit |
| Provisional certificate and challenge | Boundary and disagreement tests | Both reached `PROVISIONAL COMPLETE`; transformation `1` stored and reviewed a committed-evidence challenge |
| Escrow settlement and replay safety | Conservation, FAILED/expiry, and withdrawal tests | Both pools zeroed after `COMPLETE`, each `1 GEN` credited and withdrawn, both replay calls returned `nothing_to_withdraw`, final internal balance `0` |
| Exact reviewed source deployed | Integrity guard and SHA-256 | Deployed 31-method source matched `5d305dfe94247b857b83aa995b28ceb9274b9af24765db12febcf8beb36f88bd` exactly |
| Public frontend uses final contract | Frontend build and transaction tests | Vercel deployment `dpl_B8Yvdnh4BBh9s3iamhe1WdDxE9C7` ready, public alias HTTP 200, shipped bundle embeds final address |
| Source outage, unresolved expiry, multi-shard junctions | Direct Mode and mutation evidence | No live claim for these branches on the small public fixture |
