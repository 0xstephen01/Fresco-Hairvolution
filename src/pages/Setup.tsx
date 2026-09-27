import { useState } from "react";
import { Check, Copy, Database, Download, Link2, Loader2, Unlink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo, Wordmark } from "@/components/Brand";
import { navigate } from "@/lib/router";
import { backendConfig, clearBackend, probeBackend, saveBackend } from "@/lib/supabase";
import schema from "../../supabase/schema.sql?raw";

const lineCount = schema.split("\n").length;

export function Setup() {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [anonKey, setAnonKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const linked = backendConfig();

  async function copy() {
    try {
      await navigator.clipboard.writeText(schema);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
      return;
    } catch {
      /* fall through to the manual selection below */
    }
    const area = document.getElementById("schema-text");
    if (area) {
      const range = document.createRange();
      range.selectNodeContents(area);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }

  function download() {
    const blob = new Blob([schema], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "fresco-supabase-setup.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  async function connect(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const cleanUrl = url.trim().replace(/\/+$/, "");
    const cleanKey = anonKey.trim();

    if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(cleanUrl)) {
      setError("That does not look like a project URL. It should look like https://abcdefgh.supabase.co");
      return;
    }
    if (cleanKey.length < 40) {
      setError("That does not look like the anon key. It is a long string starting with eyJ.");
      return;
    }

    setBusy(true);
    try {
      const problem = await probeBackend(cleanUrl, cleanKey);
      if (problem) {
        setError(problem);
        return;
      }
      saveBackend({ url: cleanUrl, anonKey: cleanKey });
      setDone(true);
      window.setTimeout(() => window.location.reload(), 900);
    } finally {
      setBusy(false);
    }
  }

  function disconnect() {
    clearBackend();
    window.location.reload();
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="flex items-center gap-2.5">
          <Logo />
          <Wordmark className="text-base" />
        </div>

        <div className="mt-8 flex items-center gap-2 text-primary">
          <Database className="size-4" />
          <p className="eyebrow">Database setup</p>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
          Connect your Supabase project
        </h1>
        <p className="mt-3 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Two steps. First run the script below in Supabase, then paste your project URL and anon key
          here. Once connected, bookings reach you from any device and the owner area uses your real
          email and password instead of the PIN.
        </p>

        <div className="mt-6 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Link2 className="size-4 text-primary" />
            <h2 className="text-sm font-semibold tracking-tight">Your project</h2>
          </div>

          {linked ? (
            <>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Connected to <span className="font-medium text-foreground">{linked.url}</span>.
                Bookings are being saved to your database.
              </p>
              <Button
                variant="outline"
                onClick={disconnect}
                className="mt-4 h-11 rounded-full px-5"
              >
                <Unlink className="size-4" /> Disconnect
              </Button>
            </>
          ) : (
            <>
              <ol className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">1.</span> Open your project's API
                  settings:{" "}
                  <a
                    href="https://supabase.com/dashboard/project/_/settings/api"
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium text-primary underline underline-offset-4"
                  >
                    supabase.com/dashboard → Project Settings → API
                  </a>
                  . If the link opens the wrong project, pick yours from the project list first.
                </li>
                <li>
                  <span className="font-medium text-foreground">2.</span> Copy the line headed{" "}
                  <span className="font-medium text-foreground">Project URL</span>. It looks like
                  https://abcdefgh.supabase.co
                </li>
                <li>
                  <span className="font-medium text-foreground">3.</span> Under{" "}
                  <span className="font-medium text-foreground">Project API keys</span>, copy the row
                  labelled <span className="font-medium text-foreground">anon</span> /{" "}
                  <span className="font-medium text-foreground">public</span>. It is a long string
                  starting with eyJ.
                </li>
                <li>
                  <span className="font-medium text-foreground">4.</span> Paste both below and press
                  Connect.
                </li>
              </ol>

              <form onSubmit={connect} className="mt-5">
              <label htmlFor="project-url" className="text-sm font-medium">
                Project URL
              </label>
              <Input
                id="project-url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError("");
                }}
                placeholder="https://abcdefgh.supabase.co"
                autoComplete="off"
                spellCheck={false}
                className="mt-2 h-11"
                aria-invalid={Boolean(error)}
              />
              <label htmlFor="anon-key" className="mt-4 block text-sm font-medium">
                anon public key
              </label>
              <Input
                id="anon-key"
                value={anonKey}
                onChange={(e) => {
                  setAnonKey(e.target.value);
                  setError("");
                }}
                placeholder="eyJhbGciOi..."
                autoComplete="off"
                spellCheck={false}
                className="mt-2 h-11"
                aria-invalid={Boolean(error)}
              />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Both are on Supabase under Project Settings, API. The anon key is meant to be public;
                the security rules in the script are what protect your data. Never paste the
                service_role key here.
              </p>
              {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={busy} className="mt-4 h-11 rounded-full px-5">
                {done ? (
                  <>
                    <Check className="size-4" /> Connected
                  </>
                ) : busy ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Checking…
                  </>
                ) : (
                  <>
                    <Link2 className="size-4" /> Connect
                  </>
                )}
              </Button>
              </form>
            </>
          )}
        </div>

        <h2 className="mt-10 text-lg font-semibold tracking-tight">
          Step 1: the script you paste into Supabase
        </h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-muted-foreground">
          Open your Supabase project, go to SQL Editor, New query, paste this whole script and press
          Run. You should see "Success. No rows returned". Then create your owner login under
          Authentication, Users, Add user, with your email and a password.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button onClick={copy} className="h-11 rounded-full px-5">
            {copied ? (
              <>
                <Check className="size-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="size-4" /> Copy the whole script
              </>
            )}
          </Button>
          <Button variant="outline" onClick={download} className="h-11 rounded-full px-5">
            <Download className="size-4" /> Download as a file
          </Button>
          <span className="text-sm text-muted-foreground">
            {lineCount} lines, {schema.length.toLocaleString()} characters
          </span>
        </div>

        <pre
          id="schema-text"
          className="mt-4 max-h-[60vh] overflow-auto rounded-xl border border-border bg-card p-4 text-xs leading-relaxed sm:p-5"
        >
          <code>{schema}</code>
        </pre>

        <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-muted-foreground sm:p-5">
          If Supabase shows an error, it starts with <code>ERROR:</code> and a code such as{" "}
          <code>42601</code>. Send that message over and the script can be fixed to match. The most
          common cause is a partial paste, where the last few lines get cut off.
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" className="h-11 rounded-full px-5" onClick={() => navigate("/")}>
            Back to the site
          </Button>
          <Button
            variant="ghost"
            className="h-11 rounded-full px-5"
            onClick={() => navigate("/admin")}
          >
            Owner area
          </Button>
        </div>
      </div>
    </main>
  );
}
