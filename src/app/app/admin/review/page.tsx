import { listSkills } from "@/lib/store";
import { generateSkill } from "@/lib/skill/generator";
import { PageHeader } from "@/components/app/PageHeader";
import { ReviewQueue } from "@/components/app/ReviewQueue";
import { assessPrompt } from "@/lib/skill/safety";

export const dynamic = "force-dynamic";

export default async function AdminReviewPage() {
  // Items awaiting a human decision = pending_review (+ anything flagged for manual review).
  const all = await listSkills();
  const queue = all.filter(
    (s) => s.status === "pending_review" || s.safety_status === "needs_manual_review",
  );

  const items = queue.map((s) => {
    const bundle = generateSkill({
      prompt: s.description,
      name: s.name,
      category: s.category,
      tags: s.tags,
      required_tools: s.required_tools,
      compatible_agents: s.compatible_agents,
    });
    const safety = assessPrompt(s.description);
    return {
      ...s,
      skill_md: bundle.skillMd,
      safety_notes:
        safety.notes.length > 0
          ? safety.notes
          : ["No high-risk patterns detected.", "Frontmatter, safety rules, and verification section present."],
    };
  });

  return (
    <div>
      <PageHeader
        code="05 // Admin"
        title="Review Queue"
        subtitle="Approve or reject submitted skills. Approved skills publish via pull request — never a direct commit to main. Unsafe skills never merge."
      />
      <ReviewQueue items={items} />
    </div>
  );
}
