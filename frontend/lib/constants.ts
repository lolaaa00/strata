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
  AUDITING: "Auditing evidence shards",
  JUNCTIONS_READY: "Auditing cross-shard junctions",
  READY_TO_FINALIZE: "Ready to finalize",
  INCONCLUSIVE: "Inconclusive — retry or expire",
  COMPLETE: "Complete",
  FAILED: "Failed",
  EXPIRED: "Expired / refunded",
};
