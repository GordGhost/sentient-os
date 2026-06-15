import { PageHeader } from "@/components/app/PageHeader";
import { CreateSkillForm } from "@/components/app/CreateSkillForm";
import { hasLLM } from "@/lib/env";

export default function CreatePage() {
  return (
    <div>
      <PageHeader
        code="01 // Create"
        title="Skill Forge"
        subtitle={
          hasLLM()
            ? "Connected to Claude — prompts are authored by the model, then re-validated by the safety engine."
            : "Running the deterministic generator (no LLM key set). Output is still a full, validated SKILL.md package."
        }
      />
      <CreateSkillForm />
    </div>
  );
}
