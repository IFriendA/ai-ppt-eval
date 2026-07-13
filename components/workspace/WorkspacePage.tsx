"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHistoryMsg } from "@/api/agentApi";
import { getProjectList } from "@/api/projectApi";
import { getWorkspaceList } from "@/api/workspaceApi";
import type { Project, ProjectFormat, Task, Workspace } from "@/api/types";
import { getUserInfo } from "@/api/userApi";
import ChatHistoryPanel from "@/components/workspace/ChatHistoryPanel";
import TaskList from "@/components/workspace/TaskList";
import { clearAuth, getStoredUser, setAuth } from "@/lib/auth";
import {
  parseHistoryMessages,
  type ChatDisplayMessage,
} from "@/lib/chatHistory";
import { getFormatLabel, getTaskDisplayName } from "@/lib/taskUtil";

export default function WorkspacePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [taskList, setTaskList] = useState<Task[]>([]);
  const [expandedTaskIds, setExpandedTaskIds] = useState<number[]>([]);
  const [taskProjectsByTaskId, setTaskProjectsByTaskId] = useState<
    Record<number, Project[]>
  >({});
  const [taskProjectsLoadingByTaskId, setTaskProjectsLoadingByTaskId] =
    useState<Record<number, boolean>>({});
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<number | null>(null);
  const [activeProjectFormat, setActiveProjectFormat] =
    useState<ProjectFormat | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [userLabel, setUserLabel] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<ChatDisplayMessage[]>(
    [],
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserLabel(storedUser.nickname || storedUser.email || "用户");
    }

    getUserInfo()
      .then((res) => {
        if (res.error !== 0) {
          clearAuth();
          router.replace("/");
          return;
        }

        setAuth(res.data.user_info);
        setUserLabel(
          res.data.user_info.nickname ||
            res.data.user_info.email ||
            "用户",
        );
      })
      .catch(() => {
        clearAuth();
        router.replace("/");
      })
      .finally(() => {
        setCheckingAuth(false);
      });
  }, [router]);

  useEffect(() => {
    if (checkingAuth) return;

    setLoadingTasks(true);
    setError(null);

    getWorkspaceList()
      .then((res) => {
        if (res.error !== 0) {
          setError(res.msg || "加载任务列表失败");
          return;
        }

        const nextWorkspace = res.data.workspace_list[0] ?? null;
        setWorkspace(nextWorkspace);
        setTaskList(nextWorkspace?.task_list ?? []);
      })
      .catch(() => {
        setError("加载任务列表失败");
      })
      .finally(() => {
        setLoadingTasks(false);
      });
  }, [checkingAuth]);

  useEffect(() => {
    if (
      activeProjectFormat !== "main_agent" ||
      !activeProjectId ||
      selectedProject
    ) {
      setHistoryMessages([]);
      setHistoryError(null);
      setHistoryLoading(false);
      return;
    }

    let cancelled = false;

    setHistoryLoading(true);
    setHistoryError(null);
    setHistoryMessages([]);

    getHistoryMsg({
      project_id: activeProjectId,
      chat_msg_id: -1,
      history_num: 40,
    })
      .then((res) => {
        if (cancelled) return;

        if (res.error !== 0) {
          setHistoryError(res.msg || "加载历史消息失败");
          return;
        }

        setHistoryMessages(
          parseHistoryMessages(res.data?.history_msg ?? []),
        );
      })
      .catch(() => {
        if (!cancelled) {
          setHistoryError("加载历史消息失败");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeProjectId, activeProjectFormat, selectedProject]);

  const fetchTaskProjects = async (taskId: number) => {
    if (taskProjectsByTaskId[taskId] || taskProjectsLoadingByTaskId[taskId]) {
      return;
    }

    setTaskProjectsLoadingByTaskId((prev) => ({ ...prev, [taskId]: true }));

    try {
      const res = await getProjectList(0, 100, "edit", "", taskId);
      const projects = res.error === 0 ? (res.data.project_list ?? []) : [];

      setTaskProjectsByTaskId((prev) => ({ ...prev, [taskId]: projects }));
    } catch {
      setTaskProjectsByTaskId((prev) => ({ ...prev, [taskId]: [] }));
    } finally {
      setTaskProjectsLoadingByTaskId((prev) => ({ ...prev, [taskId]: false }));
    }
  };

  const handleToggleExpand = (taskId: number) => {
    const isExpanded = expandedTaskIds.includes(taskId);

    if (isExpanded) {
      setExpandedTaskIds((prev) => prev.filter((id) => id !== taskId));
      return;
    }

    setExpandedTaskIds((prev) => [...prev, taskId]);
    void fetchTaskProjects(taskId);
  };

  const handleSelectMainAgent = (task: Task) => {
    setCurrentTask(task);
    setActiveProjectId(task.main_agent_id);
    setActiveProjectFormat("main_agent");
    setSelectedProject(null);
  };

  const handleSelectSubProject = (task: Task, project: Project) => {
    setCurrentTask(task);
    setActiveProjectId(project.project_id ?? null);
    setActiveProjectFormat(project.project_format ?? null);
    setSelectedProject(project);

    if (!expandedTaskIds.includes(task.task_id)) {
      setExpandedTaskIds((prev) => [...prev, task.task_id]);
      void fetchTaskProjects(task.task_id);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.replace("/");
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-sm text-zinc-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-zinc-100">
      <aside className="flex w-[320px] shrink-0 flex-col border-e border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-4 py-4">
          <h1 className="text-base font-semibold text-zinc-900">AI PPT Eval</h1>
          <p className="mt-1 truncate text-xs text-zinc-500">{userLabel}</p>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingTasks ? (
            <div className="px-4 py-8 text-center text-sm text-zinc-500">
              加载任务中...
            </div>
          ) : error ? (
            <div className="px-4 py-8 text-center text-sm text-red-600">
              {error}
            </div>
          ) : (
            <TaskList
              taskList={taskList}
              expandedTaskIds={expandedTaskIds}
              taskProjectsByTaskId={taskProjectsByTaskId}
              taskProjectsLoadingByTaskId={taskProjectsLoadingByTaskId}
              currentTaskId={currentTask?.task_id ?? null}
              activeProjectId={activeProjectId}
              activeProjectFormat={activeProjectFormat}
              onToggleExpand={handleToggleExpand}
              onSelectMainAgent={handleSelectMainAgent}
              onSelectSubProject={handleSelectSubProject}
            />
          )}
        </div>

        <div className="border-t border-zinc-200 p-3">
          <button
            type="button"
            className="h-9 w-full cursor-pointer rounded-lg border border-zinc-200 text-sm text-zinc-600 transition hover:bg-zinc-50"
            onClick={handleLogout}
          >
            退出登录
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-zinc-900">
            {selectedProject
              ? selectedProject.project_name || "未命名项目"
              : currentTask
                ? getTaskDisplayName(currentTask)
                : "任务详情"}
          </h2>
          {selectedProject ? (
            <p className="mt-1 text-sm text-zinc-500">
              {getFormatLabel(selectedProject.project_format)}
            </p>
          ) : currentTask ? (
            <p className="mt-1 text-sm text-zinc-500">主 Agent</p>
          ) : (
            <p className="mt-1 text-sm text-zinc-500">
              从左侧选择任务或子任务
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-zinc-50">
          {selectedProject ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-md text-center text-sm text-zinc-500">
                已选择子任务，消息内容将在下一步接入
              </div>
            </div>
          ) : currentTask && activeProjectFormat === "main_agent" ? (
            <ChatHistoryPanel
              messages={historyMessages}
              loading={historyLoading}
              error={historyError}
            />
          ) : currentTask ? (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-md text-center text-sm text-zinc-500">
                已选择主 Agent，可展开任务查看子任务
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-md text-center text-sm text-zinc-500">
                {workspace
                  ? `当前工作区：${workspace.workspace_name}`
                  : "暂无工作区"}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
