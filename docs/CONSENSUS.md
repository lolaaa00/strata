# Consensus model

STRATA uses the Equivalence Principle according to the output type.

## Exact source facts

`strict_eq` is used when independent validators should reproduce exactly the same normalized value: launch identity, terminal target state, tree pairs and blob-backed shard source.

## Shard semantic judgment

A custom `run_nondet` boundary independently asks leader and validator to judge the same immutable shard evidence. Consensus requires exact equality on:

- every criterion status;
- canonical `interfaces_changed` identifiers;
- canonical `dependencies` identifiers.

Explanation wording is presentation-only.

## Junction semantic judgment

A second custom boundary independently examines the provider and consumer shard source for one deterministic interface junction. Consensus requires exact equality on junction status and every criterion status. Rationale wording may differ.

## Deterministic aggregation

For each criterion:

1. any `VIOLATED` certificate wins;
2. otherwise any `AMBIGUOUS` makes the criterion unresolved;
3. otherwise any `SATISFIED` satisfies it;
4. otherwise it is `NOT_RELEVANT`.

Every criterion must be SATISFIED for COMPLETE. Any VIOLATED criterion produces FAILED. Everything else is INCONCLUSIVE and moves no GEN.
