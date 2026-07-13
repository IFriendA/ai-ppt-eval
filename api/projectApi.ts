import { post } from "@/api/http";
import type { ProjectFormat, ProjectListRes, Res } from "@/api/types";

export const getProjectList = (
  page: number,
  pageSize: number,
  sortType: "edit" | "create" = "edit",
  format: "" | ProjectFormat = "",
  taskId?: number,
): Promise<Res<ProjectListRes>> =>
  post("/project/list", {
    page,
    page_size: pageSize,
    sort_by: sortType,
    format,
    task_id: taskId,
  });
