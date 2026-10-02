"use client";

import Link from "next/link";
import { useWallet } from "@/hooks/use-wallet";
import { shortAddress } from "@/lib/utils";

export function Header() {
  const wallet = useWallet();
  return <header className="site-header">
    <Link href="/" className="brand"><span className="brand-mark">S</span><span>STRATA</span></Link>
    <nav className="nav-links">
      <Link href="/">Transformations</Link>
      <Link href="/launch">Launch</Link>
      <Link href="/earnings">Earnings</Link>
    </nav>
    <div className="wallet-cluster">
      {wallet.connected && !wallet.correctNetwork ? <button className="btn btn-warn" onClick={() => void wallet.switchNetwork()}>Switch to Studionet</button> : null}
      {!wallet.connected ? <button className="btn" onClick={() => void wallet.connect()} disabled={wallet.connecting}>{wallet.connecting ? "Connecting…" : "Connect wallet"}</button> : <><span className="wallet-chip">{shortAddress(wallet.address ?? "")}</span><button className="btn btn-ghost" onClick={() => void wallet.disconnect()}>Disconnect</button></>}
    </div>
  </header>;
}
