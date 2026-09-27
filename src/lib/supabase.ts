import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// The backend can be linked in two ways:
//   1. the builder writes VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY into .env
//   2. the owner pastes the two values into the setup page, which saves them in
//      this browser and reloads, so the whole app picks them up
// Either way the client is created lazily, so a page that does not touch data
// keeps working and any query fails with a clear message.

const STORE_KEY = "fresco.backend.v1";

export type BackendConfig = { url: string; anonKey: string };

function fromEnv(): BackendConfig | null {
  const url = import.meta.env.VITE_SUPABASE_URL ?? "";
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";
  return url && anonKey ? { url, anonKey } : null;
}

function fromStorage(): BackendConfig | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BackendConfig>;
    const url = typeof parsed.url === "string" ? parsed.url : "";
    const anonKey = typeof parsed.anonKey === "string" ? parsed.anonKey : "";
    return url && anonKey ? { url, anonKey } : null;
  } catch {
    return null;
  }
}

const config: BackendConfig | null = fromStorage() ?? fromEnv();

export const supabaseConfigured = config !== null;

/** The values in use right now, or null when no backend is linked. */
export function backendConfig(): BackendConfig | null {
  return config;
}

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (!client) {
    client = createClient(
      config?.url ?? "https://not-configured.supabase.co",
      config?.anonKey ?? "not-configured",
    );
  }
  return client;
}

/** Remember a project in this browser. The caller reloads to pick it up. */
export function saveBackend(next: BackendConfig): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    /* storage blocked: nothing we can do, the caller reports it */
  }
}

/** Forget the saved project and fall back to .env, if anything is there. */
export function clearBackend(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Check a project before saving it: the tables must exist and be readable.
 * Returns a message to show the owner, or null when the project is good.
 */
export async function probeBackend(url: string, anonKey: string): Promise<string | null> {
  try {
    const test = createClient(url, anonKey);
    const { error } = await test.from("services").select("id").limit(1);
    if (!error) return null;
    if (/does not exist|schema cache/i.test(error.message)) {
      return "That project is reachable, but the tables are not there yet. Run the setup script above first, then connect.";
    }
    if (/invalid api key|jwt|unauthorized/i.test(error.message)) {
      return "That anon key was not accepted. Copy it again from Project Settings, API, the row labelled anon public.";
    }
    if (/failed to fetch|network|load failed/i.test(error.message)) {
      return "Could not reach that project. Check the URL is exactly the one from Project Settings, API, and that you are online.";
    }
    return `Supabase said: ${error.message}`;
  } catch {
    return "Could not reach that project. Check the URL is exactly the one from Project Settings, API, and that you are online.";
  }
}

// Call sites use `supabase.from(...)`, `supabase.auth...` and so on. The proxy
// forwards each of those to the lazily created client.
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const active = getClient();
    const value: unknown = Reflect.get(active as object, prop, active);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(active);
    }
    return value;
  },
});
