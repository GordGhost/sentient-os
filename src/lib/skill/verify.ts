import type { InstallStatus, SkillTest } from "../types";

// ════════════════════════════════════════════════════════════════════════════
// Install + function verification. Pure functions so they run identically on
// the client (instant feedback) and on the server (authoritative result).
// ════════════════════════════════════════════════════════════════════════════

export interface InstallVerifyInput {
  output: string; // raw text the user pasted from their agent
  expectedCode: string;
  slug: string;
  version: string;
}

export interface InstallVerifyResult {
  valid: boolean;
  status: InstallStatus;
  checks: { label: string; passed: boolean }[];
}

export function verifyInstall(input: InstallVerifyInput): InstallVerifyResult {
  const text = input.output || "";
  const lc = text.toLowerCase();

  const checks = [
    { label: "Verification code matches", passed: text.includes(input.expectedCode) },
    { label: "Skill name present", passed: lc.includes(input.slug.toLowerCase()) },
    {
      label: "Version present",
      passed: lc.includes(input.version.toLowerCase()),
    },
    { label: "Reports status: installed", passed: /status[\s"':]*installed/i.test(text) || /\binstalled\b/i.test(lc) },
  ];

  const valid = checks.every((c) => c.passed);
  return { valid, status: valid ? "installed" : "failed", checks };
}

export interface FunctionVerifyResult {
  valid: boolean;
  status: InstallStatus;
  presentFields: string[];
  missingFields: string[];
}

export function verifyFunction(output: string, test: SkillTest): FunctionVerifyResult {
  const lc = (output || "").toLowerCase();
  const present: string[] = [];
  const missing: string[] = [];
  for (const field of test.expected_output_fields) {
    // accept "field:", "field =", or a JSON key "field"
    const re = new RegExp(`(?:"|\\b)${escapeRe(field)}(?:"|\\b)\\s*[:=]`, "i");
    if (re.test(lc) || lc.includes(`"${field.toLowerCase()}"`)) present.push(field);
    else missing.push(field);
  }
  const valid = missing.length === 0 && present.length > 0;
  return { valid, status: valid ? "working" : "failed", presentFields: present, missingFields: missing };
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
