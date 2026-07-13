import { post } from "@/api/http";
import type { HistoryMsgParam, HistoryMsgRes, Res } from "@/api/types";

export const getHistoryMsg = (
  param: HistoryMsgParam,
): Promise<Res<HistoryMsgRes>> => post("/agent/history_msg", param);
