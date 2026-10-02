"use client";

import { useTransactions } from "@/hooks/use-transactions";
import { explorerTx } from "@/lib/genlayer";

export function TransactionDrawer() {
  const { transactions, clearTerminal } = useTransactions();
  if (!transactions.length) return null;
  return <aside className="tx-drawer">
    <div className="tx-title"><strong>Transaction activity</strong><button onClick={clearTerminal}>Clear settled</button></div>
    {transactions.slice(0, 5).map((tx) => <a key={tx.hash} href={explorerTx(tx.hash)} target="_blank" rel="noreferrer" className="tx-row">
      <span>{tx.label}</span><span className={`pill stage-${tx.stage}`}>{tx.stage.replaceAll("_", " ")}</span>
    </a>)}
  </aside>;
}
