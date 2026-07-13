export type WorkspaceUrlState = {
  taskId: number;
  projectId: number;
};

export function buildWorkspaceUrl({ taskId, projectId }: WorkspaceUrlState) {
  const params = new URLSearchParams({
    task_id: String(taskId),
    project_id: String(projectId),
  });
  return `/workspace?${params.toString()}`;
}

export function parseWorkspaceUrl(
  searchParams: Pick<URLSearchParams, "get">,
): WorkspaceUrlState | null {
  const taskId = Number(searchParams.get("task_id"));
  const projectId = Number(searchParams.get("project_id"));

  if (!Number.isFinite(taskId) || taskId <= 0) return null;
  if (!Number.isFinite(projectId) || projectId <= 0) return null;

  return { taskId, projectId };
}
