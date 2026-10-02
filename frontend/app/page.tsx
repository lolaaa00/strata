"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CONTRACT_ADDRESS } from "@/lib/deployment";
import { getNextTransformationId, getTransformation } from "@/lib/contract";
import type { Transformation } from "@/lib/types";
import { STATUS_LABELS } from "@/lib/constants";
import { formatGen, shortHash } from "@/lib/utils";

export default function Home() {
  const [items, setItems] = useState<Transformation[]>([]);
  const [loading, setLoading] = useState(CONTRACT_ADDRESS !== null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!CONTRACT_ADDRESS) return;
    void (async () => {
      try {
        const next = await getNextTransformationId();
        const ids = Array.from({ length: Math.min(next, 12) }, (_, i) => next - i - 1);
        const results = await Promise.all(ids.map((id) => getTransformation(id)));
        setItems(results.filter(Boolean) as Transformation[]);
      } catch (e) { setError(e instanceof Error ? e.message : "Unable to read STRATA."); }
      finally { setLoading(false); }
    })();
  }, []);
  return <div className="shell">
    <section className="hero">
      <div>
        <div className="eyebrow">Hierarchical consensus for large software transformations</div>
        <h1>Certify the whole change, not a convenient slice.</h1>
        <p>STRATA freezes a repository baseline and settlement tip, discovers the complete Git-tree delta, partitions it into bounded evidence shards, audits cross-shard interfaces, and settles escrow from a reproducible certificate.</p>
        <div className="row"><Link className="btn" href="/launch">Launch transformation</Link><a className="btn btn-ghost" href="https://explorer-studio.genlayer.com" target="_blank" rel="noreferrer">Studionet explorer</a></div>
      </div>
      <div className="hero-card">
        <div><div className="eyebrow">Protocol shape</div><h2>Tree → shards → junctions → certificate</h2><p className="muted">Each consensus operation is bounded. Scale comes from resumable state, not giant prompts.</p></div>
        <div className="metric-grid"><div className="metric"><strong>61999</strong><span>Studionet</span></div><div className="metric"><strong>2</strong><span>custom semantic consensus layers</span></div><div className="metric"><strong>0</strong><span>application backends</span></div></div>
      </div>
    </section>
    {!CONTRACT_ADDRESS ? <div className="notice">This build is missing its STRATA contract address. Set <span className="mono">NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS</span> to enable live reads and writes.</div> : null}
    <div className="section-title"><div><h2>Recent transformations</h2><p>On-chain state read directly from STRATA.</p></div></div>
    {loading ? <div className="empty">Reading Studionet…</div> : error ? <div className="notice error">{error}</div> : !items.length ? <div className="empty">No transformations have been launched yet.</div> : <div className="grid">{items.map((item) => <Link href={`/transform/${item.id}`} className="card" key={item.id}>
      <div className="spread"><span className="pill">#{item.id}</span><span className="pill">{STATUS_LABELS[item.status] ?? item.status}</span></div>
      <h3>{item.title}</h3><p className="muted">{item.repo} · {item.target_ref}</p>
      <div className="data-grid"><div className="data-box"><span>Pool</span>{formatGen(item.total_funded_wei)}</div><div className="data-box"><span>Changes</span>{item.change_count}</div><div className="data-box"><span>Shards</span>{item.shard_count}</div><div className="data-box"><span>Terminal</span>{shortHash(item.terminal_commit)}</div></div>
    </Link>)}</div>}
  </div>;
}
