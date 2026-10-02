# State machine

```text
OPEN
  │ close reached
  ▼
DISCOVERING
  │ frontier empty + manifest frozen
  ▼
MANIFEST_READY
  │ deterministic shard packing
  ▼
AUDITING
  │ all shards audited
  ▼
JUNCTIONS_READY ──────────┐
  │ all junctions audited │ no junctions
  ▼                       ▼
READY_TO_FINALIZE ◄────────┘
  │
  ├─ all criteria satisfied → COMPLETE
  ├─ any criterion violated → FAILED
  └─ otherwise → INCONCLUSIVE
                    │ retry audits
                    └──────────────► AUDITING / JUNCTIONS_READY

Any unresolved non-terminal state after the grace period → EXPIRED
```

Terminal economic states are COMPLETE, FAILED and EXPIRED.
