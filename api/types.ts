export type Res<T> = {
  data: T;
  error: number;
  msg: string;
};

export type UserInfo = {
  token?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  uid?: string;
  is_newer?: boolean;
};

export type ProjectFormat =
  | "slide"
  | "social"
  | "scroll"
  | "draft"
  | "main_agent"
  | "image";

export interface Project {
  project_id?: number;
  project_id_str?: string;
  project_name?: string;
  cover_img?: string;
  project_format?: ProjectFormat;
  project_status?: number;
  create_time?: number;
  update_time?: number;
}

export interface Task {
  task_id: number;
  task_id_str: string;
  task_name: string;
  main_agent_id: number;
  create_time: number;
  update_time: number;
  source?: string;
}

export interface Workspace {
  workspace_id: number;
  workspace_id_str: string;
  workspace_name: string;
  workspace_logo?: string;
  create_time: number;
  update_time: number;
  task_list: Task[];
}

export interface WorkspaceListRes {
  workspace_list: Workspace[];
}

export interface ProjectListRes {
  project_list: Project[];
}

export interface HistoryMsgParam {
  project_id: number;
  chat_msg_id: number;
  history_num: number;
}

export interface MessageUserMsg {
  msg?: string;
}

export interface HistoryMessage {
  chat_msg_id?: number;
  chat_msg_time?: number;
  msg_type: string;
  text_streaming_msg?: string;
  user_msg?: MessageUserMsg;
  tool_name?: string;
  tool_desc?: string;
  msg?: string;
}

export interface HistoryMsgRes {
  history_msg: HistoryMessage[];
}
