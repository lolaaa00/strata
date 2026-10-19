# STRATA

**Hierarchical consensus for repository-scale software transformations on GenLayer.**

STRATA is a browser frontend plus one GenLayer Intelligent Contract. A sponsor freezes a repository, target branch, baseline commit, acceptance criteria, implementer wallet, deadline and GEN escrow. Before close, the implementer submits a consensus-verified delivery checkpoint. After close, discovery uses only that immutable checkpoint and walks the Git tree incrementally. Unchanged subtrees disappear by SHA equality. Changed leaves become a complete manifest, the manifest is packed into bounded source shards, validators audit those shards, cross-shard interface junctions are checked, and deterministic aggregation produces one transformation certificate.

The design goal is scale **across bounded transactions**, not one enormous prompt.

## Why GenLayer

Neither the sponsor nor implementer should unilaterally decide whether a large semantic migration is complete. STRATA uses validator consensus for the facts and judgments deterministic code cannot safely derive alone, then uses deterministic code for state transitions, root construction and GEN settlement.

## Architecture

```text
USER
  ↓
NEXT.JS FRONTEND
  ↓ injected EIP-1193 wallet
GENLAYER STRATA CONTRACT
  ↕ public GitHub evidence
CONSENSUS-VERIFIED TREE DISCOVERY
  ↓
COMPLETE CHANGED-FILE MANIFEST
  ↓
DECLARED SCOPE + UNCHANGED EVIDENCE
  ↓
SOURCE-BACKED DEPENDENCY GRAPH
  ↓
BOUNDED SOURCE SHARDS
  ↓
SEMANTIC SHARD CERTIFICATES
  ↓
CROSS-SHARD JUNCTION CERTIFICATES
  ↓
DETERMINISTIC PROVISIONAL CERTIFICATE
  ↓ 15-minute evidence challenge + reassessment
FINAL CERTIFICATE
  ↓
IMPLEMENTER RELEASE / SPONSOR REFUND
```

No application backend, database, server decision service, cron, queue or custodial signer exists.

## Studionet stack

| Layer | STRATA |
| --- | --- |
| Network | Studionet |
| Chain ID | `61999` / `0xF22F` |
| RPC | `https://studio.genlayer.com/api` |
| Explorer | `https://explorer-studio.genlayer.com` |
| Repository-local CLI | `0.39.1` |
| `genlayer-py` | `0.18.0` |
| `genlayer-test` | `0.29.2` from immutable upstream commit |
| `genvm-linter` | `0.11.1rc2` from immutable upstream commit |
| GenVM Direct Mode | `v0.3.0-rc7` with a three-line test adapter for the Studionet SDK surface |
| Studionet runner | `py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6` |
| `genlayer-js` | `1.1.8` |

## Protocol lifecycle

1. **Launch** — freeze repo, target ref, baseline, objective, criteria, 1–5 explicit scope paths, implementer, close time and escrow.
2. **Delivery checkpoint** — before close, only the implementer can checkpoint a commit. Validators verify its Git identity, tree, baseline ancestry, and reachability from the target branch. A later valid pre-close checkpoint replaces the earlier one.
3. **Tree discovery** — after close, discovery uses only the checkpoint. Callers process a bounded tree frontier and freeze the complete changed-file manifest.
4. **Scoped evidence** — a second bounded frontier enumerates changed and unchanged files under the declared scope. Every source blob is re-fetched by SHA and its real Git object hash is recomputed.
5. **Dependency graph** — bounded syntax handling extracts Python and JavaScript/TypeScript/JSX/TSX imports and re-exports. Local providers are resolved against the committed scoped tree; unresolved material references fail closed.
6. **Shards and junctions** — evidence is packed deterministically. Validators audit semantic criteria. Mandatory cross-shard junctions come from the source-backed graph; model hints cannot suppress them.
7. **Provisional certificate** — deterministic aggregation commits the checkpoint, terms, manifest, scope, evidence, graph, shard, junction, and criterion roots. Incomplete coverage can never propose COMPLETE.
8. **Challenge and reassessment** — escrow remains locked for a fixed 15-minute window. Sponsors may challenge provisional COMPLETE and the implementer may challenge provisional FAILED, using only committed evidence paths. Validators independently re-fetch and reassess the complete bounded challenge set.
9. **Settlement and withdrawal** — anyone can settle an unchallenged or reviewed certificate after the window. COMPLETE credits the implementer; FAILED refunds sponsors pro rata. Balances are pull-based and zeroed before transfer.

