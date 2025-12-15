type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX || "";
const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_BASE_URL || "";
const WS_PREFIX = process.env.NEXT_PUBLIC_WS_PREFIX || "";
const REQUEST_TIMEOUT_MS = Number(process.env.NEXT_PUBLIC_REQUEST_TIMEOUT_MS || 15000);
const DEBUG = String(process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS || "false") === "true";

function trimSlashes(value: string): string {
  return value.replace(/\/+$/g, "").replace(/^\/+/, "");
}

export function getApiBase(): string {
  const base = trimSlashes(API_BASE_URL);
  const prefix = trimSlashes(API_PREFIX);
  if (!base) return "";
  return prefix ? `${base}/${prefix}` : base;
}

export function getWsBase(): string {
  const base = trimSlashes(WS_BASE_URL);
  const prefix = trimSlashes(WS_PREFIX);
  if (!base) return "";
  return prefix ? `${base}/${prefix}` : base;
}

export function buildApiUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
  const base = getApiBase();
  const cleanPath = trimSlashes(path);
  let url = base ? `${base}/${cleanPath}` : `/${cleanPath}`;
  if (query && Object.keys(query).length) {
    const params = new URLSearchParams();
    for (const [key, val] of Object.entries(query)) {
      if (val !== undefined && val !== null) params.append(key, String(val));
    }
    const qs = params.toString();
    if (qs) url += `?${qs}`;
  }
  return url;
}

export function buildWsUrl(path: string): string {
  const base = getWsBase();
  const cleanPath = trimSlashes(path);
  return base ? `${base}/${cleanPath}` : `/${cleanPath}`;
}

export async function fetchJson<T = unknown>(
  path: string,
  options: {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
    timeoutMs?: number;
    credentials?: RequestCredentials;
  } = {}
): Promise<T> {
  const { method = "GET", headers = {}, body, query, timeoutMs = REQUEST_TIMEOUT_MS, credentials } = options;
  const url = buildApiUrl(path, query);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1, timeoutMs));

  const finalHeaders: Record<string, string> = {
    "Accept": "application/json",
    ...headers,
  };

  let payload: BodyInit | undefined = undefined;
  if (body !== undefined) {
    // Solo serializa JSON si no se especificó Content-Type o está como JSON
    const contentType = Object.keys(finalHeaders).find(h => h.toLowerCase() === "content-type");
    const isJson = !contentType || finalHeaders[contentType] === "application/json";
    if (isJson) {
      finalHeaders[contentType || "Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    } else {
      // Se asume que el caller pasó un BodyInit válido (FormData, Blob, etc.)
      payload = body as BodyInit;
    }
  }

  if (DEBUG) {
    // eslint-disable-next-line no-console
    console.debug("fetchJson", { url, method, headers: finalHeaders, body: body, timeoutMs });
  }

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payload,
      signal: controller.signal,
      credentials,
    });
    clearTimeout(timer);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const error = new Error(`HTTP ${res.status} ${res.statusText}: ${text}`);
      (error as any).status = res.status;
      (error as any).body = text;
      throw error;
    }
    const contentType = res.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      return (await res.json()) as T;
    }
    // Si no es JSON, retornamos texto; el caller puede ajustar el tipo genérico
    return (await res.text()) as unknown as T;
  } catch (err) {
    clearTimeout(timer);
    if ((err as any)?.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw err;
  }
}

export async function fetchVoid(
  path: string,
  options: {
    method?: HttpMethod;
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined>;
    timeoutMs?: number;
    credentials?: RequestCredentials;
  } = {}
): Promise<void> {
  await fetchJson<string>(path, options);
}

export const api = {
  buildApiUrl,
  buildWsUrl,
  getApiBase,
  getWsBase,
  fetchJson,
  fetchVoid,
};
