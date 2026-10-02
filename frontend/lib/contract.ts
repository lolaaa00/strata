"use client";

import { readClient, walletClient } from "./genlayer";
import { requireContractAddress } from "./deployment";
import type { ChangeRecord, Junction, Shard, Transformation } from "./types";
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
export async function getBalance(wallet: string): Promise<bigint> {
  const raw = await readClient().readContract({ address: requireContractAddress(), functionName: "get_balance", args: [wallet.toLowerCase()] });
  return BigInt(String(raw || "0"));
}

export async function launchTransformation(provider: Eip1193Provider, account: `0x${string}`, input: {
  repo: string; targetRef: string; baselineCommit: string; title: string; objective: string; criteria: string[]; implementer: string; closeAt: number; value: bigint;
}) {
  return writer(provider, account).writeContract({
    address: requireContractAddress(), functionName: "launch_transformation",
    args: [input.repo, input.targetRef, input.baselineCommit, input.title, input.objective, JSON.stringify(input.criteria), input.implementer, input.closeAt], value: input.value,
  });
}
export async function addFunding(provider: Eip1193Provider, account: `0x${string}`, id: number, value: bigint) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "add_funding", args: [BigInt(id)], value });
}
export async function startDiscovery(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "start_discovery", args: [BigInt(id)], value: 0n });
}
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
export async function finalizeTransformation(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "finalize_transformation", args: [BigInt(id)], value: 0n });
}
export async function expireUnresolved(provider: Eip1193Provider, account: `0x${string}`, id: number) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "expire_unresolved", args: [BigInt(id)], value: 0n });
}
export async function withdraw(provider: Eip1193Provider, account: `0x${string}`) {
  return writer(provider, account).writeContract({ address: requireContractAddress(), functionName: "withdraw", args: [], value: 0n });
}
