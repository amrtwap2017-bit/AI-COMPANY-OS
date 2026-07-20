// Triangle Black - Environment Configuration
// Program A - Task A5
// Single source of truth for all environment variables.
// Fixes: Two different API URL fallbacks across files.

const get = (key: string, fallback = ""): string =>
  process.env[key] || fallback;

export const env = {
  apiUrl:      get("NEXT_PUBLIC_API_URL",       "http://localhost:8030"),
  aiEngineUrl: get("NEXT_PUBLIC_AI_ENGINE_URL", "http://localhost:8001"),
  appName:     get("NEXT_PUBLIC_APP_NAME",      "Triangle Black"),
  appEnv:      get("NEXT_PUBLIC_APP_ENV",       "development"),
  authBypass:  get("NEXT_PUBLIC_AUTH_BYPASS",   "false") === "true",

  get apiBase(): string {
    return this.apiUrl + "/api/v1";
  },
  get isDev():  boolean { return this.appEnv === "development"; },
  get isProd(): boolean { return this.appEnv === "production"; },
} as const;

export default env;
