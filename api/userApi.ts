import { post } from "@/api/http";
import type { Res, UserInfo } from "@/api/types";

export const sendEmailCode = (
  url: string,
  email: string,
): Promise<Res<null>> => post("/user/send_email_code", { url, email });

export const loginEmail = (
  email: string,
  code: string,
): Promise<Res<UserInfo>> => post("/user/login_email", { email, code });

export const getUserInfo = (): Promise<Res<{ user_info: UserInfo }>> =>
  post("/user/info");
