import { describe, expect, it } from "vitest";
import { formatGen, localDateTimeValue, parseGen, shortAddress, shortHash, unixFromLocal, validateCloseTime } from "@/lib/utils";

describe("utils", () => {
  it("formats GEN", () => expect(formatGen(1500000000000000000n)).toBe("1.500 GEN"));
  it("parses whole GEN", () => expect(parseGen("2")).toBe(2000000000000000000n));
  it("parses fractional GEN", () => expect(parseGen("0.125")).toBe(125000000000000000n));
  it("rejects invalid GEN", () => expect(() => parseGen("1e3")).toThrow());
  it("shortens addresses", () => expect(shortAddress("0x1234567890123456789012345678901234567890")).toContain("…"));
  it("shortens hashes", () => expect(shortHash("abcdef1234567890")).toBe("abcdef1…4567890"));
  it("parses local datetime", () => expect(unixFromLocal("2026-10-10T12:00")).toBeGreaterThan(0));
  it("rejects bad datetime", () => expect(() => unixFromLocal("bad")).toThrow());
  it("rejects a close time inside the safety window", () => expect(() => validateCloseTime("2026-10-04T11:00", new Date("2026-10-04T10:00:00").getTime())).toThrow("65 minutes"));
  it("accepts a close time beyond the safety window", () => expect(validateCloseTime("2026-10-04T12:00", new Date("2026-10-04T10:00:00").getTime())).toBe(unixFromLocal("2026-10-04T12:00")));
  it("formats a local datetime input value", () => expect(localDateTimeValue(new Date(2026, 9, 4, 12, 5).getTime())).toBe("2026-10-04T12:05"));
});
