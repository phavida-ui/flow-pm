"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { deleteTaskAction } from "@/app/actions/task";
import { formatDue } from "@/lib/format";
import type { TaskStatus, TaskPriority } from "@prisma/client";

type Option = { id: string; name: string };
type Row = {
  id: string;
  name: string;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: Date | null;
  team: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  approver: { id: string; name: string } | null;
  dependsOn: { id: string; dependsOnTask: { id: string; name: string } }[];
};

export function PlanningBoard({
  campaignId,
  campaignEditable,
  tasks,
  teams,
  users,
  currentUser,
}: {
  campaignId: string;
  campaignEditable: boolean;
  tasks: Row[];
  teams: Option[];
  users: Option[];
  currentUser: { id: string; name: string };
}) {
  const [teamFilter, setTeamFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return tasks.filter((t) => {
      if (teamFilter && t.team?.id !== teamFilter) return false;
      if (ownerFilter && t.owner?.id !== ownerFilter) return false;
      if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [tasks, teamFilter, ownerFilter, search]);

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-10 items-center gap-2 rounded-[11px] border border-line bg-white px-3">
          <Search size={13} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหางาน…"
            className="w-40 text-[11px] outline-none"
          />
        </div>
        <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="h-10 rounded-[11px] border border-line bg-white px-3 text-[11px]">
          <option value="">ทุกทีม</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <select value={ownerFilter} onChange={(e) => setOwnerFilter(e.target.value)} className="h-10 rounded-[11px] border border-line bg-white px-3 text-[11px]">
          <option value="">ทุกเจ้าของ</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>

        {campaignEditable && (
          <div className="ml-auto flex gap-2">
            <TaskFormDialog
              mode="create"
              campaignId={campaignId}
              teams={teams}
              users={users}
              dependencyOptions={tasks.map((t) => ({ id: t.id, name: t.name }))}
              lockOwnerTo={currentUser}
            />
            <TaskFormDialog
              mode="create"
              campaignId={campaignId}
              teams={teams}
              users={users}
              dependencyOptions={tasks.map((t) => ({ id: t.id, name: t.name }))}
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-[17px] border border-line bg-white">
        <table className="w-full min-w-[900px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-line text-left text-[9px] font-extrabold uppercase tracking-wide text-muted">
              <th className="px-4 py-3">งาน</th>
              <th className="px-4 py-3">เจ้าของ</th>
              <th className="px-4 py-3">ทีม</th>
              <th className="px-4 py-3">ผู้อนุมัติ</th>
              <th className="px-4 py-3">กำหนดส่ง</th>
              <th className="px-4 py-3">ขึ้นอยู่กับ</th>
              <th className="px-4 py-3">ความสำคัญ</th>
              <th className="px-4 py-3">สถานะ</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-b border-[#f0f3f6] last:border-b-0 hover:bg-[#f9fbfd]">
                <td className="px-4 py-3 font-bold">
                  <Link href={`/tasks/${t.id}`} className="hover:text-primary-strong">
                    {t.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{t.owner?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{t.team?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{t.approver?.name ?? "—"}</td>
                <td className="px-4 py-3 text-muted">{t.dueDate ? formatDue(t.dueDate) : "—"}</td>
                <td className="px-4 py-3 text-muted">
                  {t.dependsOn.length ? t.dependsOn.map((d) => d.dependsOnTask.name).join(", ") : "—"}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={t.status} />
                </td>
                <td className="px-4 py-3">
                  {campaignEditable && t.status === "PLANNED" && (
                    <div className="flex justify-end gap-1.5">
                      <TaskFormDialog
                        mode="edit"
                        campaignId={campaignId}
                        teams={teams}
                        users={users}
                        dependencyOptions={[]}
                        task={{
                          id: t.id,
                          name: t.name,
                          teamId: t.team?.id ?? null,
                          ownerId: t.owner?.id ?? null,
                          approverId: t.approver?.id ?? null,
                          dueDate: t.dueDate,
                          priority: t.priority,
                        }}
                      />
                      <form action={deleteTaskAction.bind(null, t.id, campaignId)}>
                        <button className="grid h-8 w-8 place-items-center rounded-lg border border-line text-[#b14a4a] hover:bg-red-soft" aria-label="ลบงาน">
                          <Trash2 size={13} />
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-muted">
                  ไม่มีงานที่ตรงกับตัวกรองนี้
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
