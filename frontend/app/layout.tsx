import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Header } from "@/components/header";
import { TransactionDrawer } from "@/components/tx-drawer";

export const metadata: Metadata = {
  title: "STRATA — Hierarchical software transformation consensus",
  description: "Consensus-verify repository-scale software transformations on GenLayer.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><Providers><Header/><main>{children}</main><TransactionDrawer/></Providers></body></html>;
}
