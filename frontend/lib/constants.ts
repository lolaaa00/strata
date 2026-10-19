export const NETWORK = {
  name: "GenLayer Studionet",
  chainId: 61999,
  chainHex: "0xF22F",
  rpcUrl: "https://studio.genlayer.com/api",
  explorerUrl: "https://explorer-studio.genlayer.com",
  currency: "GEN",
} as const;

export const STATUS_LABELS: Record<string, string> = {
  OPEN: "Open for funding",
  DISCOVERING: "Discovering repository changes",
  MANIFEST_READY: "Manifest ready",
  SCOPE_DISCOVERING: "Discovering verification scope",
  EVIDENCE_PROCESSING: "Verifying scoped evidence",
  EVIDENCE_READY: "Evidence coverage ready",
  AUDITING: "Auditing evidence shards",
  JUNCTIONS_READY: "Auditing cross-shard junctions",
  READY_TO_FINALIZE: "Ready to finalize",
  PROVISIONAL: "Provisional certificate — challenge window",
  CHALLENGED: "Certificate challenged",
  READY_TO_SETTLE: "Challenge reviewed — ready to settle",
  INCONCLUSIVE: "Inconclusive — retry or expire",
  COMPLETE: "Complete",
  FAILED: "Failed",
  EXPIRED: "Expired / refunded",
};
