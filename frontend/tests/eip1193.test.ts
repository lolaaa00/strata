import { describe, expect, it, vi } from "vitest";
import { currentChainId, ensureStudionet, type Eip1193Provider } from "@/lib/eip1193";

describe("EIP-1193 network handling", () => {
  it("parses chain id", async () => {
    const provider = { request: vi.fn(async () => "0xF22F") } as Eip1193Provider;
    await expect(currentChainId(provider)).resolves.toBe(61999);
  });
  it("does nothing when already on Studionet", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => method === "eth_chainId" ? "0xF22F" : undefined);
    await ensureStudionet({ request } as Eip1193Provider);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it("requests a network switch", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => method === "eth_chainId" ? "0x1" : null);
    await ensureStudionet({ request } as Eip1193Provider);
    expect(request).toHaveBeenCalledWith({ method: "wallet_switchEthereumChain", params: [{ chainId: "0xF22F" }] });
  });
  it("adds Studionet when wallet returns 4902", async () => {
    const request = vi.fn(async ({ method }: { method: string }) => {
      if (method === "eth_chainId") return "0x1";
      if (method === "wallet_switchEthereumChain") { const e = new Error("missing") as Error & { code: number }; e.code = 4902; throw e; }
      return null;
    });
    await ensureStudionet({ request } as Eip1193Provider);
    expect(request.mock.calls.some(([x]) => x.method === "wallet_addEthereumChain")).toBe(true);
  });
});
