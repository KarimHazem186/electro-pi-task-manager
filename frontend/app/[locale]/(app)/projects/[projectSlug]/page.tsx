import { ProjectDetails } from "./_details";

export default async function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ projectSlug: string }>;
}) {
  const { projectSlug } = await params;
  return <ProjectDetails projectSlug={projectSlug} />;
}
