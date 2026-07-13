"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getHistoryMsg } from "@/api/agentApi";
import { getProjectList } from "@/api/projectApi";
import { getWorkspaceList } from "@/api/workspaceApi";
import type { Project, ProjectFormat, Task, UserInfo, Workspace } from "@/api/types";
import { getUserInfo } from "@/api/userApi";
import ChatHistoryPanel from "@/components/workspace/ChatHistoryPanel";
import TaskList from "@/components/workspace/TaskList";
import WorkspaceUserBar from "@/components/workspace/WorkspaceUserBar";
import DokieBackground from "@/components/brand/DokieBackground";
import DokieLogo from "@/components/brand/DokieLogo";
import { clearAuth, getStoredUser, setAuth } from "@/lib/auth";
import {
  parseHistoryToChatMessages,
  type EvalChatMessage,
} from "@/lib/chatHistory";
import { getFormatLabel, getTaskDisplayName } from "@/lib/taskUtil";
import {
  buildWorkspaceUrl,
  parseWorkspaceUrl,
} from "@/lib/workspaceUrl";

export default function WorkspacePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const restoredFromUrlRef = useRef(false);
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
  const [user, setUser] = useState<UserInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [historyMessages, setHistoryMessages] = useState<EvalChatMessage[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const syncSelectionToUrl = useCallback(
    (taskId: number, projectId: number) => {
      router.replace(buildWorkspaceUrl({ taskId, projectId }), { scroll: false });
    },
    [router],
  );

  const applyMainAgentSelection = useCallback((task: Task) => {
    setCurrentTask(task);
    setActiveProjectId(task.main_agent_id);
    setActiveProjectFormat("main_agent");
    setSelectedProject(null);
    syncSelectionToUrl(task.task_id, task.main_agent_id);
  }, [syncSelectionToUrl]);

  const applySubProjectSelection = useCallback((task: Task, project: Project) => {
    setCurrentTask(task);
    setActiveProjectId(project.project_id ?? null);
    setActiveProjectFormat(project.project_format ?? null);
    setSelectedProject(project);
    if (project.project_id) {
      syncSelectionToUrl(task.task_id, project.project_id);
    }
  }, [syncSelectionToUrl]);

  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }

    getUserInfo()
      .then((res) => {
        if (res.error !== 0) {
          clearAuth();
          router.replace("/");
          return;
        }

        setAuth(res.data.user_info);
        setUser(res.data.user_info);
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
    if (loadingTasks || taskList.length === 0 || restoredFromUrlRef.current) {
      return;
    }

    const urlState = parseWorkspaceUrl(searchParams);
    if (!urlState) {
      restoredFromUrlRef.current = true;
      return;
    }

    restoredFromUrlRef.current = true;

    const task = taskList.find((item) => item.task_id === urlState.taskId);
    if (!task) {
      return;
    }

    if (task.main_agent_id === urlState.projectId) {
      setExpandedTaskIds((prev) =>
        prev.includes(task.task_id) ? prev : [...prev, task.task_id],
      );
      applyMainAgentSelection(task);
      return;
    }

    let cancelled = false;

    const restoreSubProject = async () => {
      setTaskProjectsLoadingByTaskId((prev) => ({ ...prev, [task.task_id]: true }));

      try {
        const res = await getProjectList(0, 100, "edit", "", task.task_id);
        if (cancelled) return;

        const projects = res.error === 0 ? (res.data.project_list ?? []) : [];
        setTaskProjectsByTaskId((prev) => ({ ...prev, [task.task_id]: projects }));

        const project = projects.find(
          (item) => item.project_id === urlState.projectId,
        );
        if (!project) return;

        setExpandedTaskIds((prev) =>
          prev.includes(task.task_id) ? prev : [...prev, task.task_id],
        );
        applySubProjectSelection(task, project);
      } catch {
        if (!cancelled) {
          setTaskProjectsByTaskId((prev) => ({ ...prev, [task.task_id]: [] }));
        }
      } finally {
        if (!cancelled) {
          setTaskProjectsLoadingByTaskId((prev) => ({
            ...prev,
            [task.task_id]: false,
          }));
        }
      }
    };

    void restoreSubProject();

    return () => {
      cancelled = true;
    };
  }, [
    applyMainAgentSelection,
    applySubProjectSelection,
    loadingTasks,
    searchParams,
    taskList,
  ]);

  useEffect(() => {
    if (!activeProjectId) {
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
          parseHistoryToChatMessages(res.data?.history_msg ?? []),
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
  }, [activeProjectId]);

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
    applyMainAgentSelection(task);
  };

  const handleSelectSubProject = (task: Task, project: Project) => {
    applySubProjectSelection(task, project);

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
      <div className="relative flex h-screen items-center justify-center">
        <DokieBackground variant="workspace" />
        <div className="relative text-sm text-mute">加载中...</div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen overflow-hidden bg-blue-3">
      <DokieBackground variant="workspace" />

      <aside className="relative z-10 flex w-[320px] shrink-0 flex-col border-e border-zinc-200/80 bg-white/95 backdrop-blur-sm">
        <div className="border-b border-zinc-200/80 px-4 py-4">
          <DokieLogo size="sm" subtitle="Eval" />
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

        <WorkspaceUserBar user={user} onLogout={handleLogout} />
      </aside>

      <main className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="border-b border-zinc-200/80 bg-white/90 px-6 py-4 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-default">
            {selectedProject
              ? selectedProject.project_name || "未命名项目"
              : currentTask
                ? getTaskDisplayName(currentTask)
                : "任务详情"}
          </h2>
          {selectedProject ? (
            <p className="mt-1 text-sm text-mute">
              {getFormatLabel(selectedProject.project_format)}
            </p>
          ) : currentTask ? (
            <p className="mt-1 text-sm text-blue">主 Agent</p>
          ) : (
            <p className="mt-1 text-sm text-mute">
              从左侧选择任务或子任务
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/70">
          {activeProjectId && currentTask ? (
            <ChatHistoryPanel
              key={activeProjectId}
              messages={historyMessages}
              loading={historyLoading}
              error={historyError}
              projectFormat={activeProjectFormat}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <div className="max-w-md text-center text-sm text-mute">
                {workspace
                  ? "从左侧选择任务或子任务"
                  : "暂无工作区"}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
