"use client";

import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { addFunding, advanceDiscovery, auditJunction, auditShard, buildJunctions, buildShards, expireUnresolved, finalizeManifest, finalizeTransformation, getChangeRecord, getJunction, getShard, getTransformation, startDiscovery } from "@/lib/contract";
import type { ChangeRecord, Junction, Shard, Transformation } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { formatGen, parseGen, shortHash } from "@/lib/utils";

export default function TransformationPage() {
  const params = useParams<{ id: string }>(); const id = Number(params.id); const wallet = useWallet(); const tx = useTransactions();
  const [item, setItem] = useState<Transformation | null>(null); const [changes, setChanges] = useState<ChangeRecord[]>([]); const [shards, setShards] = useState<Shard[]>([]); const [junctions, setJunctions] = useState<Junction[]>([]); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState<string | null>(null); const [funding, setFunding] = useState("1");
  const refresh = useCallback(async () => {
    try {
      const next = await getTransformation(id); setItem(next); if (!next) return;
      const [c, s, j] = await Promise.all([
        Promise.all(Array.from({ length: next.change_count }, (_, i) => getChangeRecord(id, i))),
        Promise.all(Array.from({ length: next.shard_count }, (_, i) => getShard(id, i))),
        Promise.all(Array.from({ length: next.junction_count }, (_, i) => getJunction(id, i))),
      ]);
      setChanges(c.filter(Boolean) as ChangeRecord[]); setShards(s.filter(Boolean) as Shard[]); setJunctions(j.filter(Boolean) as Junction[]); setError(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to read transformation."); }
  }, [id]);
  useEffect(() => { queueMicrotask(() => void refresh()); }, [refresh]);
  const call = useCallback(async (label: string, fn: () => Promise<unknown>) => {
    setError(null); if (!wallet.provider || !wallet.address) { setError("Connect a wallet first."); return; } if (!wallet.correctNetwork) { setError("Switch to Studionet first."); return; }
    setBusy(label); try { const hash = await fn(); tx.track(String(hash), label); window.setTimeout(() => void refresh(), 2500); } catch (e) { setError(e instanceof Error ? e.message : `${label} failed.`); } finally { setBusy(null); }
  }, [wallet.provider, wallet.address, wallet.correctNetwork, tx, refresh]);
  const frontierRemaining = useMemo(() => item ? Math.max(0, item.frontier_tail - item.frontier_head) : 0, [item]);
  if (!item) return <div className="shell"><div className="empty">{error || "Reading transformation…"}</div></div>;
  return <div className="shell stack">
    <div><div className="eyebrow">Transformation #{item.id}</div><div className="spread"><h1 style={{fontSize:"58px",marginBottom:8}}>{item.title}</h1><span className="pill">{STATUS_LABELS[item.status] ?? item.status}</span></div><p className="muted">{item.objective}</p></div>
    {error ? <div className="notice error">{error}</div> : null}
    <div className="data-grid"><div className="data-box"><span>Escrow</span>{formatGen(item.total_funded_wei)}</div><div className="data-box"><span>Repository</span>{item.repo}</div><div className="data-box"><span>Baseline</span><span className="mono">{shortHash(item.baseline_commit)}</span></div><div className="data-box"><span>Terminal</span><span className="mono">{shortHash(item.terminal_commit)}</span></div></div>
    <div className="card"><h3>Acceptance criteria</h3><ol className="criteria">{item.criteria.map((criterion, i) => <li key={i}>{criterion}{item.settlement?.criteria?.[String(i)] ? <span className="pill" style={{marginLeft:10}}>{item.settlement.criteria[String(i)]}</span> : null}</li>)}</ol></div>
    <div className="card stack"><div className="spread"><div><h3>Protocol progression</h3><p className="muted">Anyone can advance deterministic work after close. Each write remains bounded.</p></div><button className="btn btn-ghost" onClick={() => void refresh()}>Refresh</button></div>
      <div className="timeline">
        <div className="step"><span className="step-index">1</span><div><strong>Freeze terminal state</strong><div className="muted">First post-close consensus snapshot of {item.target_ref}.</div></div>{item.status === "OPEN" ? <button className="btn" disabled={!!busy} onClick={() => void call("Start discovery", () => startDiscovery(wallet.provider!, wallet.address!, id))}>Start</button> : <span className="pill pill-ok">{item.terminal_commit ? "Frozen" : "Waiting"}</span>}</div>
        <div className="step"><span className="step-index">2</span><div><strong>Discover Git-tree delta</strong><div className="muted">Frontier remaining: {frontierRemaining} · changed leaves: {item.change_count}</div></div>{item.status === "DISCOVERING" && frontierRemaining > 0 ? <button className="btn" disabled={!!busy} onClick={() => void call("Advance discovery", () => advanceDiscovery(wallet.provider!, wallet.address!, id, 4))}>Advance</button> : item.status === "DISCOVERING" ? <button className="btn" disabled={!!busy} onClick={() => void call("Finalize manifest", () => finalizeManifest(wallet.provider!, wallet.address!, id))}>Freeze manifest</button> : <span className="pill">{item.manifest_root ? "Complete" : "Pending"}</span>}</div>
        <div className="step"><span className="step-index">3</span><div><strong>Build bounded evidence shards</strong><div className="muted">{item.shard_count} shards</div></div>{item.status === "MANIFEST_READY" ? <button className="btn" disabled={!!busy} onClick={() => void call("Build shards", () => buildShards(wallet.provider!, wallet.address!, id))}>Build</button> : <span className="pill">{item.shard_count ? "Built" : "Pending"}</span>}</div>
        <div className="step"><span className="step-index">4</span><div><strong>Audit shards</strong><div className="muted">Structured criterion verdicts plus cross-scope dependency hints.</div></div><span className="pill">{shards.filter((x) => x.status === "AUDITED").length}/{item.shard_count}</span></div>
        <div className="step"><span className="step-index">5</span><div><strong>Audit junctions</strong><div className="muted">Cross-shard interface compatibility where evidence says it matters.</div></div>{item.status === "AUDITING" && item.shard_count > 0 && shards.every((x) => x.status === "AUDITED") ? <button className="btn" disabled={!!busy} onClick={() => void call("Build junctions", () => buildJunctions(wallet.provider!, wallet.address!, id))}>Build junctions</button> : <span className="pill">{junctions.filter((x) => x.status === "AUDITED").length}/{item.junction_count}</span>}</div>
        <div className="step"><span className="step-index">6</span><div><strong>Finalize certificate</strong><div className="muted">Deterministic aggregation releases implementer escrow only when every criterion is satisfied.</div></div>{["READY_TO_FINALIZE","JUNCTIONS_READY","AUDITING","INCONCLUSIVE"].includes(item.status) ? <button className="btn" disabled={!!busy} onClick={() => void call("Finalize transformation", () => finalizeTransformation(wallet.provider!, wallet.address!, id))}>Finalize</button> : <span className="pill">{item.final_result || "Pending"}</span>}</div>
      </div>
    </div>
    {shards.length ? <div className="card stack"><h3>Evidence shards</h3>{shards.map((shard) => <div className="spread" key={shard.index}><div><strong>Shard {shard.index}</strong><div className="muted">{shard.change_indices.length} changed files · {shard.interfaces_changed.length} interface signals · {shard.dependencies.length} dependencies</div></div><div className="row"><span className="pill">{shard.status}</span>{shard.status !== "AUDITED" ? <button className="btn btn-ghost" disabled={!!busy} onClick={() => void call(`Audit shard ${shard.index}`, () => auditShard(wallet.provider!, wallet.address!, id, shard.index))}>Audit</button> : null}</div></div>)}</div> : null}
    {junctions.length ? <div className="card stack"><h3>Cross-shard junctions</h3>{junctions.map((junction) => <div className="spread" key={junction.index}><div><strong>{junction.interface_id}</strong><div className="muted">Shard {junction.provider_shard} → shard {junction.consumer_shard}</div></div><div className="row"><span className="pill">{junction.status}</span>{junction.status !== "AUDITED" ? <button className="btn btn-ghost" disabled={!!busy} onClick={() => void call(`Audit junction ${junction.index}`, () => auditJunction(wallet.provider!, wallet.address!, id, junction.index))}>Audit</button> : null}</div></div>)}</div> : null}
    {changes.length ? <div className="card"><h3>Changed-file manifest</h3>{changes.slice(0, 30).map((change) => <div className="spread" style={{padding:"9px 0",borderBottom:"1px solid rgba(255,255,255,.05)"}} key={change.index}><span className="mono">{change.path}</span><span className="pill">{change.change_type}</span></div>)}{changes.length > 30 ? <p className="muted">Showing first 30 of {changes.length}. The complete manifest is committed on-chain.</p> : null}</div> : null}
    <div className="card stack"><h3>Funding & recovery</h3><div className="row"><input value={funding} onChange={(e) => setFunding(e.target.value)} aria-label="GEN funding amount" style={{background:"#0d1115",border:"1px solid var(--line)",borderRadius:12,color:"white",padding:"11px",width:140}}/><button className="btn btn-ghost" disabled={item.status !== "OPEN" || !!busy} onClick={() => void call("Add funding", () => addFunding(wallet.provider!, wallet.address!, id, parseGen(funding)))}>Add GEN</button><button className="btn btn-danger" disabled={!!busy || ["COMPLETE","FAILED","EXPIRED"].includes(item.status)} onClick={() => void call("Expire unresolved", () => expireUnresolved(wallet.provider!, wallet.address!, id))}>Expire after grace</button></div><p className="muted">Source outages and unresolved consensus never silently move GEN. After the grace period sponsors can recover an unresolved pool.</p></div>
    {item.settlement ? <div className="card"><div className="eyebrow">Final certificate</div><h2>{item.settlement.result}</h2><div className="mono">{item.certificate_root}</div><p className="muted">Settlement digest: <span className="mono">{item.settlement_digest}</span></p></div> : null}
  </div>;
}
