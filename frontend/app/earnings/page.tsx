"use client";

import { useEffect, useState } from "react";
import { getBalance, withdraw } from "@/lib/contract";
import { useWallet } from "@/hooks/use-wallet";
import { useTransactions } from "@/hooks/use-transactions";
import { formatGen } from "@/lib/utils";

export default function EarningsPage() {
  const wallet = useWallet(); const tx = useTransactions(); const [balance, setBalance] = useState<bigint>(0n); const [error, setError] = useState<string | null>(null); const [busy, setBusy] = useState(false);
  useEffect(() => {
    const address = wallet.address;
    queueMicrotask(() => {
      if (!address) { setBalance(0n); return; }
      void getBalance(address).then(setBalance).catch((e) => setError(e instanceof Error ? e.message : "Unable to read balance."));
    });
  }, [wallet.address]);
  async function claim() {
    if (!wallet.provider || !wallet.address) return; if (!wallet.correctNetwork) { setError("Switch to Studionet first."); return; }
    setBusy(true); setError(null); try { const hash = await withdraw(wallet.provider, wallet.address); tx.track(String(hash), "Withdraw STRATA balance"); } catch (e) { setError(e instanceof Error ? e.message : "Withdrawal failed."); } finally { setBusy(false); }
  }
  return <div className="shell"><div className="hero"><div><div className="eyebrow">Pull-based settlement</div><h1>Claim only after consensus is final.</h1><p>STRATA never pushes GEN during semantic settlement. Successful implementer payouts and sponsor refunds become claimable balances first.</p></div><div className="hero-card"><div><span className="muted">Claimable balance</span><h2 style={{fontSize:42}}>{formatGen(balance)}</h2></div><button className="btn" disabled={!wallet.connected || balance <= 0n || busy} onClick={() => void claim()}>{busy ? "Submitting…" : "Withdraw"}</button></div></div>{error ? <div className="notice error">{error}</div> : null}{!wallet.connected ? <div className="empty">Connect the wallet whose STRATA balance you want to inspect.</div> : null}</div>;
}
