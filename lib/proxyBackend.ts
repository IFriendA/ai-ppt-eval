import { NextRequest } from "next/server";

const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

export function getBackendBaseUrl(): string {
  const baseUrl = process.env.BACKEND_BASE_API;

  if (!baseUrl) {
    throw new Error("BACKEND_BASE_API is not configured");
  }

  return baseUrl.replace(/\/$/, "");
}

function buildBackendUrl(pathSegments: string[], search: string): string {
  const backendBase = getBackendBaseUrl();
  const path = pathSegments.join("/");
  const url = new URL(path, `${backendBase}/`);

  url.search = search;

  return url.toString();
}

function copyHeaders(source: Headers, target: Headers) {
  source.forEach((value, key) => {
    if (!HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
      target.set(key, value);
    }
  });
}

export async function proxyToBackend(
  request: NextRequest,
  pathSegments: string[],
): Promise<Response> {
  const url = buildBackendUrl(pathSegments, request.nextUrl.search);
  const headers = new Headers();

  copyHeaders(request.headers, headers);

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
  }

  const response = await fetch(url, init);
  const responseHeaders = new Headers();

  copyHeaders(response.headers, responseHeaders);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
