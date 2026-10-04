"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { launchTransformation } from "@/lib/contract";
import { localDateTimeValue, MAX_CLOSE_LEAD_SECONDS, MIN_CLOSE_LEAD_SECONDS, parseGen, validateCloseTime } from "@/lib/utils";

export default function LaunchPage() {
  const wallet = useWallet(); const tx = useTransactions(); const router = useRouter();
  const [busy, setBusy] = useState(false); const [error, setError] = useState<string | null>(null);
  const [criteria, setCriteria] = useState(["", ""]);
  const [closeAt, setCloseAt] = useState("");
  const [closeBounds, setCloseBounds] = useState({ min: "", max: "" });
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = Date.now();
      setCloseBounds({
        min: localDateTimeValue(now + MIN_CLOSE_LEAD_SECONDS * 1000),
        max: localDateTimeValue(now + MAX_CLOSE_LEAD_SECONDS * 1000),
      });
      setCloseAt((value) => value || localDateTimeValue(now + 2 * 60 * 60 * 1000));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(null);
    if (!wallet.provider || !wallet.address) { setError("Connect an injected wallet first."); return; }
    if (!wallet.correctNetwork) { setError("Switch to GenLayer Studionet first."); return; }
    const form = new FormData(event.currentTarget);
    const cleaned = criteria.map((x) => x.trim()).filter(Boolean);
    try {
      setBusy(true);
      const hash = await launchTransformation(wallet.provider, wallet.address, {
        repo: String(form.get("repo") || "").trim(), targetRef: String(form.get("targetRef") || "").trim(), baselineCommit: String(form.get("baseline") || "").trim(), title: String(form.get("title") || "").trim(), objective: String(form.get("objective") || "").trim(), criteria: cleaned, implementer: String(form.get("implementer") || "").trim(), closeAt: validateCloseTime(String(form.get("closeAt") || "")), value: parseGen(String(form.get("funding") || "")),
      });
      tx.track(String(hash), "Launch transformation"); router.push("/");
    } catch (e) { setError(e instanceof Error ? e.message : "Launch failed."); }
    finally { setBusy(false); }
  }
  return <div className="shell"><div className="section-title"><div><div className="eyebrow">New transformation</div><h1 style={{fontSize:"52px"}}>Freeze the terms before the work is judged.</h1></div></div>
    <form className="card stack" onSubmit={submit}>
      <div className="form-grid">
        <div className="field"><label htmlFor="repo">GitHub repository</label><input id="repo" name="repo" placeholder="owner/repository" required/><span className="hint">Public repository only. Validators read GitHub directly.</span></div>
        <div className="field"><label htmlFor="targetRef">Target branch</label><input id="targetRef" name="targetRef" defaultValue="main" required/></div>
        <div className="field full"><label htmlFor="baseline">Baseline commit SHA</label><input id="baseline" name="baseline" className="mono" pattern="[0-9a-fA-F]{40}" placeholder="40-character Git commit" required/></div>
        <div className="field"><label htmlFor="title">Title</label><input id="title" name="title" maxLength={120} required/></div>
        <div className="field"><label htmlFor="implementer">Implementer wallet</label><input id="implementer" name="implementer" pattern="0x[0-9a-fA-F]{40}" required/></div>
        <div className="field full"><label htmlFor="objective">Transformation objective</label><textarea id="objective" name="objective" maxLength={1800} required/></div>
        {criteria.map((value, index) => <div className="field full" key={index}><label htmlFor={`criterion-${index}`}>Acceptance criterion {index + 1}</label><input id={`criterion-${index}`} value={value} maxLength={420} onChange={(e) => setCriteria((all) => all.map((x, i) => i === index ? e.target.value : x))} required={index === 0}/></div>)}
        {criteria.length < 5 ? <div className="field full"><button type="button" className="btn btn-ghost" onClick={() => setCriteria((x) => [...x, ""])}>Add criterion</button></div> : null}
        <div className="field"><label htmlFor="closeAt">Close at</label><input id="closeAt" name="closeAt" type="datetime-local" value={closeAt} min={closeBounds.min} max={closeBounds.max} onChange={(event) => setCloseAt(event.target.value)} required/><span className="hint">Must be at least 65 minutes and less than 120 days from now. Times use your device’s local timezone.</span></div>
        <div className="field"><label htmlFor="funding">Initial funding (GEN)</label><input id="funding" name="funding" inputMode="decimal" defaultValue="1" required/></div>
      </div>
      {wallet.error || error ? <div className="notice error">{wallet.error || error}</div> : null}
      <div className="row"><button className="btn" disabled={busy}>{busy ? "Submitting…" : "Launch on Studionet"}</button>{!wallet.connected ? <button type="button" className="btn btn-ghost" onClick={() => void wallet.connect()}>Connect wallet</button> : !wallet.correctNetwork ? <button type="button" className="btn btn-warn" onClick={() => void wallet.switchNetwork()}>Switch network</button> : null}</div>
    </form>
  </div>;
}
