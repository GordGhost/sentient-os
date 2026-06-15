import { listSkills } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { MarketplaceGrid } from "@/components/app/MarketplaceGrid";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const skills = await listSkills({ publishedOnly: true });
  return (
    <div>
      <PageHeader
        code="02 // Marketplace"
        title="Skill Marketplace"
        subtitle="Installable, verifiable skill packages. Every listing maps to a real folder in the GitHub repo — install straight into your agent."
      />
      <MarketplaceGrid skills={skills} />
    </div>
  );
}