The application-level evidence challenge is separate from GenLayer's network transaction appeal mechanism.

## Bounded work

STRATA intentionally fails closed rather than silently truncating evidence.

- maximum frontier tasks: 512
- maximum discovered changed files: 512
- maximum immediate tree entries per node: 1,000
- maximum files per shard: 12
- maximum individual text blob: 24,000 bytes
- maximum source bytes per shard: 48,000 estimated / 52,000 decoded characters
- maximum shards: 96
- maximum junctions: 96
- maximum acceptance criteria: 5
- maximum declared scope entries: 5
- maximum scoped files: 64
- maximum scope frontier tasks: 256
- maximum deterministic dependency edges: 128
- maximum imports per file: 32
- maximum certificate challenges: 8
- fixed challenge window: 15 minutes

This supports focused transformations inside very large repositories while keeping each GenLayer operation auditable and bounded. It does **not** pretend an arbitrary multi-million-line transformation can be semantically consumed in one call.

## Consensus choices

STRATA deliberately does not use one equivalence method everywhere.

- `strict_eq`: reproducible GitHub facts, terminal identity, tree entries, source blobs.
- custom `run_nondet`: structured shard judgments and cross-shard junction judgments. Validators independently rerun the semantic task and must agree on the money-relevant categorical fields. Rationale wording may differ.
- deterministic code: manifest/shard/junction construction, criterion aggregation, commitments and settlement.

See `docs/CONSENSUS.md`.

## Local verification

```sh
npm ci
npm --prefix frontend ci
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r contract/requirements.txt

npm run check:network
npm run check:architecture
npm run check:cli
npm run check:integrity

genvm-lint setup --version v0.6.0-rc6
genvm-lint check contract/contracts/strata.py
python3 -m pytest contract/tests/direct -q
python3 contract/tests/mutation/run.py
npm --prefix frontend run lint
npm run frontend:typecheck
npm --prefix frontend run test
npm --prefix frontend run build
```

Direct Mode is explicitly pinned to GenVM `v0.3.0-rc7` in the test fixture.

## Deployment status

The post-audit final contract is deployed on Studionet 61999 at `0x3Ee9904EcdDa9bCfbc51fA2c6dE48E5C2004Aa00`. Its retrieved source matches commit `f93084f65f6713de47b1c4013fcdceba44b6d7f5` with canonical SHA-256 `e9e04f341f274baf1f3e042fa6899bd8a03f622fce86dcefed4ba7820a7d8a5d`. Transformation `0` completed discovery, manifest, shard consensus, the applicable zero-junction path, `COMPLETE` settlement, 1 GEN implementer withdrawal, and replay-safe zero-balance verification. Exact evidence is recorded in `docs/DEPLOYMENT.md` and `docs/LIVE_VALIDATION.md`.

Frontend builds require `NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS`.

Live frontend: `https://strata-genlayer.vercel.app`

## Repository

```text
contract/contracts/strata.py        Intelligent Contract
contract/tests/direct/              Direct Mode tests
contract/tests/mutation/            actual-source mutation gate
frontend/                            Next.js app
scripts/                             network / architecture / CLI / integrity gates
docs/                                protocol, threat model, proof and deployment docs
.github/workflows/ci.yml             Ubuntu + Windows + macOS verification
```
