import { listSkills } from "@/lib/store";
import { generateSkill } from "@/lib/skill/generator";
import { PageHeader } from "@/components/app/PageHeader";
import { VerifyFlow, type VerifiableSkill } from "@/components/app/VerifyFlow";

export const dynamic = "force-dynamic";

export default async function VerifyPage() {
  const skills = await listSkills({ publishedOnly: true });

  // Derive each skill's expected output fields from its package (Supabase: read
  // expected_output_fields from the stored test.json).
  const verifiable: VerifiableSkill[] = skills.map((s) => {
    const bundle = generateSkill({ prompt: s.description, name: s.name, category: s.category });
    return {
      slug: s.slug,
      name: s.name,
      version: s.version,
      expected_output_fields: bundle.test.expected_output_fields,
    };
  });

  return (
    <div>
      <PageHeader
        code="04 // Verify"
        title="Install Verification"
        subtitle="No fake marketplace. Prove a skill is genuinely installed AND functional in your agent before it earns the Working badge."
      />

      <div className="panel mb-6 grid gap-px bg-line-bright md:grid-cols-3">
        {[
          { n: "1", t: "Handshake", d: "Generate a unique code, run the verification prompt in your agent, paste the output back." },
          { n: "2", t: "Function test", d: "Run the skill on a sample task; we check every required output field exists." },
          { n: "3", t: "Verdict", d: "Both pass → Working. Anything missing → Failed, with the exact reason." },
        ].map((s) => (
          <div key={s.n} className="bg-bg p-5">
            <div className="font-grot text-2xl font-bold text-green/30">{s.n}</div>
            <div className="mt-1 font-mono text-[11px] uppercase tracking-[0.15em] text-txt">{s.t}</div>
            <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-dim">{s.d}</p>
          </div>
        ))}
      </div>

      <VerifyFlow skills={verifiable} />
    </div>
  );
}
