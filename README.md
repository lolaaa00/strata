# STRATA

**Hierarchical consensus for repository-scale software transformations on GenLayer.**

STRATA is a browser frontend plus one GenLayer Intelligent Contract. A sponsor freezes a repository, target branch, baseline commit, acceptance criteria, implementer wallet, deadline and GEN escrow. After close, GenLayer validators freeze the settlement-state target tip and the contract walks the Git tree incrementally. Unchanged subtrees disappear by SHA equality. Changed leaves become a complete manifest, the manifest is packed into bounded source shards, validators audit those shards, cross-shard interface junctions are checked, and deterministic aggregation produces one transformation certificate.

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
BOUNDED SOURCE SHARDS
  ↓
SEMANTIC SHARD CERTIFICATES
  ↓
CROSS-SHARD JUNCTION CERTIFICATES
  ↓
DETERMINISTIC GLOBAL CERTIFICATE
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

1. **Launch** — freeze repo, target ref, baseline, objective, criteria, implementer, close time and escrow.
2. **Terminal snapshot** — after close, validators freeze the first consensus-observed target tip and prove it descends from the baseline.
3. **Tree discovery** — callers repeatedly process a bounded frontier. Equal subtree SHAs are skipped; only changed subtrees are expanded.
4. **Manifest** — changed blobs are committed into one canonical manifest root.
5. **Shards** — deterministic packing bounds file count and source bytes per semantic audit.
6. **Shard consensus** — leader and validators independently classify every acceptance criterion and emit bounded cross-scope interface identifiers.
7. **Junctions** — the contract deterministically pairs changed interfaces with dependent shards; validators audit compatibility using both immutable source shards.
8. **Certificate** — deterministic aggregation marks each criterion SATISFIED, VIOLATED, AMBIGUOUS or NOT_RELEVANT.
9. **Settlement** — all criteria SATISFIED releases escrow to the implementer. Any VIOLATED criterion refunds sponsors. Unresolved work moves no GEN and can expire after grace.
10. **Withdrawal** — balances are pull-based and zeroed before transfer.

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

The hardened replacement is deployed on Studionet 61999 at `0x3f353ed233c471926E309a8D23517a8C80Cc1Bff`. Its retrieved source exactly matches commit `20c0d75a5a5bb346bb86d2076f11a160104e3468`; funded lifecycle verification is in progress until the protocol close window elapses. Exact status and historical evidence are recorded in `docs/DEPLOYMENT.md` and `docs/LIVE_VALIDATION.md`.

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
