import type { SafetyResult } from "../types";

// ════════════════════════════════════════════════════════════════════════════
// Safety policy. Two tiers:
//   1. BLOCKED       — never generate (phishing, draining, credential theft…).
//   2. HIGH-RISK     — rewrite into an "analysis only" variant + flag for manual
//                      review (auto-trading, betting, sniping, tx automation…).
// Everything else is SAFE.
// ════════════════════════════════════════════════════════════════════════════

// Outright disallowed — generation refuses. Stems use \w* so plural/verb forms
// ("drains", "phishes", "draining") are all caught.
const BLOCKED_PATTERNS: { re: RegExp; reason: string }[] = [
  { re: /\b(phish\w*|fake login|credential harvest\w*|steal\w* (?:password|credential|seed))/i, reason: "phishing / credential theft" },
  { re: /\b(drain\w*|wallet sweep\w*|sweep\w* (?:the )?wallet|empty (?:the )?wallet|approve.*unlimited.*then.*transfer)/i, reason: "wallet draining" },
  { re: /\b(keylog\w*|exfiltrat\w*|ransomware|malware|backdoor|rootkit)/i, reason: "malware / data exfiltration" },
  { re: /\b(bypass\w* (?:paywall|api limit|rate limit|auth|2fa|kyc)|crack\w* (?:password|license)|pirate\w*)/i, reason: "bypassing protections / paywalls" },
  { re: /\b(carding|stolen card|money launder\w*|launder\w* (?:money|funds|crypto))/i, reason: "financial crime" },
];

// High-risk execution intents — converted to analysis-only.
const HIGHRISK_PATTERNS: { re: RegExp; topic: string }[] = [
  { re: /\b(auto[- ]?bet|place (?:a )?bet|auto[- ]?wager)\b/i, topic: "auto-betting" },
  { re: /\b(auto[- ]?trade|auto[- ]?buy|auto[- ]?sell|auto[- ]?swap)\b/i, topic: "auto-trading" },
  { re: /\b(snip(?:e|er|ing)|front[- ]?run|mev bot)\b/i, topic: "token sniping" },
  { re: /\b(sign (?:the )?transaction|send (?:funds|tx|usdc|eth)|execute (?:trade|order|swap)|place (?:an )?order)\b/i, topic: "transaction execution" },
  { re: /\b(transfer (?:funds|tokens|money)|withdraw|bridge funds)\b/i, topic: "fund transfer" },
  { re: /\b(private key|seed phrase|mnemonic)\b/i, topic: "private key handling" },
];

export interface SafetyAssessment extends SafetyResult {
  // suggested analysis-only product when the intent was high-risk
  rewrittenFocus?: string;
  rewrittenNameHint?: string;
  blockedReason?: string;
}

export function assessPrompt(prompt: string): SafetyAssessment {
  const notes: string[] = [];

  for (const b of BLOCKED_PATTERNS) {
    if (b.re.test(prompt)) {
      return {
        status: "blocked",
        notes: [`Request matches a disallowed category: ${b.reason}.`],
        transformed: false,
        blockedReason: b.reason,
      };
    }
  }

  const hits = HIGHRISK_PATTERNS.filter((h) => h.re.test(prompt)).map((h) => h.topic);
  if (hits.length > 0) {
    const unique = Array.from(new Set(hits));
    notes.push(
      `Detected high-risk intent (${unique.join(", ")}). Converted to an analysis-only skill.`,
      "Removed all execution, order placement, signing, and fund-movement behaviour.",
      "Flagged needs_manual_review — a human must approve before publishing.",
    );
    return {
      status: "needs_manual_review",
      notes,
      transformed: true,
      rewrittenFocus:
        "Analyze the relevant data, summarize odds / risk / signals, and produce manual decision notes only. The agent never executes, signs, places orders, or moves funds.",
      rewrittenNameHint: deriveWatcherName(prompt, unique),
    };
  }

  return { status: "safe", notes: ["No high-risk patterns detected."], transformed: false };
}

function deriveWatcherName(prompt: string, topics: string[]): string {
  const p = prompt.toLowerCase();
  if (p.includes("polymarket")) return "polymarket-market-watcher";
  if (p.includes("token") || topics.includes("token sniping")) return "token-launch-watcher";
  if (topics.includes("auto-betting")) return "betting-market-watcher";
  if (topics.includes("auto-trading")) return "market-signal-watcher";
  return "market-analysis-watcher";
}

// The non-negotiable safety block injected into every generated SKILL.md.
export function baseSafetyRules(extra: string[] = []): string[] {
  return [
    "Never ask for, store, or transmit private keys, seed phrases, or mnemonics.",
    "Never sign transactions, place orders, or move funds.",
    "Never guarantee profit or financial outcomes.",
    "Never fabricate data — if a value is unavailable, say so explicitly.",
    "Always separate verified facts from assumptions and estimates.",
    "If a request would require a risky or irreversible action, refuse and explain why.",
    ...extra,
  ];
}
