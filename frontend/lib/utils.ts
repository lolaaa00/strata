export function shortAddress(value: string, chars = 5) { return value ? `${value.slice(0, chars + 2)}…${value.slice(-chars)}` : ""; }
export function shortHash(value: string, chars = 7) { return value ? `${value.slice(0, chars)}…${value.slice(-chars)}` : "—"; }
export function formatGen(wei: string | bigint) {
  const value = typeof wei === "bigint" ? wei : BigInt(wei || "0");
  const whole = value / 10n ** 18n;
  const frac = ((value % 10n ** 18n) * 1000n) / 10n ** 18n;
  return `${whole}.${frac.toString().padStart(3, "0")} GEN`;
}
export function parseGen(value: string): bigint {
  const trimmed = value.trim();
  if (!/^\d+(?:\.\d{0,18})?$/.test(trimmed)) throw new Error("Enter a valid GEN amount.");
  const [whole, fraction = ""] = trimmed.split(".");
  return BigInt(whole) * 10n ** 18n + BigInt((fraction + "0".repeat(18)).slice(0, 18));
}
export function unixFromLocal(value: string): number {
  const millis = new Date(value).getTime();
  if (!Number.isFinite(millis)) throw new Error("Enter a valid close time.");
  return Math.floor(millis / 1000);
}
