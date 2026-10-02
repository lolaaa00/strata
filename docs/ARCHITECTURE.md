# Architecture

STRATA is a two-part application: a Next.js browser frontend and one GenLayer Intelligent Contract. The frontend is transport and presentation. The contract is authoritative for escrow, discovery, evidence roots, certificates and balances.

## Horizontal scaling

A repository-scale transformation cannot safely be stuffed into one validator prompt. STRATA therefore keeps a persistent discovery frontier. Every `advance_discovery` call processes at most four tree-pair tasks. A subtree whose baseline and terminal Git SHA match is skipped without inspecting descendants. Different subtrees are expanded until changed blobs are found.

The complete changed-file set is then sorted canonically and committed. Shards are packed deterministically by file count and source-size budget. No sponsor or implementer chooses a convenient evidence subset.

## Semantic layers

Shard validators classify bounded source evidence against all frozen acceptance criteria. They also emit canonical interface/dependency identifiers. The contract deterministically constructs junctions from identifiers that cross shard boundaries. Junction validators then inspect both source shards and classify compatibility.

Global finalization is deterministic; it does not ask a final LLM to summarize summaries.

## Economic state

Sponsors escrow GEN. COMPLETE credits the implementer. FAILED and EXPIRED credit sponsors pro-rata. INCONCLUSIVE moves nothing. Every transfer is pull-based through `withdraw`.
