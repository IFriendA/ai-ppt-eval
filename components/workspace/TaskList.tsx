"use client";

import type { Project, ProjectFormat, Task } from "@/api/types";
import TaskItem from "@/components/workspace/TaskItem";
import {
  getFormatLabel,
  getSubTaskProjects,
  getTaskDisplayName,
} from "@/lib/taskUtil";

type TaskListProps = {
  taskList: Task[];
  expandedTaskIds: number[];
  taskProjectsByTaskId: Record<number, Project[] | undefined>;
  taskProjectsLoadingByTaskId: Record<number, boolean | undefined>;
  currentTaskId: number | null;
  activeProjectId: number | null;
  activeProjectFormat: ProjectFormat | null;
  onToggleExpand: (taskId: number) => void;
  onSelectMainAgent: (task: Task) => void;
  onSelectSubProject: (task: Task, project: Project) => void;
};

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={[
        "size-3.5 transition-transform",
        expanded ? "rotate-90" : "",
      ].join(" ")}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

export default function TaskList({
  taskList,
  expandedTaskIds,
  taskProjectsByTaskId,
  taskProjectsLoadingByTaskId,
  currentTaskId,
  activeProjectId,
  activeProjectFormat,
  onToggleExpand,
  onSelectMainAgent,
  onSelectSubProject,
}: TaskListProps) {
  if (taskList.length === 0) {
    return (
      <div className="px-4 py-8 text-center text-sm text-mute">
        暂无任务
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-2 py-3">
      {taskList.map((task) => {
        const isExpanded = expandedTaskIds.includes(task.task_id);
        const isTaskSelected = currentTaskId === task.task_id;
        const isMainAgentActive =
          isTaskSelected &&
          activeProjectFormat === "main_agent" &&
          activeProjectId === task.main_agent_id;
        const taskProjects = taskProjectsByTaskId[task.task_id];
        const isLoading = taskProjectsLoadingByTaskId[task.task_id];
        const subTasks = getSubTaskProjects(taskProjects, task.main_agent_id);

        return (
          <div key={task.task_id} className="flex flex-col gap-0.5">
            <TaskItem
              active={isMainAgentActive}
              label={getTaskDisplayName(task)}
              leading={<ChevronIcon expanded={isExpanded} />}
              onClick={() => {
                onToggleExpand(task.task_id);
                onSelectMainAgent(task);
              }}
            />

            {isExpanded ? (
              <div className="flex flex-col gap-0.5">
                {isLoading ? (
                  <div className="px-6 py-2 text-xs text-mute">
                    加载子任务...
                  </div>
                ) : null}

                {!isLoading && subTasks.length === 0 ? (
                  <div className="px-6 py-2 text-xs text-mute">
                    暂无子任务
                  </div>
                ) : null}

                {subTasks.map((project) => {
                  const isActive =
                    isTaskSelected &&
                    activeProjectId === project.project_id &&
                    activeProjectFormat === project.project_format;

                  return (
                    <TaskItem
                      key={project.project_id}
                      indent
                      active={isActive}
                      label={project.project_name?.trim() || "未命名项目"}
                      leading={
                        <span className="size-1.5 rounded-full bg-current opacity-60" />
                      }
                      trailing={getFormatLabel(project.project_format)}
                      onClick={() => onSelectSubProject(task, project)}
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
