"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { TxRecord } from "@/lib/types";
import { fetchTransaction, terminalStage } from "@/lib/transaction";

const KEY = "strata:transactions:v1";
type TxContextValue = { transactions: TxRecord[]; track: (hash: string, label: string) => void; clearTerminal: () => void };
const TxContext = createContext<TxContextValue | null>(null);
function load(): TxRecord[] { try { const raw = localStorage.getItem(KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.hash === "string" && typeof x.stage === "string") : []; } catch { return []; } }
export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<TxRecord[]>(() => typeof window === "undefined" ? [] : load());
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(transactions)); } catch {} }, [transactions]);
  useEffect(() => {
    const active = transactions.some((x) => !terminalStage(x.stage)); if (!active) return;
    const timer = window.setInterval(async () => {
      const next = await Promise.all(transactions.map((x) => terminalStage(x.stage) ? x : fetchTransaction(x)));
      setTransactions(next);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [transactions]);
  const track = useCallback((hash: string, label: string) => setTransactions((items) => [{ hash, label, stage: "submitted", createdAt: Date.now() }, ...items.filter((x) => x.hash !== hash)]), []);
  const clearTerminal = useCallback(() => setTransactions((items) => items.filter((x) => !terminalStage(x.stage))), []);
  const value = useMemo(() => ({ transactions, track, clearTerminal }), [transactions, track, clearTerminal]);
  return <TxContext.Provider value={value}>{children}</TxContext.Provider>;
}
export function useTransactions() { const value = useContext(TxContext); if (!value) throw new Error("useTransactions must be used inside TransactionProvider"); return value; }
