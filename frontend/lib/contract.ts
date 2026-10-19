"use client";

import { readClient, walletClient } from "./genlayer";
import { requireContractAddress } from "./deployment";
import type { Challenge, ChangeRecord, DependencyEdge, EvidenceRecord, Junction, Shard, Transformation } from "./types";
import type { Eip1193Provider } from "./eip1193";

function parse<T>(raw: unknown): T | null {
  if (typeof raw !== "string" || !raw) return null;
  try { return JSON.parse(raw) as T; } catch { return null; }
}
function writer(provider: Eip1193Provider, account: `0x${string}`) { return walletClient(provider, account); }

export async function getNextTransformationId(): Promise<number> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_next_transformation_id", args: [] });
  return Number(raw ?? 0);
}
export async function getTransformation(id: number): Promise<Transformation | null> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_transformation", args: [BigInt(id)] });
  return parse<Transformation>(raw);
}
export async function getChangeRecord(id: number, index: number): Promise<ChangeRecord | null> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_change_record", args: [BigInt(id), index] });
  return parse<ChangeRecord>(raw);
}
export async function getShard(id: number, index: number): Promise<Shard | null> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_shard", args: [BigInt(id), index] });
  return parse<Shard>(raw);
}
export async function getJunction(id: number, index: number): Promise<Junction | null> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_junction", args: [BigInt(id), index] });
  return parse<Junction>(raw);
}
export async function getEvidenceRecord(id: number, index: number): Promise<EvidenceRecord | null> {
  return parse<EvidenceRecord>(await readClient().readContract({ address: requireContractAddress(), functionName: "get_evidence_record", args: [BigInt(id), index] }));
}
export async function getDependencyEdge(id: number, index: number): Promise<DependencyEdge | null> {
  return parse<DependencyEdge>(await readClient().readContract({ address: requireContractAddress(), functionName: "get_dependency_edge", args: [BigInt(id), index] }));
}
export async function getChallenge(id: number, index: number): Promise<Challenge | null> {
  return parse<Challenge>(await readClient().readContract({ address: requireContractAddress(), functionName: "get_challenge", args: [BigInt(id), index] }));
}
export async function getBalance(wallet: string): Promise<bigint> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_balance", args: [wallet.toLowerCase()] });
  return BigInt(String(raw || "0"));
}

export async function launchTransformation(provider: Eip1193Provider, account: `0x${string}`, input: {
  repo: string; targetRef: string; baselineCommit: string; title: string; objective: string; criteria: string[]; scope: string[]; implementer: string; closeAt: number; value: bigint;
}) {
  return writer(provider, account).writeContract({
    address: requireContractAddress(), functionName: "launch_transformation",
    args: [input.repo, input.targetRef, input.baselineCommit, input.title, input.objective, JSON.stringify(input.criteria), JSON.stringify(input.scope), input.implementer, input.closeAt], value: input.value,
  });
}
export async function addFunding(provider: Eip1193Provider, account: `0x${string}`, id: number, value: bigint) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "add_funding", args: [BigInt(id)], value });
}
export async function startDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "start_discovery", args: [BigInt(id)], value: 0n });
}
export async function submitDeliveryCheckpoint(provider: Eip1193Provider, account: `0x${string}`, id: number, commit: string) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "submit_delivery_checkpoint", args: [BigInt(id), commit], value: 0n }); }
export async function startScopeDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "start_scope_discovery", args: [BigInt(id)], value: 0n }); }
export async function advanceScopeDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number, tasks = 4) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "advance_scope_discovery", args: [BigInt(id), tasks], value: 0n }); }
export async function finalizeScopeDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "finalize_scope_discovery", args: [BigInt(id)], value: 0n }); }
export async function processEvidence(provider: Eip1193Provider, account: `0x${string}`, id: number, files = 4) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "process_evidence", args: [BigInt(id), files], value: 0n }); }
export async function finalizeEvidence(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "finalize_evidence", args: [BigInt(id)], value: 0n }); }
export async function advanceDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number, tasks = 4) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "advance_discovery", args: [BigInt(id), tasks], value: 0n });
}
export async function finalizeManifest(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "finalize_manifest", args: [BigInt(id)], value: 0n });
}
export async function buildShards(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "build_shards", args: [BigInt(id)], value: 0n });
}
export async function auditShard(provider: Eip1193Provider, account: `0x${string}`, id: number, shard: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "audit_shard", args: [BigInt(id), shard], value: 0n });
}
export async function buildJunctions(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "build_junctions", args: [BigInt(id)], value: 0n });
}
export async function auditJunction(provider: Eip1193Provider, account: `0x${string}`, id: number, junction: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "audit_junction", args: [BigInt(id), junction], value: 0n });
}
export async function proposeCertificate(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "propose_certificate", args: [BigInt(id)], value: 0n }); }
export async function challengeCertificate(provider: Eip1193Provider, account: `0x${string}`, id: number, criterion: number, path: string, reason: string) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "challenge_certificate", args: [BigInt(id), criterion, path, reason], value: 0n }); }
export async function reviewChallenge(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "review_challenge", args: [BigInt(id)], value: 0n }); }
export async function settleCertificate(provider: Eip1193Provider, account: `0x${string}`, id: number) { return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "settle_certificate", args: [BigInt(id)], value: 0n }); }
export async function expireUnresolved(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "expire_unresolved", args: [BigInt(id)], value: 0n });
}
export async function withdraw(provider: Eip1193Provider, account: `0x${string}`) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "withdraw", args: [], value: 0n });
}
