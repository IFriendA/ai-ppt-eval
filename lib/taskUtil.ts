import type { Project, ProjectFormat, Task } from "@/api/types";

const FORMAT_LABELS: Record<ProjectFormat, string> = {
  main_agent: "主 Agent",
  slide: "幻灯片",
  social: "社交媒体",
  scroll: "长图",
  draft: "草稿",
  image: "图片",
};

export function getFormatLabel(format?: ProjectFormat) {
  if (!format) return "项目";
  return FORMAT_LABELS[format] ?? format;
}

export function getTaskDisplayName(task: Pick<Task, "task_name" | "source">) {
  if (task.source === "mobile") {
    return "移动端任务";
  }

  return task.task_name?.trim() || "未命名任务";
}

export function isSubTaskProject(project: Project, mainAgentId?: number) {
  const normalizedName = project.project_name?.trim().toLowerCase();
  if (normalizedName === "main-agent") {
    return false;
  }

  if (mainAgentId && project.project_id === mainAgentId) {
    return false;
  }

  return true;
}

export function getSubTaskProjects(
  projects: Project[] | undefined,
  mainAgentId?: number,
) {
  return (projects ?? []).filter((project) =>
    isSubTaskProject(project, mainAgentId),
  );
}
