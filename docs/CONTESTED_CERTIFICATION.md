# Verifiable delivery and contested certification

## Trust boundary

STRATA treats GitHub as the public immutable object namespace and GenLayer consensus as the observer and semantic decision boundary. A GitHub response is never accepted solely because it is valid JSON: commit, comparison, tree, blob SHA, size, and decoded Git blob identity are checked. Repository text is untrusted prompt data.

## Deadline checkpoint

The implementer calls `submit_delivery_checkpoint` before `close_at`. Validators independently prove the exact commit and tree, ancestry from the baseline, and reachability from the frozen target branch at checkpoint time. `start_discovery` does not read the branch and cannot select a later tip. The contract does not claim to reconstruct an unsubmitted historical branch tip.

## Scope and evidence

Launch commits one to five canonical paths or directory prefixes. Bounded scope traversal includes unchanged files, with 64 files and 256 frontier tasks as hard limits. Each evidence record binds criterion indices, path, role, baseline/delivery SHA, change class, verified source digest, dependency references, coverage, and unresolved gaps. Missing paths, malformed source, binary or oversized blobs, unsupported dynamic imports, and unresolved local modules prevent positive coverage.

## Dependency graph

The contract uses bounded line parsing for Python imports and JavaScript/TypeScript imports, exports, CommonJS references, and dynamic-import detection. Relative providers resolve against the committed scope file set. Each canonical edge records consumer, provider, literal reference, consumer SHA, evidence identity, classification, resolution, and whether semantic compatibility is required. Junction creation uses these edges rather than model labels.

## Certificates and challenges

A decisive aggregate first enters `PROVISIONAL`; funds do not move. The fixed 15-minute window accepts at most eight distinct, permissioned challenges against committed evidence. Sponsors may challenge COMPLETE and the implementer may challenge FAILED. After the full window, `review_challenge` re-fetches frozen source and uses structured validator consensus on every decision-bearing criterion. Unresolved evidence produces INCONCLUSIVE. `settle_certificate` is permissionless and performs the existing pull-balance allocation once.

Certificate roots commit the checkpoint, terms, complete change manifest, declared scope, evidence coverage, dependency graph, shard certificates, junction certificates, and criterion results.

## Limits

Static analysis intentionally supports a bounded module subset. Package alias configuration, runtime reflection, computed dynamic imports, generated dependency injection, and material references outside the declared scope are not proven compatible; they resolve to explicit gaps. A scope certificate describes only its declared repository paths.
