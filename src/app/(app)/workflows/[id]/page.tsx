import { notFound } from "next/navigation";
import { requireUser, isManagerOrAdmin } from "@/server/auth";
import { prisma } from "@/server/db";
import { PageHeader } from "@/components/page-header";
import {
  addTemplateTaskAction,
  deleteTemplateTaskAction,
  addTemplateDependencyAction,
  removeTemplateDependencyAction,
} from "@/app/actions/workflow";

export default async function WorkflowEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const canEdit = isManagerOrAdmin(user);

  const [template, teams] = await Promise.all([
    prisma.workflowTemplate.findUnique({
      where: { id },
      include: {
        tasks: {
          orderBy: { sequence: "asc" },
          include: {
            defaultTeam: { select: { name: true } },
            dependsOn: { include: { dependsOnTask: { select: { id: true, name: true } } } },
          },
        },
      },
    }),
    prisma.team.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!template) notFound();

  const addTask = addTemplateTaskAction.bind(null, id);

  return (
    <div>
      <PageHeader eyebrow="Workflow Template" title={template.name} />

      <div className="grid gap-4">
        <div className="overflow-hidden rounded-[17px] border border-line bg-white">
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="border-b border-line text-left text-[9px] font-extrabold uppercase tracking-wide text-muted">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Task</th>
                <th className="px-4 py-3">Team</th>
                <th className="px-4 py-3">Depends On</th>
                <th className="px-4 py-3">Duration</th>
                {canEdit && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody>
              {template.tasks.map((t) => (
                <tr key={t.id} className="border-b border-[#f0f3f6] last:border-b-0">
                  <td className="px-4 py-3 text-muted">{t.sequence}</td>
                  <td className="px-4 py-3 font-bold">{t.name}</td>
                  <td className="px-4 py-3 text-muted">{t.defaultTeam?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-muted">{t.dependsOn.map((d) => d.dependsOnTask.name).join(", ") || "—"}</td>
                  <td className="px-4 py-3 text-muted">{t.defaultDurationDays ? `${t.defaultDurationDays}d` : "—"}</td>
                  {canEdit && (
                    <td className="px-4 py-3 text-right">
                      <form action={deleteTemplateTaskAction.bind(null, id, t.id)}>
                        <button className="text-[10px] font-bold text-red">Remove</button>
                      </form>
                    </td>
                  )}
                </tr>
              ))}
              {template.tasks.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No tasks in this template yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {canEdit && (
          <>
            <div className="rounded-[17px] border border-line bg-white p-5">
              <h3 className="mb-3 text-sm font-extrabold">Add a task</h3>
              <form action={addTask} className="grid grid-cols-[2fr_1fr_1fr_auto] gap-2.5">
                <input name="name" required placeholder="Task name" className="h-10 rounded-[10px] border border-line px-3 text-[11px]" />
                <select name="teamId" className="h-10 rounded-[10px] border border-line px-2 text-[11px]">
                  <option value="">No team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <input name="durationDays" type="number" min="0" placeholder="Days" className="h-10 rounded-[10px] border border-line px-3 text-[11px]" />
                <button className="h-10 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c]">Add</button>
              </form>
            </div>

            <div className="rounded-[17px] border border-line bg-white p-5">
              <h3 className="mb-3 text-sm font-extrabold">Connect a dependency</h3>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  await addTemplateDependencyAction(id, String(formData.get("taskId")), String(formData.get("dependsOnTaskId")));
                }}
                className="grid grid-cols-[1fr_1fr_auto] gap-2.5"
              >
                <select name="taskId" required className="h-10 rounded-[10px] border border-line px-2 text-[11px]">
                  <option value="">This task…</option>
                  {template.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <select name="dependsOnTaskId" required className="h-10 rounded-[10px] border border-line px-2 text-[11px]">
                  <option value="">…depends on</option>
                  {template.tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <button className="h-10 rounded-[10px] bg-primary px-4 text-[11px] font-extrabold text-[#173f5c]">Connect</button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
