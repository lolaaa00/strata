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

export const MIN_CLOSE_LEAD_SECONDS = 65 * 60;
export const MAX_CLOSE_LEAD_SECONDS = 120 * 24 * 60 * 60 - 5 * 60;

export function validateCloseTime(value: string, nowMillis = Date.now()): number {
  const closeAt = unixFromLocal(value);
  const now = Math.floor(nowMillis / 1000);
  if (closeAt < now + MIN_CLOSE_LEAD_SECONDS) {
    throw new Error("Choose a close time at least 65 minutes from now.");
  }
  if (closeAt > now + MAX_CLOSE_LEAD_SECONDS) {
    throw new Error("Choose a close time less than 120 days from now.");
  }
  return closeAt;
}

export function localDateTimeValue(millis: number): string {
  const date = new Date(millis);
  const part = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${part(date.getMonth() + 1)}-${part(date.getDate())}T${part(date.getHours())}:${part(date.getMinutes())}`;
}
