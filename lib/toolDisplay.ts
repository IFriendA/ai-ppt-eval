import type { ToolCallDisplay } from "@/lib/chatHistory";

type ToolDisplayInfo = {
  label: string;
  colorClass: string;
};

const TOOL_DISPLAY_MAP: Record<string, ToolDisplayInfo> = {
  name_project_tool: { label: "项目命名", colorClass: "text-orange-600" },
  name_workspace_task_tool: { label: "任务命名", colorClass: "text-orange-600" },
  dispatch_task_tool: { label: "子任务调度", colorClass: "text-blue" },
  callback_main_tool: { label: "返回主 Agent", colorClass: "text-blue" },
  memory_view_tool: { label: "查看记忆", colorClass: "text-purple-600" },
  memory_update_tool: { label: "更新记忆", colorClass: "text-purple-600" },
  web_search_tool: { label: "网页搜索", colorClass: "text-sky-600" },
  img_search_tool: { label: "图片搜索", colorClass: "text-sky-600" },
  img_gen_tool: { label: "图片生成", colorClass: "text-purple-600" },
  file_analysis_tool: { label: "文件分析", colorClass: "text-cyan-600" },
  outline_tool: { label: "大纲生成", colorClass: "text-orange-600" },
  slide_tool_add: { label: "添加页面", colorClass: "text-purple-600" },
  slide_tool_multi_add: { label: "批量添加", colorClass: "text-purple-600" },
  slide_tool_del: { label: "删除页面", colorClass: "text-purple-600" },
  slide_tool_edit: { label: "编辑页面", colorClass: "text-purple-600" },
  slide_tool_move: { label: "移动页面", colorClass: "text-purple-600" },
  slide_style_tool: { label: "样式选择", colorClass: "text-purple-600" },
  slide_tool_get: { label: "查看页面", colorClass: "text-sky-600" },
  draft_write_tool: { label: "撰写草稿", colorClass: "text-orange-600" },
  draft_edit_tool: { label: "修改草稿", colorClass: "text-violet-600" },
  draft_get_tool: { label: "查看草稿", colorClass: "text-violet-600" },
  tavily_search_tool: { label: "搜索", colorClass: "text-sky-600" },
  tavily_extract_tool: { label: "提取", colorClass: "text-sky-600" },
  tavily_crawl_tool: { label: "爬取", colorClass: "text-sky-600" },
  tavily_map_tool: { label: "站点地图", colorClass: "text-sky-600" },
  tavily_research_tool: { label: "调研", colorClass: "text-sky-600" },
};

const HIDDEN_TOOL_NAMES = new Set(["ui_update_tool", "todo_write_tool"]);

export function isHiddenTool(toolName: string) {
  return HIDDEN_TOOL_NAMES.has(toolName);
}

export function getToolDisplayLabel(tool: ToolCallDisplay) {
  const info = TOOL_DISPLAY_MAP[tool.tool_name];
  if (!info) return tool.tool_name;

  if (tool.tool_name === "dispatch_task_tool") {
    const action = (
      tool.tool_ext as { dispatch_task_info?: { action?: string } } | undefined
    )?.dispatch_task_info?.action;

    if (action === "create") return "创建子任务";
    if (action === "modify") return "修改子任务";
  }

  return info.label;
}

export function getToolDisplayInfo(toolName: string) {
  return TOOL_DISPLAY_MAP[toolName];
}
