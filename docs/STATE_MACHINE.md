# State machine

```text
OPEN
  │ implementer checkpoints before close
  │ close reached + checkpoint present
  ▼
DISCOVERING
  │ changed-file frontier empty
  ▼
MANIFEST_READY
  │ start declared-scope traversal
  ▼
SCOPE_DISCOVERING
  │ scope frontier empty
  ▼
EVIDENCE_PROCESSING
  │ every scoped file fetched, hash-verified, and parsed
  ▼
EVIDENCE_READY
  │ deterministic evidence shard packing
  ▼
AUDITING
  │ all shards audited + source-backed dependency graph fixed
  ▼
JUNCTIONS_READY ──────────┐
  │ all junctions audited │ no junctions
  ▼                       ▼
READY_TO_FINALIZE ◄────────┘
  │ propose_certificate
  ├─ unresolved coverage or aggregate → INCONCLUSIVE
  └─ decisive aggregate → PROVISIONAL (escrow locked)
                              │ challenge in fixed 15-minute window
                              ▼
                          CHALLENGED
                              │ after window, review full challenge set
                              ├─ unresolved → INCONCLUSIVE
                              └─ supported → READY_TO_SETTLE

PROVISIONAL (unchallenged) ─ after window ─┐
READY_TO_SETTLE ────────────────────────────┤ settle_certificate
                                           ├─ COMPLETE → implementer credit
                                           └─ FAILED → sponsor credits
```

`start_discovery` never reads the post-close branch tip. It uses only the last valid pre-close checkpoint. PROVISIONAL and READY_TO_SETTLE cannot be expired into a refund. Terminal economic states are COMPLETE, FAILED, and EXPIRED. All credits remain pull-based.
