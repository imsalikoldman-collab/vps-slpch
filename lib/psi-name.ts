export function normalizePsiName(value: string): string {
  return value.replace(/^▣\s*/u, "").trim();
}
