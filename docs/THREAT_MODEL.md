# Threat model

## Untrusted

- sponsor and implementer assertions;
- repository source text, comments and strings;
- GitHub API availability;
- any individual leader output;
- browser localStorage and frontend display state.

## Protocol assumptions

- GenLayer consensus/finality is trusted at the protocol layer;
- GitHub public Git object identifiers are treated as the source namespace being audited;
- source unavailability is distinct from negative evidence.

## Defences

- baseline must exist and be on target history before escrowed launch succeeds;
- terminal tip must descend from baseline;
- branch, comparison base/final-commit, commit, tree and blob response identities must match the immutable objects requested;
- tree discovery is complete relative to the frozen baseline/terminal trees and never silently truncates;
- duplicate or unsafe tree paths and unsupported Git object modes fail closed;
- executable-bit and symlink-mode changes are committed even when blob content is unchanged;
- source limits fail closed;
- semantic outputs use fixed schemas and enum sets;
- source strings are explicitly treated as data, not instructions;
- cross-shard dependencies are audited separately;
- economic settlement is deterministic after certified criterion results;
- unresolved/source-unavailable paths move no GEN;
- balances are zeroed before external transfer.

## Known bounded-scope limitations

Binary/non-UTF8 blobs, extremely wide trees, individual oversized files, or transformations beyond configured frontier/manifest/shard limits cannot be certified by this release. They fail closed instead of being silently omitted.
