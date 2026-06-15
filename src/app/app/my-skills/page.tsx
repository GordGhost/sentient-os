import { getMySkills } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { MySkillsBoard } from "@/components/app/MySkillsBoard";
import { GhostLink } from "@/components/ui/primitives";

export const dynamic = "force-dynamic";

export default async function MySkillsPage() {
  const grouped = await getMySkills();
  return (
    <div>
      <PageHeader
        code="03 // Creator"
        title="My Skills"
        subtitle="Everything you've forged — drafts, submissions, published packages, and the archive."
        action={<GhostLink href="/app/create">▸ Create Skill</GhostLink>}
      />
      <MySkillsBoard grouped={grouped} />
    </div>
  );
}
