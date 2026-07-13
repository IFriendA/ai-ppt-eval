import { post } from "@/api/http";
import type { Res, Task, Workspace, WorkspaceListRes } from "@/api/types";

type WorkspaceTaskApi = {
  id: number;
  name: string;
  task_id_str?: string;
  main_agent_project_id: number;
  create_time: number;
  update_time: number;
  source?: string;
};

type WorkspaceApi = {
  workspace_id?: number;
  workspace_id_str?: string;
  id?: number;
  workspace_name?: string;
  name?: string;
  workspace_logo?: string;
  logo?: string;
  logo_url?: string;
  create_time: number;
  update_time?: number;
  task_list: WorkspaceTaskApi[];
};

function normalizeWorkspaceTask(task: WorkspaceTaskApi): Task {
  return {
    task_id: task.id,
    task_id_str: task.task_id_str ?? "",
    task_name: task.name,
    main_agent_id: task.main_agent_project_id,
    create_time: task.create_time ?? 0,
    update_time: task.update_time ?? 0,
    source: task.source,
  };
}

function normalizeWorkspaceList(workspaceList: WorkspaceApi[]): Workspace[] {
  return workspaceList.map((workspace) => ({
    workspace_id: workspace.workspace_id ?? workspace.id ?? 0,
    workspace_id_str: workspace.workspace_id_str ?? "",
    workspace_name: workspace.workspace_name ?? workspace.name ?? "",
    workspace_logo:
      workspace.workspace_logo ?? workspace.logo_url ?? workspace.logo ?? "",
    create_time: workspace.create_time ?? 0,
    update_time: workspace.update_time ?? workspace.create_time ?? 0,
    task_list: (workspace.task_list ?? []).map(normalizeWorkspaceTask),
  }));
}

export const getWorkspaceList = async (): Promise<Res<WorkspaceListRes>> => {
  const res = await post<
    WorkspaceListRes & { workspace_list: WorkspaceApi[] }
  >("/workspace/list");

  return {
    ...res,
    data: {
      ...res.data,
      workspace_list: normalizeWorkspaceList(res.data?.workspace_list ?? []),
    },
  };
};
