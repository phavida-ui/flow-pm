"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Search, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { PriorityBadge } from "@/components/priority-badge";
import { SimpleStatusBadge } from "@/components/simple-status-badge";
import { TaskFormDialog } from "@/components/task-form-dialog";
import { deleteTaskAction } from "@/app/actions/task";
import { formatDue } from "@/lib/format";
import { toSimpleStatus, SIMPLE_STATUS_ORDER } from "@/lib/task-status";
import type { TaskStatus, TaskPriority } from "@prisma/client";

type Option = { id: string; name: string };
type Row = {
  id: string;
  name: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority | null;
  dueDate: Date | null;
  team: { id: string; name: string } | null;
  owner: { id: string; name: string } | null;
  approver: { id: string; name: string } | null;
  dependsOn: { id: string; dependsOnTask: { id: string; name: string } }[];
};

function TaskTable({
  rows,
  campaignId,
  campaignEditable,
  canManage,
  teams,
  users,
}: {
  rows: Row[];
  campaignId: string;
  campaignEditable: boolean;
  canManage: boolean;
  teams: Option[];
  users: Option[];
}) {
  const [pending, startTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<{ id: string; message: string } | null>(null);

  function handleDelete(t: Row) {
    if (!window.confirm(`ลบงาน "${t.name}" ใช่หรือไม่? การกระทำนี้ย้อนกลับไม่ได้`)) return;
    setDeleteError(null);
    startTransition(async () => {
      try {
        await deleteTaskAction(t.id, campaignId);
      } catch (err) {
        setDeleteError({ id: t.id, message: err instanceof Error ? err.message : "เกิดข้อผิดพลาด" });
      }
    });
  }

  return (
    <div className="overflow-x-auto rounded-[17px] border border-line bg-white">
      <table className="w-full min-w-[900px] border-collapse text-[11px]">
        <thead>
          <tr className="border-b border-line text-left text-[9px] font-extrabold uppercase tracking-wide text-muted">
            <th className="px-4 py-3">งาน</th>
            <th className="px-4 py-3">คนรับผิดชอบ</th>
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
          {rows.map((t) => (
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
                {((campaignEditable && t.status === "PLANNED") || canManage) && (
                  <div className="grid justify-items-end gap-1">
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
                          description: t.description,
                          teamId: t.team?.id ?? null,
                          ownerId: t.owner?.id ?? null,
                          approverId: t.approver?.id ?? null,
                          dueDate: t.dueDate,
                          priority: t.priority,
                        }}
                      />
                      <button
                        disabled={pending}
                        onClick={() => handleDelete(t)}
                        className="grid h-8 w-8 place-items-center rounded-lg border border-line text-[#b14a4a] hover:bg-red-soft disabled:opacity-40"
                        aria-label="ลบงาน"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    {deleteError?.id === t.id && (
                      <p className="max-w-[200px] text-right text-[9px] font-semibold text-red">{deleteError.message}</p>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="px-4 py-10 text-center text-muted">
                ไม่มีงานที่ตรงกับตัวกรองนี้
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PlanningBoard({
  campaignId,
  campaignEditable,
  canManage,
  tasks,
  teams,
  users,
  currentUser,
}: {
  campaignId: string;
  campaignEditable: boolean;
  canManage: boolean;
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
          <option value="">ทุกคน</option>
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

      {campaignEditable ? (
        <TaskTable rows={filtered} campaignId={campaignId} campaignEditable={campaignEditable} canManage={canManage} teams={teams} users={users} />
      ) : (
        <div className="grid gap-5">
          {SIMPLE_STATUS_ORDER.map((simple) => {
            const rows = filtered.filter((t) => toSimpleStatus(t) === simple);
            if (rows.length === 0) return null;
            return (
              <div key={simple} className="grid gap-2.5">
                <div className="flex items-center gap-2">
                  <SimpleStatusBadge status={simple} />
                  <span className="text-[10px] font-bold text-muted">{rows.length} งาน</span>
                </div>
                <TaskTable rows={rows} campaignId={campaignId} campaignEditable={campaignEditable} canManage={canManage} teams={teams} users={users} />
              </div>
            );
          })}
          {(() => {
            const notStarted = filtered.filter((t) => t.status === "PLANNED");
            if (notStarted.length === 0) return null;
            return (
              <div className="grid gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-lg bg-[#edf1f5] px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-[#6f7b8d]">
                    ยังไม่เริ่ม
                  </span>
                  <span className="text-[10px] font-bold text-muted">{notStarted.length} งาน</span>
                </div>
                <TaskTable rows={notStarted} campaignId={campaignId} campaignEditable={campaignEditable} canManage={canManage} teams={teams} users={users} />
              </div>
            );
          })()}
          {filtered.length === 0 && (
            <TaskTable rows={[]} campaignId={campaignId} campaignEditable={campaignEditable} canManage={canManage} teams={teams} users={users} />
          )}
        </div>
      )}
    </div>
  );
}
