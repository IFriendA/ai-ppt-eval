import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/proxyBackend";

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

async function handle(request: NextRequest, context: RouteContext) {
  const { path = [] } = await context.params;

  try {
    return await proxyToBackend(request, path);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === "BACKEND_BASE_API is not configured"
    ) {
      return Response.json(
        { error: "BACKEND_BASE_API is not configured" },
        { status: 500 },
      );
    }

    throw error;
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const OPTIONS = handle;
export const HEAD = handle;
