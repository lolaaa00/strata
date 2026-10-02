export type CriterionResult = "SATISFIED" | "VIOLATED" | "AMBIGUOUS" | "NOT_RELEVANT";
export type TransformationStatus = "OPEN" | "DISCOVERING" | "MANIFEST_READY" | "AUDITING" | "JUNCTIONS_READY" | "READY_TO_FINALIZE" | "INCONCLUSIVE" | "COMPLETE" | "FAILED" | "EXPIRED";

export type Transformation = {
  id: number;
  repo: string;
  target_ref: string;
  baseline_commit: string;
  baseline_tree: string;
  title: string;
  objective: string;
  criteria: string[];
  implementer_wallet: string;
  creator: string;
  status: TransformationStatus;
  close_at: number;
  pool_wei: string;
  total_funded_wei: string;
  terminal_commit: string;
  terminal_tree: string;
  terminal_snapshot_digest: string;
  frontier_head: number;
  frontier_tail: number;
  change_count: number;
  manifest_root: string;
  shard_count: number;
  junction_count: number;
  certificate_root: string;
  final_result: string;
  settlement_digest: string;
  settlement: null | {
    result: string;
    criteria?: Record<string, CriterionResult>;
    certificate_root?: string;
    pool_wei: string;
    implementer_allocation: string;
    sponsor_allocations: Record<string, string>;
    finalized_at: number;
  };
};

export type ChangeRecord = { index: number; path: string; change_type: string; old_sha: string; new_sha: string; old_size: number; new_size: number; record_digest: string };
export type Shard = { index: number; change_indices: number[]; status: string; source_digest: string; certificate_digest: string; criteria: Record<string, CriterionResult>; interfaces_changed: string[]; dependencies: string[]; rationale: string };
export type Junction = { index: number; interface_id: string; provider_shard: number; consumer_shard: number; status: string; criteria: Record<string, CriterionResult>; rationale: string; certificate_digest: string };

export type TxStage = "submitted" | "pending" | "accepted" | "finalized_unverified" | "finalized" | "failed" | "undetermined" | "canceled" | "timeout";
export type TxRecord = { hash: string; label: string; stage: TxStage; createdAt: number; statusName?: string; executionName?: string };
