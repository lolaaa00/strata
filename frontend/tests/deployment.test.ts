import { describe, expect, it, vi } from "vitest";

describe("deployment guard", () => {
  it("rejects missing address", async () => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS;
    const mod = await import("@/lib/deployment");
    expect(mod.CONTRACT_ADDRESS).toBeNull();
    expect(() => mod.requireContractAddress()).toThrow(/not configured/i);
  });
  it("accepts a valid address", async () => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_STRATA_CONTRACT_ADDRESS = "0x1111111111111111111111111111111111111111";
    const mod = await import("@/lib/deployment");
    expect(mod.requireContractAddress()).toBe("0x1111111111111111111111111111111111111111");
  });
});
