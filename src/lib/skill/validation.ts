import type { ValidationResult } from "../types";

// ════════════════════════════════════════════════════════════════════════════
// Pre-publish validation. Parses the SKILL.md frontmatter (no YAML dependency —
// a small, forgiving parser) and runs the required structural + safety checks.
// ════════════════════════════════════════════════════════════════════════════

export function parseFrontmatter(md: string): Record<string, string> | null {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return null;
  const out: Record<string, string> = {};
  for (const rawLine of m[1].split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) return null; // malformed line
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    out[key] = val;
  }
  return out;
}

const PRIVATE_KEY_RE =
  /\b(ask|request|provide|enter|paste|share|send)\b[^.\n]{0,40}\b(private key|seed phrase|mnemonic)\b/i;

const DANGER_RE =
  /\b(drain|phish|credential theft|wallet draining|bypass (?:paywall|auth|2fa|kyc)|keylogger|exfiltrat|ransomware)\b/i;

export function validateSkillMd(
  md: string,
  opts: { tools: string[] },
): ValidationResult {
  const checks: ValidationResult["checks"] = [];
  const fm = parseFrontmatter(md);

  const has = (re: RegExp) => re.test(md);

  checks.push({ label: "Valid YAML frontmatter", passed: !!fm });
  checks.push({ label: "Frontmatter: name", passed: !!fm?.name, detail: fm?.name });
  checks.push({ label: "Frontmatter: description", passed: !!fm?.description });
  checks.push({
    label: "Frontmatter: tags",
    passed: !!fm?.tags && fm.tags.includes("["),
  });
  checks.push({
    label: "Frontmatter: version (semver)",
    passed: !!fm?.version && /^\d+\.\d+\.\d+$/.test(fm.version),
    detail: fm?.version,
  });
  checks.push({ label: "Required Tools section", passed: has(/##\s+Required Tools/i) });
  checks.push({
    label: "Tools listed (or 'none')",
    passed:
      opts.tools.length > 0
        ? opts.tools.every((t) => md.includes(t))
        : /No external tools required/i.test(md),
  });
  checks.push({ label: "Safety Rules section", passed: has(/##\s+Safety Rules/i) });
  checks.push({ label: "Output Format section", passed: has(/##\s+Output Format/i) });
  checks.push({ label: "Install Verification section", passed: has(/##\s+Install Verification/i) });
  checks.push({
    label: "Does not request private keys",
    passed: !PRIVATE_KEY_RE.test(md),
    detail: PRIVATE_KEY_RE.test(md) ? "found a request for secret material" : undefined,
  });
  checks.push({
    label: "No dangerous instructions",
    passed: !DANGER_RE.test(md),
  });

  const status: ValidationResult["status"] = checks.every((c) => c.passed)
    ? "passed"
    : "failed";

  return { status, checks };
}
