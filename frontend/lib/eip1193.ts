import { NETWORK } from "./constants";

export type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>;
  on?(event: string, listener: (...args: unknown[]) => void): void;
  removeListener?(event: string, listener: (...args: unknown[]) => void): void;
};

declare global { interface Window { ethereum?: Eip1193Provider } }

export function injectedProvider(): Eip1193Provider | null {
  return typeof window !== "undefined" ? window.ethereum ?? null : null;
}

export async function currentChainId(provider: Eip1193Provider): Promise<number> {
  const raw = String(await provider.request({ method: "eth_chainId" }));
  return Number.parseInt(raw, 16);
}

export async function ensureStudionet(provider: Eip1193Provider): Promise<void> {
  const chainId = await currentChainId(provider);
  if (chainId === NETWORK.chainId) return;
  try {
    await provider.request({ method: "wallet_switchEthereumChain", params: [{ chainId: NETWORK.chainHex }] });
  } catch (error) {
    const code = Number((error as { code?: unknown })?.code ?? 0);
    if (code !== 4902) throw error;
    await provider.request({
      method: "wallet_addEthereumChain",
      params: [{
        chainId: NETWORK.chainHex,
        chainName: NETWORK.name,
        nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
        rpcUrls: [NETWORK.rpcUrl],
        blockExplorerUrls: [NETWORK.explorerUrl],
      }],
    });
  }
}
