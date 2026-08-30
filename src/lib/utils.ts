// Minimal `cn` helper (clsx-lite): joins strings, arrays and {class: bool} maps.
// Used by animate-ui components copied into src/components/animate-ui.
type ClassInput =
  | string
  | number
  | null
  | undefined
  | false
  | ClassInput[]
  | Record<string, boolean | undefined | null>;

export function cn(...inputs: ClassInput[]): string {
  const out: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === "string" || typeof input === "number") {
      out.push(String(input));
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) out.push(nested);
    } else if (typeof input === "object") {
      for (const key in input) {
        if (input[key]) out.push(key);
      }
    }
  }
  return out.join(" ");
}
