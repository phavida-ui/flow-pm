import "server-only";
import { prisma } from "@/server/db";

export type DependencyEdge = { taskId: string; dependsOnTaskId: string };

/**
 * Edges are "taskId depends on dependsOnTaskId" (dependsOnTaskId must finish first).
 * Adding a new edge (taskId, dependsOnTaskId) creates a cycle iff dependsOnTaskId is
 * already reachable by walking *downstream* from taskId (i.e. taskId is already an
 * ancestor requirement of dependsOnTaskId).
 */
export function wouldCreateCycle(
  edges: DependencyEdge[],
  candidate: DependencyEdge
): boolean {
  if (candidate.taskId === candidate.dependsOnTaskId) return true;

  const downstream = new Map<string, string[]>();
  for (const edge of edges) {
    const list = downstream.get(edge.dependsOnTaskId) ?? [];
    list.push(edge.taskId);
    downstream.set(edge.dependsOnTaskId, list);
  }

  const stack = [...(downstream.get(candidate.taskId) ?? [])];
  const visited = new Set<string>();

  while (stack.length) {
    const node = stack.pop()!;
    if (node === candidate.dependsOnTaskId) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    stack.push(...(downstream.get(node) ?? []));
  }

  return false;
}

/** Detects whether the full graph (as given) contains any cycle. */
export function hasCycle(edges: DependencyEdge[]): boolean {
  const downstream = new Map<string, string[]>();
  const nodes = new Set<string>();
  for (const edge of edges) {
    nodes.add(edge.taskId);
    nodes.add(edge.dependsOnTaskId);
    const list = downstream.get(edge.dependsOnTaskId) ?? [];
    list.push(edge.taskId);
    downstream.set(edge.dependsOnTaskId, list);
  }

  const WHITE = 0;
  const GRAY = 1;
  const BLACK = 2;
  const color = new Map<string, number>();
  for (const n of nodes) color.set(n, WHITE);

  function visit(node: string): boolean {
    color.set(node, GRAY);
    for (const next of downstream.get(node) ?? []) {
      const c = color.get(next);
      if (c === GRAY) return true;
      if (c === WHITE && visit(next)) return true;
    }
    color.set(node, BLACK);
    return false;
  }

  for (const n of nodes) {
    if (color.get(n) === WHITE && visit(n)) return true;
  }
  return false;
}

/** Given all deps for a campaign and completed task ids, which tasks have zero unresolved deps? */
export function computeUnblockedTaskIds(
  taskIds: string[],
  edges: DependencyEdge[],
  completedTaskIds: Set<string>
): Set<string> {
  const depsByTask = new Map<string, string[]>();
  for (const edge of edges) {
    const list = depsByTask.get(edge.taskId) ?? [];
    list.push(edge.dependsOnTaskId);
    depsByTask.set(edge.taskId, list);
  }

  const unblocked = new Set<string>();
  for (const id of taskIds) {
    const deps = depsByTask.get(id) ?? [];
    if (deps.every((d) => completedTaskIds.has(d))) unblocked.add(id);
  }
  return unblocked;
}

export class CycleError extends Error {
  constructor(message = "This would create a circular dependency") {
    super(message);
    this.name = "CycleError";
  }
}

async function getCampaignEdges(campaignId: string): Promise<DependencyEdge[]> {
  const tasks = await prisma.task.findMany({
    where: { campaignId },
    select: { id: true },
  });
  const taskIds = tasks.map((t) => t.id);
  const deps = await prisma.taskDependency.findMany({
    where: { taskId: { in: taskIds } },
    select: { taskId: true, dependsOnTaskId: true },
  });
  return deps;
}

export async function addDependency(campaignId: string, taskId: string, dependsOnTaskId: string) {
  const edges = await getCampaignEdges(campaignId);
  const candidate = { taskId, dependsOnTaskId };

  if (wouldCreateCycle(edges, candidate)) {
    throw new CycleError();
  }

  return prisma.taskDependency.create({ data: candidate });
}

export async function removeDependency(dependencyId: string) {
  return prisma.taskDependency.delete({ where: { id: dependencyId } });
}

export async function isTaskUnblocked(taskId: string): Promise<boolean> {
  const deps = await prisma.taskDependency.findMany({
    where: { taskId },
    select: { dependsOnTask: { select: { status: true } } },
  });
  return deps.every((d) => d.dependsOnTask.status === "COMPLETED");
}

export async function campaignHasCycle(campaignId: string): Promise<boolean> {
  const edges = await getCampaignEdges(campaignId);
  return hasCycle(edges);
}
